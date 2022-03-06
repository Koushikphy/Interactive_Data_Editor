const Plotly = require('plotly.js-gl3d-dist');
// const url    = require('url')
const $      = require('../lib/jquery.min')
const {dialog,BrowserWindow} = remote;
const {clamp, clone, expRotate, parseData, transpose, alertElec} = require('../js/utils')
const {layout, colorList, iniPointsD } = require('../js/plotUtils')

const xCol   = document.getElementById("xCol")
const yCol   = document.getElementById("yCol")
const zCol   = document.getElementById("zCol")
const sCol   = document.getElementById("sCol")
const slider = document.getElementById('range')
const thumb  = document.getElementById('thumb')
const figurecontainer = document.getElementById("figurecontainer")


var fullData = [], fullDataCols = [], fileNames = [], saveNames = [], legendNames = [],
    data = [], dpsx = [], dpsy = [], index = [], saved = true, firstSave = true,
    col = {x: 0, y: 0, z: 0,s: 0}, currentEditable = 0, xName = "X";
    lockXc = 1, swapped = 0, issame = false, swapper = false, ddd = false, oldDpsLen=0,
    th_in = 0, undoStack = [], redoStack = [];


Plotly.newPlot(figurecontainer, [clone(iniPointsD)], clone(layout), {
    displaylogo:false,
    editable: true,
    responsive: true,
    modeBarButtonsToRemove : ["toImage","sendDataToCloud"],
    modeBarButtonsToAdd    : [[{
        name: 'Save the image',
        icon: Plotly.Icons.camera,
        click(){ $('#popupEx').show() }
    }]]
});
var points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");


enableMenu  = (list)=> { for(let i of list) menu.getMenuItemById(i).enabled = true}
disableMenu = (list)=> { for(let i of list) menu.getMenuItemById(i).enabled = false}
hideMenu    = (list)=> { for(let i of list) menu.getMenuItemById(i).visible = false}
visibleMenu = (list)=> { for(let i of list) menu.getMenuItemById(i).visible = true}



function showStatus(msg){
    let toast = document.createElement('div')
    toast.className = 'toast'
    toast.innerHTML = `<p style="margin: 0;">${msg}</p>
    <div class="toastTail" onclick=this.parentElement.remove()>
        <div class="toastCross">X</div>
    </div>`
    document.getElementById('toastContainer').appendChild(toast)
    setTimeout(function(){toast.classList.add('toastIn')},50 ) //slight flicker animation
    setTimeout(function(){ toast.remove()}, 4321 ) // 4321 miliseconds to fade
}


