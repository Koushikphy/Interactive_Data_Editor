const Plotly = require('plotly.js-gl3d-dist');
const fs     = require("fs");
const path   = require('path')
const url    = require('url')
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
    lockXc = 1, swapped = 0, issame = false, swapper = false, ddd = false,
    th_in = 0, undoStack = [], redoStack = [], isAxesLocked=false;


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
hideMenu    = (list)=> { for(let i of list) menu.getMenuItemById(i).visible = true}
visibleMenu = (list)=> { for(let i of list) menu.getMenuItemById(i).visible = false}



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
    var fl = JSON.parse(localStorage.getItem("cols2d"));
    if (fl !== null) col = fl
    col.x=0
    enableMenu(['save', 'saveas', 'tfs','tpl', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','rgft', 'lmfit'])
    disableMenu(["pax", '3dview'])
}


function setUpFor3d(){
    $('.3D').show()
    $('#yLabel').html('Y')
    $('#zLabel').html('Z')
    setUpSlider();
    var fl = JSON.parse(localStorage.getItem("cols3d"));
    if (fl !== null) col = fl
    enableMenu(['save', 'saveas', 'tfs','tpl', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','pax', '3dview'])
    disableMenu(["rgft", 'lmfit'])
}


function setUpColumns(){
    for(let i in col) col[i] = col[i] < data[0].length ? col[i] : 0
    var op = "";
    for (var i = 1; i <= data[0].length; i++) op += `<option>${i}</option>`
    $("#xCol, #yCol, #zCol, #sCol").html(op)
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
        localStorage.setItem( ddd? "cols3d" : "cols2d", JSON.stringify(col));
    } else{
        [col.x, col.y] = [col.y, col.x]
    }
    if(isAxesLocked){
        for(let i=0; i<fullDataCols.length; i++) {
            fullDataCols[i] = JSON.parse(JSON.stringify(col))
            legendNames[i] = path.basename(fileNames[i]) + ` ${col.y + 1}:${col.z + 1}`
        }
    } else {
        fullDataCols[currentEditable] = JSON.parse(JSON.stringify(col));
        legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${col.y + 1}:${col.z + 1}`
    }

    if(ddd) setUpSlider()

    updatePlot(all);
    startDragBehavior();
    updateOnServer();
};


function fileLoader() {
    const fname = dialog.showOpenDialogSync(remote.getCurrentWindow(),{
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

    // parse the file and data
    try{
        data = parseData(fs.readFileSync(fname, "utf8"))
    } catch(err) {
        if (err.code === 'ENOENT') {
            showStatus("File doesn't exist.")
            recentFiles = recentFiles.filter(x => x != fname);
            recentMenu();
            return;
        }
    }
    ddd = data.length != 1;

    //clear everything....
    swapped = 0; xName = "X"; saved=true, index=[];
    issame = false; firstSave = true; swapper = false;
    undoStack = []; redoStack = []; swapperIsOn = false;

    let ind = figurecontainer.data.length
    if(ind>1) { // delete extra traces
        if(currentEditable!=0){
            let tmp = clone(iniPointsD)
            delete tmp.x
            delete tmp.y
            Plotly.update(figurecontainer,tmp,clone(layout))
            $(`.scatterlayer .trace:first-of-type .points path`).css({'pointer-events':'all'})
            points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");
            currentEditable = 0
        }
        Plotly.deleteTraces(figurecontainer,Plotly.d3.range(1,ind))
    }

    // if(index.length) Plotly.restyle(figurecontainer, {selectedpoints: [null]});

    visibleMenu(['pax','swapen'])
    hideMenu(['swapen'])

    let dirname = path.dirname(fname);
    let filename = path.basename(fname, path.extname(fname));
    let extn = path.extname(fname);
    let save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation = dirname;

    ddd ? setUpFor3d() : setUpFor2d();
    fullDataCols =[clone(col)]
    fullData =[data]
    fileNames =[fname]
    saveNames =[save_name]
    legendNames =[path.basename(fname) + ` ${col.y+1}:${col.z+1}`]
    setUpColumns();
    updateData(true,false);
    showStatus('Data file loaded ...');

    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
    localStorage.setItem("recent", JSON.stringify(recentLocation));
    resizePlot();

    $("#particle").remove();
    document.getElementById('branding').style.display = 'block'
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    $('#sCol,#sColInp,#filler,#extendUtils2D').hide()
    $("#zCol").removeClass("rightBorder")
    // $('#plotlist').removeClass('disabled')
    makeRows()
}




var cRange=false,cRangeY=[NaN, NaN]; //hidden feature
function setCutRange(){
    if(!cRange) return
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
            'name': [col.z,col.s].map(e=> path.basename(fileNames[0]) + ` ${col.y+1}:${e+1}`)
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



var oldDpsLen=0
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
    if(isAxesLocked){
        for(let i=0; i<fullDataCols.length; i++){
            fullDataCols[i].z = value
            legendNames[i] = path.basename(fileNames[i]) + ` ${col.y + 1}:${col.z + 1}`
        }
        updatePlot(all = true);
    } else{
        fullDataCols[currentEditable].z = col.z = value;
        legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${col.y + 1}:${col.z + 1}`
        updatePlot(all = false);
    }

    updateOnServer();
    if(oldDpsLen!=dpsx.length){
        startDragBehavior()
        oldDpsLen=dpsx.length
    }
    if (!swapped) localStorage.setItem(ddd? "cols3d" : "cols2d", JSON.stringify(col));
};


function colsChanged(value) {
    col.s = value;
    updatePlot();
    if (!swapped) localStorage.setItem("cols3d", JSON.stringify(col));
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


function updateOnServer() {
    if (!viewerWindow) return;

    var s_data=[
        data.map(el=>el[swapped? col.y: col.x]),
        data.map(el=>el[swapped? col.x: col.y]),
        data.map(el=>el[col.z])
    ]
    viewerWindow.webContents.send("sdata", [s_data, swapped, col.z, data[0].length-1]);
}



function changeEditable(index,reset=false){ // we can just swap s and z anyways  //TODO : merge swapper into this
    if (swapperIsOn) {
        [col.s, col.z] = [col.z, col.s]
        sCol.selectedIndex = col.s;
        zCol.selectedIndex = col.z;
        colsChanged(col.s);
        updateOnServer();
        return
    } 
    $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'none'})

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
    for (let i = 0; i < dpsx.length; i++) points[i].index = i
    startDragBehavior();
    firstSave = true; undoStack = []; redoStack = []
    zCol.selectedIndex = col.z 
    document.title = "Interactive Data Editor - " + replaceWithHome(fileNames[currentEditable])
    updateOnServer()
}


function changeEditable2(ind){ // used for deleting trace below the currenteditable
    if (swapperIsOn) return
    $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'none'})
    $(`.scatterlayer .trace:nth-of-type(${ind+1}) .points path`).css({'pointer-events':'all'})
    currentEditable = ind
    points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points`)
            .getElementsByTagName("path");
    for (let i = 0; i < dpsx.length; i++) points[i].index = i
}



function addNewFileDialog() {
    if (swapperIsOn) {
        alertElec("Plot along X before adding a new file.",0,"Can't add the file!!!")
        return
    }
    var fname = dialog.showOpenDialogSync(remote.getCurrentWindow(),{
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname !== undefined) addNewFile(fname[0]);
}


function addNewFile(fname) {
    let dat = parseData(fs.readFileSync(fname, "utf8"))
    if(dat==undefined) return
    if (fullData[0].length != dat.length) {
        alertElec("Trying to open a file with different grid.\nThis is not supported for 3D data.",0,"Can't add the file!!!")
        return
    }

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
    makeRows()
}


function addTrace(){
    let ind = fullData.length-1
    let thisTrace = clone(iniPointsD)

    thisTrace.name = legendNames[ind]
    thisTrace.x = fullData[ind][th_in][fullDataCols[ind].y]
    thisTrace.y = fullData[ind][th_in][fullDataCols[ind].z]
    delete thisTrace.marker.color
    delete thisTrace.line.color
    Plotly.addTraces(figurecontainer, thisTrace);
}


var swapperIsOn = false
function openSwapper() {
    if (fileNames.length!=1) {
        alertElec("Can't use this feature when multiple files are open.",0,"Operation Unavailable")
        return
    }
    swapperIsOn = true;
    $("#sCol, #sColInp").show();
    $("#zCol").addClass("rightBorder")
    let len = figurecontainer.data.length
    if (len > 2) { // we just need two traces
        Plotly.deleteTraces(figurecontainer,Plotly.d3.range(2,len))
    } else if (len == 1) {
        let thisTrace = clone(iniPointsD)
        thisTrace.line.color = thisTrace.marker.color = colorList[1]
        Plotly.addTraces(figurecontainer, thisTrace)
    }
    let lname = path.basename(fileNames[0])
    Plotly.update(figurecontainer, {
        x: [data[th_in][col.y], data[th_in][col.y]],
        y: [data[th_in][col.z], data[th_in][col.s]],
        name: [
            lname + ` ${col.y +1 }:${col.z +1}`,
            lname + ` ${col.y +1}:${col.s +1}`
        ]
    },{selectdirection: 'h'})
    disableMenu(['edat','fill','filter','af','arf'])
    // traceUpdate()
    // $('#plotlist').addClass('disabled')
}


function exitSwapper() {
    swapperIsOn = false
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {selectdirection: 'any'});
    data = fullData[0]
    $("#sCol, #sColInp").hide();
    $("#zCol").removeClass("rightBorder")
    // $('#plotlist').removeClass('disabled')
    enableMenu(['edat','fill','filter','af','arf'])
    // traceUpdate()
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
    tmpData = data
    if (swapped) tmpData = expRotate(tmpData, col.y, col.x)
    try {
        var txt = tmpData.map(x => transpose(x).map( y=>y.map( i=>i.toFixed(8) ).join('\t')).join('\n')).join('\n\n')
        fs.writeFileSync(saveNames[currentEditable], txt);
        showStatus("Data Saved in file " + replaceWithHome(saveNames[currentEditable]));
        saved = true;
    } catch (error) {
        showStatus("Something went wrong! Couldn't save the data...")
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
        return false
    }
    swapped = !swapped;
    // let [n1,n2] = swapped ? ["X", "Y"] : ["Y", "X"];
    // xName = n2;
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
    // console.log(data);
    [tmpTh_in, col, tmpSwapped, arr] = JSON.parse(olddata);
    if (tmpSwapped != swapped) isswap();
    // console.log(data)

    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
    th_in = tmpTh_in
    data[th_in] = arr;
    // console.log(data)

    sliderChanged()
    updatePlot(all = false);
    startDragBehavior();
    updateOnServer();
    saved = false;
}




// function buildDOM(){
//     var txt =''
//     for(let i=0; i<fileNames.length; i++){
//         let fileName = fileNames[i]
//         let shortName = path.basename(fileName)
//         fileName = replaceWithHome(fileName)
 
//         //making custom button for the currently editable
//         // for simlicity lets just make the currenteditable trace undeletable
//         let buttomTxt = currentEditable != i ?
//             `<button class="clsBtn" onclick="tools(2,${i})" title='Remove this file'>`:
//             `<button class="clsBtnD" title='Can not remove currently editing plot' disabled>`

//         let checked = currentEditable==i? 'checked':''

//         // col label, x,y is uneditable for simplicity just now, maybe added later
//         let colLen=fullData[i][0].length
//         let colLabel = `<label>${ddd ? fullDataCols[i].x+1+':' : '' }${fullDataCols[i].y+1}:</label>`
//         colLabel += `<select onchange="updatePlotPop(${i},this.selectedIndex)" title='Change data column'>`
//         for(let j=0; j<colLen; j++){
//             colLabel += `<option ${fullDataCols[i].z==j ? 'selected' : ''}>${j+1}</option>`
//         }
//         colLabel+='</select>'

//         txt += 
//         `<div class="row">
//             <label class="index">${i+1}.</label>
//             <label class="filename" title='${fileName}'>${shortName}</label>