function setUpFor2d(){
    $('.3D').hide()
    $('#yLabel').html('X')
    $('#zLabel').html('Y')
    col = store.get("cols2d",{x: 0, y: 0, z: 0,s: 0})
    // col.x=0
    enableMenu(['save', 'saveas', 'tfs','tpl', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','rgft', 'lmfit','smt'])
    disableMenu(["tax", '3dview'])
}


function setUpFor3d(){
    $('.3D').show()
    $('#yLabel').html('Y')
    $('#zLabel').html('Z')
    setUpSlider();
    col= store.get("cols3d",{x: 0, y: 0, z: 0,s: 0})
    enableMenu(['save', 'saveas', 'tfs','tpl', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','tax', '3dview','smt'])
    disableMenu(["rgft", 'lmfit'])
}


function setUpColumns(){
    for(let i in col) col[i] = col[i] < data[0].length ? col[i] : 0
    $("#xCol, #yCol, #zCol, #sCol").html(data[0].map((_,i)=>`<option>${i+1}</option>`).join(''))
    xCol.selectedIndex = col.x;
    yCol.selectedIndex = col.y;
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
}


function updateData(init=false,all=true) {
    if(!init){
        col.x = xCol.selectedIndex;
        col.y = yCol.selectedIndex;
        col.z = zCol.selectedIndex;
    }
    th_in = 0;

    if (!swapped){
        store.set(ddd? "cols3d" : "cols2d", col)
        // localStorage.setItem( ddd? "cols3d" : "cols2d", JSON.stringify(col));
    } else{
        [col.x, col.y] = [col.y, col.x]
    }

    fullDataCols[currentEditable] = JSON.parse(JSON.stringify(col));
    legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${(swapped? col.x: col.y) + 1}:${col.z + 1}`

    if(ddd) setUpSlider()

    updatePlot(all);
    startDragBehavior();
    updateOnServer();
};


function fileOpener(fname){
    try{
        return parseData(fs.readFileSync(fname, "utf8"))
    } catch(err) {
        if (err.code === 'ENOENT') {
            recentFiles = recentFiles.filter(x => x != fname);
            recentMenu();
            alertElec("File doesn't exist", 1, "Can't open file")
        }
    }
}


function fileLoader() {
    var fname = dialog.showOpenDialogSync(remote.getCurrentWindow(),{
        defaultPath: recentLocation,
        properties: ['openFile',"multiSelections"]
    });
    if (fname !== undefined) {
        fileReader(fname[0]);
        for (let i = 1; i < fname.length; i++) {
            addNewFile(fname[i])

        }
    }
}


function fileReader(fname) {
    if (!saved) var res = dialog.showMessageBoxSync(remote.getCurrentWindow(),{
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to open a new file without saving the changes?",
        buttons: ['Yes', "No"]
    });
    if (res) return;


    data = fileOpener(fname)
    ddd = data.length != 1;

    //clear everything....
    swapped = 0; xName = "X"; saved=true, index=[];
    issame = false; firstSave = true; swapper = false;
    undoStack = []; redoStack = []; swapperIsOn = false;

    if(figurecontainer.data.length>1) { // delete extra traces
        Plotly.deleteTraces(figurecontainer,Plotly.d3.range(1,figurecontainer.data.length))
        if(currentEditable!=0){
            Plotly.update(figurecontainer, {... clone(iniPointsD), x:[[1]], y:[[1]]}, clone(layout))
            $(`.scatterlayer .trace:first-of-type .points path`).css({'pointer-events':'all'})
            points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");
            currentEditable = 0
        }
    }


    let dirname   = path.dirname(fname);
    let filename  = path.basename(fname, path.extname(fname));
    let extn      = path.extname(fname);
    let save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation= dirname;

    fullDataCols = [clone(col)]
    fullData     = [data]
    fileNames    = [fname]
    saveNames    = [save_name]
    legendNames  = [path.basename(fname) + ` ${col.y+1}:${col.z+1}`]

    ddd ? setUpFor3d() : setUpFor2d();
    setUpColumns();
    updateData(true,false);
    showStatus('Data file loaded ...');

    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
    store.set('recent',recentLocation);
    resizePlot();

    $("#particle").remove();
    document.getElementById('branding').style.display = 'block'
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    $('#sCol,#sColInp,#filler,#extendUtils2D').hide()
    $("#rgFit,#lmFit,#smooth").hide()
    $("#zCol").removeClass("rightBorder")
    saveRemminder()
    makeRows()
    analytics.add('fileLoaded')
}



function addNewFileDialog() {
    if (swapped) alertElec("Plot along X before adding a new file.",0,"Can't add the file!!!")

    var fname = dialog.showOpenDialogSync(remote.getCurrentWindow(),{
        defaultPath: recentLocation,
        properties: ['openFile',"multiSelections"]
    });
    if (fname !== undefined) for(let i of fname) addNewFile(i);
}


function addNewFile(fname) {
    dat = fileOpener(fname)
    if (fullData[0].length != dat.length) alertElec("Trying to open a file with different grid.\nThis is not supported for 3D data.",1,"Can't add the file!!!")


    let dirname = path.dirname(fname);
    let filename = path.basename(fname, path.extname(fname));
    let extn = path.extname(fname);
    let save_name = path.join(dirname, filename + "_new" + extn);

    fullData.push(dat); //add at the end
    fullDataCols.push(clone(col));
    fileNames.push(fname);
    saveNames.push(save_name);
    legendNames.push(path.basename(fname) + ` ${col.y + 1}:${col.z + 1}`)
    addTrace();
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
    makeRows();
    analytics.add('fileAdded');
}

function addTrace(){
    let ind = fullData.length-1
    let thisTrace = {
        ... clone(iniPointsD),
        x : fullData[ind][th_in][fullDataCols[ind].y],
        y : fullData[ind][th_in][fullDataCols[ind].z],
        name : legendNames[ind]
    }

    delete thisTrace.marker.color
    delete thisTrace.line.color

    Plotly.addTraces(figurecontainer, thisTrace);
}


var cRange=false,cRangeY=[NaN, NaN]; //hidden feature
function setCutRange(){
    if(!cRange) return
    // should also include other traces if they are currently plotted
    let a=Math.min(...dpsy), b=Math.max(...dpsy);
    let [aY,bY] = cRangeY;
    a = isNaN(aY)? a: Math.max(aY,a)
    b = isNaN(bY)? b: Math.min(bY,b)

    // upper cutoff is lower than the min value or lower cutoff is bigger than max value
    if(a>b) a=b-1 // improve this

    ab = (b-a)*.03 // gives a slight padding in range
    range = [a-ab, b+ab ]
    Plotly.relayout(figurecontainer, {"yaxis.autorange":false,"yaxis.range":[a-ab, b+ab ], "xaxis.autorange":true})
}


function updatePlot(all = true) {
    //true means just update the current plot i.e. 0th, leave others as it is.
    if (swapperIsOn) {
        Plotly.restyle(figurecontainer, {
            'x': [data[th_in][col.y], data[th_in][col.y]],
            'y': [data[th_in][col.z], data[th_in][col.s]],
            'name': [ col.z,col.s].map(e=> path.basename(fileNames[0]) + ` ${(swapped? col.x: col.y) +1}:${e+1}`)
        })
    } else if (all) {
        Plotly.restyle(figurecontainer, {
            'x': fullData.map((el,i)=>el[th_in][fullDataCols[i].y]),
            'y': fullData.map((el,i)=>el[th_in][fullDataCols[i].z]),
            'name' : legendNames
        })
    } else {
        Plotly.restyle(figurecontainer, {
            'x': [data[th_in][col.y]],
            'y': [data[th_in][col.z]],
            "name":[legendNames[currentEditable]]
        }, currentEditable)
    }


    dpsy = data[th_in][col.z]
    dpsx = data[th_in][col.y]
    dpsx.forEach((_,i)=> points[i].index = i)
    setCutRange()
}



function sliderChanged(shift=0){
    if((shift==-1 && th_in==0) || (shift==+1 && th_in==data.length-1)) return
    th_in +=shift
    let max = data.length-1;
    let xPX = th_in * (figurecontainer.offsetWidth -6 - thumb.offsetWidth) / max+3;
    thumb.style.left = `${xPX}px`
    thumb.innerText = `${xName}=${data[th_in][col.x][0]}`
    updatePlot();
    if(oldDpsLen!=dpsx.length){
        startDragBehavior()
        oldDpsLen=dpsx.length
    }
}


function setUpSlider(){
    slider.max = data.length - 1
    slider.value = 0;
    thumb.innerText = `${xName}=${data[0][col.x][0]}`
    thumb.style.left = `${3}px`
    slider.oninput = function(){
        th_in = parseInt(slider.value);
        sliderChanged()
    }
}


function colChanged(value) {
    col.z = value;

    if(smooth.isActive){
        fullDataCols[0].z = fullDataCols[1].z = value;
        updatePlot(all=true)
        updateOnServer()
        return
    }

    fullDataCols[currentEditable].z = col.z = value;
    legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${(swapped? col.x: col.y) + 1}:${col.z + 1}`
    updatePlot(all = false);

    updateOnServer();
    if(oldDpsLen!=dpsx.length){
        $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'all'})
        startDragBehavior()
        oldDpsLen=dpsx.length
    }
    if (!swapped) store.set(ddd? "cols3d" : "cols2d", col);
    makeRows()

};


function colsChanged(value) {
    col.s = value;
    updatePlot();
    if (!swapped) store.set("cols3d", col);
};


function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    var oldDatX, oldDatY, pIndex;

    drag.origin(function () {
        saveOldData();
        let [x,y] = this.getAttribute('transform').slice(10,-1).split(/,| /);
        pIndex = this.index
        if (index.length) {
            oldDatY = dpsy.slice(0)
            if (!lockXc) oldDatX = dpsx.slice(0)
        }
        return {x,y}
    })

    drag.on("drag", function () {
        let yaxis = figurecontainer._fullLayout.yaxis;
        let yVal = clamp(yaxis.p2l(d3.event.y), ...yaxis.range);
        dpsy[pIndex] = yVal //dpsy is a reference to data, so this also modifies the data
        for (let i of index) dpsy[i] = yVal - oldDatY[pIndex] + oldDatY[i]
        if (lockXc) {
            Plotly.restyle(figurecontainer, {y: [dpsy]}, currentEditable)
        } else {// move in x direction
            let xaxis = figurecontainer._fullLayout.xaxis;
            let xVal = clamp(xaxis.p2l(d3.event.x), ...xaxis.range);
            dpsx[pIndex] = xVal
            for (let i of index) dpsx[i] = xVal - oldDatX[pIndex] + oldDatX[i]
            Plotly.restyle(figurecontainer, {x: [dpsx], y: [dpsy]}, currentEditable)
        };
    });
    drag.on("dragend", ()=>{
        fullData[currentEditable] = data
        updateOnServer()
    } )
    d3.selectAll(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).call(drag);
};


function keyBoardDrag(moveDown) {
    var yaxis = figurecontainer._fullLayout.yaxis;
    var add = yaxis.p2l(1) - yaxis.p2l(0);
    if (moveDown) add = -add;
    for (let i of index) dpsy[i] += add
    Plotly.restyle(figurecontainer, {y: [dpsy]}, currentEditable)
}


var exportAll = false, counter=0, timer;
function updateOnServer() {
    // data operations are very frequent to sending all of them is overkill, lets send them every 10 operations
    if(counter%10==0) analytics.add('ops')
    counter++

    if (!viewerWindow) return;
    clearTimeout(timer);
    timer = setTimeout(()=>{  //send updated value only once within .5 sec
        if(!exportAll) {
            let cx = swapped? col.y: col.x
            let cy = swapped? col.x: col.y
            var s_data = [[
                fullData[currentEditable].map(i=>i[cx]),
                fullData[currentEditable].map(i=>i[cy]),
                fullData[currentEditable].map(i=>i[col.z])
            ]]
        } else{
            var s_data = fullData.map((el,j)=>[
                el.map(i=>i[swapped? fullDataCols[j].y: fullDataCols[j].x]),
                el.map(i=>i[swapped? fullDataCols[j].x: fullDataCols[j].y]),
                el.map(i=>i[fullDataCols[j].z])
            ])
        }
        viewerWindow.webContents.send("sdata", [s_data, swapped, col.z, data[0].length]);
    },500) // a half second pause before sending the data
}



function changeEditable(index,reset=false){
    if(smooth.isActive){
        // when smooth mode is on just change the editable so that the other trace can be sent to the 3d Viewer
        currentEditable = currentEditable ? 0:1;
        if(ddd) updateOnServer()
        return
    }
    if (swapperIsOn) {
        [col.s, col.z] = [col.z, col.s]
        sCol.selectedIndex = col.s;
        zCol.selectedIndex = col.z;
        colsChanged(col.s);
        updateOnServer();
        return
    }
    $(`.scatterlayer .trace .points path`).css({'pointer-events':'none'})

    let line1 = figurecontainer._fullData[currentEditable].line
    let marker1 = figurecontainer._fullData[currentEditable].marker

    let line2 = figurecontainer._fullData[index].line
    let marker2 = figurecontainer._fullData[index].marker

    line1.dash = Number(line1.dash) // weird but _fullData store dash as string
    line2.dash = Number(line2.dash)

    Plotly.restyle(figurecontainer, {
        line : [line2, line1],
        marker: [marker2, marker1]
    }, [currentEditable, index])

    if (fullData[currentEditable][0].length != fullData[index][0].length) setUpColumns()
    currentEditable = index

    $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'all'})
    points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points`)
            .getElementsByTagName("path");

    if(reset) return // used for reset

    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    dpsx.forEach((_,i)=>{points[i].index = i})
    startDragBehavior();
    firstSave = true; undoStack = []; redoStack = []
    zCol.selectedIndex = col.z
    document.title = "Interactive Data Editor - " + replaceWithHome(fileNames[currentEditable])
    updateOnServer()
}


function changeEditable2(ind){ // used for deleting trace below the currenteditable
    if (swapperIsOn) return
    // $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'none'})
    currentEditable = ind
    $(`.scatterlayer .trace .points path`).css({'pointer-events':'none'})
    $(`.scatterlayer .trace:nth-of-type(${ind+1}) .points path`).css({'pointer-events':'all'})
    points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${ind+1}) .points`).getElementsByTagName("path");
    dpsx.forEach((_,i)=>{points[i].index = i})
}


var swapperIsOn = false
function openSwapper() {
    if (fileNames.length!=1) alertElec("Can't use this feature when multiple files are open.",0,"Operation Unavailable")
    let thisTrace = {
        ... iniPointsD,
        x : data[th_in][col.y],
        y : data[th_in][col.s],
        name : path.basename(fileNames[0]) + ` ${col.y +1}:${col.s +1}`
    }
    thisTrace.line.color = thisTrace.marker.color = colorList[1]
    Plotly.addTraces(figurecontainer, thisTrace)
    Plotly.relayout(figurecontainer, {selectdirection: 'h'} )

    swapperIsOn = true;
    $("#sCol, #sColInp").show();
    $("#zCol").addClass("rightBorder")
    disableMenu(['edat','fill','filter','af','arf','smt'])
}


function exitSwapper() {
    swapperIsOn = false
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {selectdirection: 'any'});
    data = fullData[0]
    $("#sCol, #sColInp").hide();
    $("#zCol").removeClass("rightBorder")
    enableMenu(['edat','fill','filter','af','arf','smt'])
}


function saveAs() {
    var tmp_name = dialog.showSaveDialogSync({
        title: "Save As:",
        defaultPath: saveNames[currentEditable]
    });
    if (tmp_name === undefined) return
    saveNames[currentEditable] = tmp_name;
    saveData();
    firstSave = false;
}