//             <div class="tools">
//                 <input  class='radio' type="radio" onclick="tools(0,${i})" title='Select this as editable' ${checked}>
//                 <button class="copyBtn" onclick="tools(1,${i})" title='Use this file'>
//                     <svg viewBox="0 0 1792 1792">
//                         <path d="M1664 1632v-1088q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h1088q13 0 22.5-9.5t9.5-22.5zm128-1088v1088q0 66-47 113t-113 47h-1088q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113zm-384-384v160h-128v-160q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h160v128h-160q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113z"/>
//                     </svg>
//                     </button>
//                 ${buttomTxt}
//                     <svg viewBox="0 0 1792 1792">
//                         <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
//                     </svg>
//                 </button>
//             </div>
//             <div class="popSelector">
//                 ${colLabel}
//             </div>
//         </div><br>`
//     }
//     txt+='<br>'
//     document.querySelector('#popupPlotList>.popmain').innerHTML = txt  // use this
// }


// function tools(option,index){
//     if(option==0){ //select editable
//         if(currentEditable!=index) changeEditable(index)
//     }else if (option==1) { // clone this
//         fullData.push(fullData[index]); //not cloning same file
//         fullDataCols.push(clone(fullDataCols[index]))
//         fileNames.push(fileNames[index])
//         saveNames.push(saveNames[index])
//         legendNames.push(clone(legendNames[index]))
//         addTrace()
//     }else if(option==2) { // close this
//         if(fileNames.length==1) return // nothing to delete here
//         if(index <=currentEditable) changeEditable2(currentEditable-1) // currentEditable is changed within the function