function saveData() {
    if(saved) return
    var tmpData = swapped ? expRotate(data, col.y, col.x) : data
    // https://www.npmjs.com/package/d3-format#locale_formatPrefix
    //^ using d3 format, `g` means decimal/exponent notation, rounded to significant digits
    // TODO: let the users chose what format to use for each column along with delimiter.
    const fmt = Plotly.d3.format(".8g")
    try {
        var txt = tmpData.map(x => transpose(x).map( y=>y.map(fmt).join('\t')).join('\n')).join('\n\n')
        fs.writeFileSync(saveNames[currentEditable], txt);
        showStatus("Data Saved in file " + replaceWithHome(saveNames[currentEditable]));
        saved = true;
        saveRemminder();
        analytics.add('saved')
    } catch (error) {
        showStatus("Something went wrong! Couldn't save the data...")
        console.error(error)
        return false;
    }
};


// plots along a different axis
function isswap() {
    if (!data.length) return;

    // ! TODO: dont not use double exprotate, decide beforehand if its required or not
    for (let i = 0; i < fullData.length; i++) {
        [fullDataCols[i].x, fullDataCols[i].y] = [fullDataCols[i].y, fullDataCols[i].x]
        fullData[i] = expRotate(fullData[i], fullDataCols[i].x, fullDataCols[i].y)
    }

    if (fullData.length>1 && !fullData.every(v => v.length == fullData[0].length)) { // reverse back
        for (let i = 0; i < fullData.length; i++) {
            [fullDataCols[i].x, fullDataCols[i].y] = [fullDataCols[i].y, fullDataCols[i].x]
            fullData[i] = expRotate(fullData[i], fullDataCols[i].x, fullDataCols[i].y)
        }
        alertElec("File(s) have different grid points along the Y axis.", 0, "Can't Plot along Y!!!")
    }
    swapped = !swapped;

    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    xName = swapped ? "Y" : "X"
    updateData();
};



function saveOldData() {
    if (!data.length) return;
    redoStack = [];
    let olddata = JSON.stringify([th_in, col, swapped, data[th_in]]);
    if (undoStack.length == 10) undoStack.splice(0, 1);
    undoStack.push(olddata);
    saved = false;
}


function reDo() {
    if (!redoStack.length) return;
    let olddata = redoStack.pop();
    undoStack.push(JSON.stringify([th_in, col, swapped, data[th_in]]));
    doIt(olddata);
}


function unDo() {
    if (!undoStack.length) return;
    let olddata = undoStack.pop()
    redoStack.push(JSON.stringify([th_in, col, swapped, data[th_in]]));
    doIt(olddata);
}


function doIt(olddata) {
    var arr, tmpSwapped, tmpTh_in;
    [tmpTh_in, col, tmpSwapped, arr] = JSON.parse(olddata);
    if (tmpSwapped != swapped) isswap();

    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
    th_in = tmpTh_in
    data[th_in] = arr;

    sliderChanged()
    updatePlot(all = false);
    startDragBehavior();
    updateOnServer();
    saved = false;
}




function settingWindow(){
    let settingEditWindow = new BrowserWindow({
        minHeight: 700,
        minWidth:600,
        show: false,
        title: "Interactive Data Editor - Plot Settings",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        }
    });
    // settingEditWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, "pop.html"),
    //     protocol: 'file:',
    //     slashes: true
    // }));
    settingEditWindow.loadFile("src/html/pop.html")
    settingEditWindow.setMenuBarVisibility(false);

    settingEditWindow.webContents.once("dom-ready", function () {

        let lay = figurecontainer.layout
        let plot = figurecontainer.data.map((el,i)=>({
            "Title" : el.name,
            "Style" : el.mode,
            "Marker" : {
                ...el.marker, // color is removed as colorway is used for easy iteration, get it from full
                "color":figurecontainer._fullData[i].marker.color
            },
            "Line" : {
                ...el.line,
                "color":figurecontainer._fullData[i].line.color
            }
        }))

        // if (!app.isPackaged) settingEditWindow.webContents.openDevTools();
        settingEditWindow.webContents.send("plotsetting", [lay, plot]);
    })
    settingEditWindow.show()
}