//         Plotly.deleteTraces(figurecontainer,index)
//         fullData.splice(index,1)
//         fullDataCols.splice(index,1)
//         fileNames.splice(index,1)
//         saveNames.splice(index,1)
//         legendNames.splice(index,1)
//     }
//     buildDOM()
// }


// function updatePlotPop(index, cl){
//     fullDataCols[index].z = cl
//     legendNames[index] =path.basename(fileNames[index]) + ` ${fullDataCols[index].y+1}:${fullDataCols[index].z+1}`
//     Plotly.restyle(figurecontainer, {
//         y:[fullData[index][th_in][fullDataCols[index].z]],
//         name : [legendNames[index]]
//     }, index)

//     if(index==currentEditable){
//         col.z = cl
//         dpsy = data[th_in][col.z];
//     }
//     zCol.selectedIndex = col.z 
// }


function settingWindow(){
    let settingEditWindow = new BrowserWindow({
        minHeight: 700,
        minWidth:600,
        show: false,
        title: "Interactive Data Editor - Plot Settings",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    settingEditWindow.loadURL(url.format({
        pathname: path.join(__dirname, "pop.html"),
        protocol: 'file:',
        slashes: true
    }));
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



function spreadsheet() {
    let editorWindow = new BrowserWindow({
        minWidth: 1200,
        title: "Interactive Data Editor",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    editorWindow.maximize();
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, "spreadsheet.html"),
        protocol: 'file:',
        slashes: true
    }));
    editorWindow.setMenuBarVisibility(false);

    editorWindow.show();
    // if (!app.isPackaged) editorWindow.webContents.openDevTools();
    editorWindow.webContents.once("dom-ready", function () {
        editorWindow.webContents.send("slider", [xName, col.x, data]);
    })
}


var viewerWindow=null; // this variable is used inside the update on server function
function openViewer() {
    viewerWindow = new BrowserWindow({
        show: false,
        title: "Interactive Data Editor",
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    viewerWindow.maximize();
    viewerWindow.loadURL(url.format({
        pathname: path.join(__dirname, '3D_Viewer.html'),
        protocol: 'file:',
        slashes: true
    }));
    viewerWindow.on("closed", function () { viewerWindow = null })
    viewerWindow.show();
    viewerWindow.setMenuBarVisibility(false);
    // if (!app.isPackaged) viewerWindow.webContents.openDevTools();
    viewerWindow.webContents.once("dom-ready", updateOnServer)
};




var minWidth = window.innerWidth / 4.5

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > window.innerWidth / 5.5 && x < window.innerWidth / 2.5) {
            $('#sidebar').width(x - 2);
            // $('#full').css("margin-left", x);
            minWidth = x;
            resizePlot()
        }
    })
});