var editorWindow=null
function spreadsheet() {
    if(editorWindow) {
        editorWindow.focus()
        return
    }
    editorWindow = new BrowserWindow({
        minWidth: 1200,
        title: "Interactive Data Editor",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        }
    });
    editorWindow.maximize();
    // editorWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, "spreadsheet.html"),
    //     protocol: 'file:',
    //     slashes: true
    // }));
    editorWindow.loadFile("src/html/spreadsheet.html")
    editorWindow.setMenuBarVisibility(false);

    editorWindow.show();
    editorWindow.on("closed", function () { editorWindow = null })

    // if (!app.isPackaged) editorWindow.webContents.openDevTools();
    editorWindow.webContents.once("dom-ready", function () {
        editorWindow.webContents.send("slider", [xName, col.x, data]);
    })
}


var viewerWindow=null; // this variable is used inside the update on server function
function openViewer() {
    if(viewerWindow) {
        viewerWindow.focus()
        return
    }
    viewerWindow = new BrowserWindow({
        show: false,
        title: "Interactive Data Editor",
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        }
    });
    viewerWindow.maximize();
    // viewerWindow.loadURL(url.format({
    //     pathname: path.join(__dirname, '3D_Viewer.html'),
    //     protocol: 'file:',
    //     slashes: true
    // }));
    viewerWindow.loadFile('src/html/3D_Viewer.html')
    viewerWindow.on("closed", function () { viewerWindow = null; exportAll=false })
    viewerWindow.show();
    viewerWindow.setMenuBarVisibility(false);
    // if (!app.isPackaged) viewerWindow.webContents.openDevTools();
    viewerWindow.webContents.once("dom-ready", updateOnServer)
};





var minWidth, curWidth;

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > minWidth && x < window.innerWidth / 2.5) {
            $('#sidebar').width(x - 2);
            curWidth = x;
            resizePlot()
        }
    })
});



$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});


function openNav() {
    $("#sidebar").css("width",curWidth)
    $("#sidebar").css("border-width","1")
    setTimeout(resizePlot,100)
    makeRows()
}


function closeNav() {
    if (!$('#sidebar').width()) return
    $("#sidebar").css("width","0")
    setTimeout( resizePlot,100)
    setTimeout(()=>{
        $("#sidebar").css("border-width","0")
    },50)
}



function tools(option,index,ev,elem){
    ev.stopPropagation()
    if(ev.target.localName=="select") return
    if(option==0){ //select editable
        if(currentEditable!=index) changeEditable(index)
    }else if (option==1) { // clone this
        fullData.push(fullData[index]); //not cloning same file
        fullDataCols.push(clone(fullDataCols[index]))
        fileNames.push(fileNames[index])
        saveNames.push(saveNames[index])
        legendNames.push(clone(legendNames[index]))
        addTrace()

    }else if(option==2) { // close this
        if(fileNames.length==1) return // nothing to delete here
        if(index==currentEditable) return
        if(index <=currentEditable) changeEditable2(currentEditable-1) // currentEditable is changed within the function
        Plotly.deleteTraces(figurecontainer,index)
        fullData.splice(index,1)
        fullDataCols.splice(index,1)
        fileNames.splice(index,1)
        saveNames.splice(index,1)
        legendNames.splice(index,1)
    }
    if(exportAll && currentEditable!=index) updateOnServer()
    makeRows()
}