$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});


function openNav() {
    $("#sidebar").css("width",minWidth)
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
    },100)
}



function tools(option,index){
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
        if(index <=currentEditable) changeEditable2(currentEditable-1) // currentEditable is changed within the function

        Plotly.deleteTraces(figurecontainer,index)
        fullData.splice(index,1)
        fullDataCols.splice(index,1)
        fileNames.splice(index,1)
        saveNames.splice(index,1)
        legendNames.splice(index,1)
    }
    makeRows()
}


function makeRows() {
    $('#files').html(
        fileNames.map((i,j)=>{
            return `
        <div class="fList ${currentEditable==j? 'selected': ''}" >
            <div class="fName" onclick="tools(0,${j})" title=${replaceWithHome(i)}>
                ${j+1}. ${path.basename(i)}
            </div>
            <div class="fclsBtn" onclick="tools(2,${j})" title='Remove this file' ${currentEditable==j? 'style="pointer-events: none;opacity: 0.4;"': ''}>
                <svg viewBox="0 0 1792 1792">
                    <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
                </svg>
            </div>
            <div class="fcpyBtn" onclick="tools(1,${j})" title='Use this file'>
                <svg viewBox="0 0 1792 1792">
                    <path d="M1664 1632v-1088q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h1088q13 0 22.5-9.5t9.5-22.5zm128-1088v1088q0 66-47 113t-113 47h-1088q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113zm-384-384v160h-128v-160q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h160v128h-160q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113z"/>
                </svg>
            </div>
        </div>`}).join(' ')
    )
    document.getElementById('lockAllAxes').style.display = fullData.length >1 ? 'block': 'none'
}