function tools2(option,index,ev,elem){
    ev.stopPropagation()
    let val = elem.selectedIndex
    if(index==currentEditable){
        if(option=='z'){
            colChanged(val)
            zCol.selectedIndex = val
        }else if(option=='y'){
            yCol.selectedIndex = val
            updateData()
        }else if(option=='x'){
            xCol.selectedIndex=val
            updateData()
        }
    }else{
        fullDataCols[index][option] = val
        let colC = fullDataCols[index]
        legendNames[index] = path.basename(fileNames[index]) + ` ${(swapped? colC.x: colC.y) + 1}:${colC.z + 1}`
        updatePlot(true)
        if (exportAll) updateOnServer()
    }
}

function makeRows() {
    $('#files').html(
        fileNames.map((i,j)=>`
            <div class="fList ${currentEditable==j? 'selected': ''}"  onclick="tools(0,${j},event,this)" >
                <div class="nameBar">
                    <div class="fName" title='file name'>
                        ${j+1}. ${path.basename(i)}
                    </div>
                    <img class="fcpyBtn" title='Use this file' src="./copy.svg" onclick="tools(1,${j},event)"">
                    <img class="fclsBtn" title='Remove this file' src="./close.svg" onclick="tools(2,${j},event)">
                </div>

                <div class="colBar">
                    <div class="sideBar" style="display:${ddd?"inline-flex":"none"}" >
                        <span>X</span>
                        <select onchange="tools2('x',${j},event,this)">
                            ${fullData[j][0].map((_,k)=>`<option ${k==fullDataCols[j].x? "selected": ""} >${k+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sideBar">
                        <span>${ddd?"Y":"X"}</span>
                        <select onchange="tools2('y',${j},event,this)">
                            ${fullData[j][0].map((_,k)=>`<option ${k==fullDataCols[j].y? "selected": ""} >${k+1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sideBar">
                        <span>${ddd?"Z":"Y"}</span>
                        <select onchange="tools2('z',${j},event,this)">
                            ${fullData[j][0].map((_,k)=>`<option ${k==fullDataCols[j].z? "selected": ""} >${k+1}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>`
        ).join(' '))
        curWidth = minWidth = $(".colBar").width()+30
}





class Analytics{
    constructor(){
        // read from userdata if client id is already given or is it a new client
        this.cid = store.get('cid')
        if(this.cid===undefined){
            const { v4: uuidv4} = require('uuid');
            this.cid = uuidv4()
            store.set('cid', this.cid)
        }
        var shown = store.get('shown',0)
        store.set('shown',shown+1)
        if(shown%10==0){ // shown after every 10 opening
            setTimeout(()=>{
            dialog.showMessageBox(remote.getCurrentWindow(),{
                message:"User data share policy",
                type: "info",
                title: "Note from developer !",
                detail: "Interactive Data Editor will collect and share user data with the developer to give a better user experience. Only data related to the software usage will be collected, and any sensitive information associated with the user's system will not be shared.",
            });
        },300)
        }
        // now read the analytics id, read from .env file
        this.uuid = fs.readFileSync(path.join(app.getAppPath(),'.env'),'utf8').trim()
        this.queue = store.get('analyticsQueue',[])
        // do not send analytics in testing mode
        this.add()
        // send analytics data only in production, otherwise dev mode will spam the data
        if(app.isPackaged) {
            this.send() // send the load event immidiately
            setInterval(this.send.bind(this),1000*60*10) // send every 10 minutes
        }
    }

    // analytics will save all the data in a queue and send all together in a single POST to analytics server every 5 minutes.
    add(page='home'){
        this.queue.push(page)
        store.set('analyticsQueue',this.queue)
    }

    // Starting from version 10, Interactive Data Editor will collect and share user data with the developer to give a  better user experience. Only data related to the software usage will be collected, and any sensitive information associated with the user's system will not be shared.
    send(){
        if(this.queue.length==0) return
        const type='pageview'
        fetch('https://www.google-analytics.com/batch', {
            method: 'POST',
            body: this.queue.map(e=>`v=1&t=${type}&tid=${this.uuid}&cid=${this.cid}&dp=${e}`).join('\n')
        }).then(d=>{
            if(d.status==200) {
                // analytics send successful
                this.queue = []
                store.set('analyticsQueue',this.queue)
            }else {
                console.error("Cannot post to analytics server")
            }
        })
    }
}


const analytics = new Analytics()