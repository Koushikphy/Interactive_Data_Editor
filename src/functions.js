const fs     = require("fs"),
      path   = require('path'),
      url    = require('url'),
      xCol   = document.getElementById("xCol"),
      yCol   = document.getElementById("yCol"),
      zCol   = document.getElementById("zCol"),
      sCol   = document.getElementById("sCol"),
      slider = document.getElementById('range'),
      thumb  = document.getElementById('thumb'),
      parentWindow = remote.getCurrentWindow();

var undoStack = [],
    redoStack = [],
    editorWindow,
    show = false,
    saved = true,
    firstSave = true,
    issame = false,
    fullData = [],
    fullDataCols = [],
    fileNames = [],
    saveNames = [],
    legendNames = [],
    rangedSelector=0,
    currentEditable = 0;






function setUpFor2d(){
    $('#xCol,#xLabel,.3D').hide()
    $('#yLabel').html('X')
    $('#zLabel').html('Y')
    var fl = JSON.parse(localStorage.getItem("cols2d"));
    if (fl !== null) col = fl
    col.x=0
    serve = 0;
    var enableMenu = ['save', 'saveas', 'tfs', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','rgft', 'lmfit']
    for (let i of enableMenu) menu.getMenuItemById(i).enabled = true;
    // for (let i of ["pax", 'wire', 'surf']) menu.getMenuItemById(i).enabled = false;
    for (let i of ["pax", '3dview']) menu.getMenuItemById(i).enabled = false;
}

function setUpFor3d(){
    $('#xCol,#xLabel,.3D').show()
    $('#yLabel').html('Y')
    $('#zLabel').html('Z')
    $(".3D").show();
    setUpSlider();
    var fl = JSON.parse(localStorage.getItem("cols3d"));
    if (fl !== null) col = fl
    var enableMenu = ['save', 'saveas', 'tfs', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf','pax', '3dview']
    for (let i of enableMenu) menu.getMenuItemById(i).enabled = true;
    for (let i of ["rgft", 'lmfit']) menu.getMenuItemById(i).enabled = false;
}

function setUpColumns(){
    //a precaution here for the
    let tmpL = data[0].length
    if(col.x>=tmpL) col.x = 0
    if(col.y>=tmpL) col.y = 0
    if(col.z>=tmpL) col.z = 0
    if(col.s>=tmpL) col.s = 0

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
        fullDataCols[0] = JSON.parse(JSON.stringify(col));
    }

    th_in = 0;
    if(ddd) setUpSlider()

    updatePlot(all);
    updateOnServer();
    if (!swapped) localStorage.setItem( ddd? "cols3d" : "cols2d", JSON.stringify(col));
    startDragBehavior();
};


transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));

function parseData(strDps) {
    var newdat = [],
        blocks = [];
    strDps = strDps.trim().split(/\r?\n\s*\r?\n/);
    try{
        for (let i of strDps) {
            blocks = i.trim().split("\n");
            for (var j = 0; j < blocks.length; j++) {
                blocks[j] = blocks[j].trim().split(/[\s\t]+/);
                blocks[j] = blocks[j].map(x => {
                    y = parseFloat(x)
                    if(isNaN(y)){
                        throw "badData"
                    } else{
                        return y
                    }
                });
            };
            newdat.push(transpose(blocks));
        }
    } catch(err){
        if(err='badData'){
            alertElec("Bad data found !!!\nCheck the file before openning.")
        }
        return
    }
    return newdat;
};


document.ondragover = document.ondrop = (ev) => ev.preventDefault()

document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}


function fileLoader() {
    const fname = dialog.showOpenDialogSync(parentWindow,{
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname !== undefined) fileReader(fname[0]);
}


function fileReader(fname) {
    //check if other file is open
    if (!saved) var res = dialog.showMessageBoxSync(parentWindow,{
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to open a new file without saving the changes?",
        buttons: ['Yes', "No"]
    });
    if (res) return;

    // parse the file and data
    data = parseData(fs.readFileSync(fname, "utf8"))
    if(data==undefined) return
    ddd = data.length != 1;

    //reset everything....
    swapped = 0; refdat = 0; xName = "X";saved=true;
    issame = false; firstSave = true; swapper = false;
    undoStack = []; redoStack = [];  swapperIsOn = false;

    // $("#full").show();
    let ind = figurecontainer.data.length
    if(ind>1) Plotly.deleteTraces(figurecontainer,Plotly.d3.range(1,ind))  // delete extra traces
    // if currentEditable is not the first trace then, we have to update the points and also have to change the plot style
    if(currentEditable !=0){
        currentEditable = 0
        let line = clone(iniPointsD.line)
        let marker = clone(iniPointsD.marker)
        Plotly.restyle(figurecontainer,{line : [line], marker:[marker]},0)
        $(`.scatterlayer .trace:first-of-type .points path`).css({'pointer-events':'all'})
        points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");
    }
    if(index.length) Plotly.restyle(figurecontainer, {selectedpoints: [null]});

    //reset menus
    menu.getMenuItemById("pax").visible = true;
    menu.getMenuItemById("pay").visible = false;
    menu.getMenuItemById("swapen").visible = true;

    let dirname = path.dirname(fname);
    let filename = path.basename(fname, path.extname(fname));
    let extn = path.extname(fname);
    let save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation = dirname;
    
    ddd ? setUpFor3d() : setUpFor2d();
    fullDataCols =[JSON.parse(JSON.stringify(col))]
    fullData =[data]
    fileNames =[fname]
    saveNames =[save_name]
    legendNames =[path.basename(fileNames[0]) + ` ${col.y+1}:${col.z+1}`]
    resizePlot();
    setUpColumns();
    updateData(true,false);
    showStatus('Data file loaded ...');


    // load all scripts here
    if(notLoaded){ // this seems pretty bad, replace with require in future
        $.getScript('../lib/delay.min.js')
        notLoaded = false
    }

    // part of the reset that is performed later
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
    localStorage.setItem("recent", JSON.stringify(recentLocation));

    $("#sCol, #sColInp").hide();
    $("#particle").remove();
    document.getElementById('branding').style.display = 'block'
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    setTimeout(()=>{closeThis2d();closeThis();},111)
}
var notLoaded = true



function updatePlot(all = true) {
    //true means just update the current plot i.e. 0th
    // leave others as it is.
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    // put another for swapper
    if (swapperIsOn) {
        let lname = path.basename(fileNames[0])
        let name=[
            lname + ` ${col.y+1}:${col.z+1}`,
            lname + ` ${col.y+1}:${col.s+1}`
        ]
        Plotly.restyle(figurecontainer, {
            x: [data[th_in][col.y], data[th_in][col.y]],
            y: [data[th_in][col.z], data[th_in][col.s]],
            name
        })
    } else if (all) {
        let xl = [], yl = [], name = [];
        for (let i = 0; i < fullData.length; i++) {
            xl.push(fullData[i][th_in][fullDataCols[i].y]);
            yl.push(fullData[i][th_in][fullDataCols[i].z]);
            name.push(legendNames[i])
        };
        Plotly.restyle(figurecontainer, {
            'x': xl,
            'y': yl,
            name
        })
    } else {
        Plotly.restyle(figurecontainer, {
            'x': [dpsx],
            'y': [dpsy],
            "name":[legendNames[currentEditable]]
        }, currentEditable)
    }
    for (let i = 0; i < dpsx.length; i++) points[i].index = i
}


// 3 px is just a shift from sides
function sliderChanged(){
    let max = data.length-1;
    let xPX = th_in * (document.body.clientWidth -6 - thumb.offsetWidth) / max+3;
    thumb.style.left = `${xPX}px`
    thumb.innerText = `${xName}=${data[th_in][col.x][0]}`
    updatePlot();
}


function setUpSlider(){
    slider.max = data.length - 1
    // reset slider
    slider.value = 0;
    thumb.innerText = `${xName}=${data[0][col.x][0]}`
    thumb.style.left = `${3}px`
    slider.oninput = function(){
        th_in = parseInt(slider.value);
        sliderChanged()
    }
}


function colChanged(value) {
    fullDataCols[currentEditable].z = col.z = value;
    legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${col.y + 1}:${col.z + 1}`
    updatePlot(all = false);
    updateOnServer();
    startDragBehavior();
    if (!swapped) localStorage.setItem(ddd? "cols3d" : "cols2d", JSON.stringify(col));
};



clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper))


function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    var oldDatX, oldDatY, pIndex;

    drag.origin(function () {
        saveOldData();
        let [x,y] = this.getAttribute('transform').slice(10,-1).split(/,| /);
        pIndex = this.index
        if (index.length) {oldDatX = clone(dpsx); oldDatY = clone(dpsy);}
        return {x,y}
    })

    drag.on("drag", function () {
        // axis is put here, as the axis changes when axis range is changed
        let yaxis = figurecontainer._fullLayout.yaxis;
        let xaxis = figurecontainer._fullLayout.xaxis;

        let yVal = clamp(yaxis.p2l(d3.event.y), ...yaxis.range);
        dpsy[pIndex] = yVal
        for (let i of index) dpsy[i] = yVal - oldDatY[pIndex] + oldDatY[i]
        if (lockXc) {
            Plotly.restyle(figurecontainer, {y: [dpsy]}, currentEditable)
        } else {// move in x direction
            let xVal = clamp(xaxis.p2l(d3.event.x), ...xaxis.range);
            dpsx[pIndex] = xVal
            for (let i of index) dpsx[i] = xVal - oldDatX[pIndex] + oldDatX[i]
            Plotly.restyle(figurecontainer, {x: [dpsx], y: [dpsy]}, currentEditable)
        };
    });
    drag.on("dragend", updateOnServer)
    d3.selectAll(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).call(drag);
};





function keyBoardDrag(inp) {
    if (!index.length) return;
    if (ma) {
        saveOldData();
        ma = 0;
    }
    var yaxis = figurecontainer._fullLayout.yaxis;
    var add = yaxis.p2l(1) - yaxis.p2l(0);
    if (inp) add = -add;
    for (let ind of index) dpsy[ind] +=add
    Plotly.restyle(figurecontainer, {y: [dpsy]}, 0)
}


function saveOldData() {
    if (!data.length) return;
    redoStack = [];
    olddata = JSON.stringify([th_in, col, swapped, data[th_in]]);
    if (undoStack.length == 10) undoStack.splice(0, 1);
    undoStack.push(olddata);
    saved = false;
}


function reDo() {
    if (!redoStack.length) return;
    olddata = redoStack.pop();
    undoStack.push(JSON.stringify([th_in, col, swapped, data[th_in]]));
    doIt();
}

function unDo() {
    if (!ma) ma = 1;
    if (!undoStack.length) return;
    olddata = undoStack.pop()
    redoStack.push(JSON.stringify([th_in, col, swapped, data[th_in]]));
    doIt();
}


function doIt() {
    var arr, tmpSwapped;
    [th_in, col, tmpSwapped, arr] = JSON.parse(olddata);
    if (tmpSwapped != swapped) isswap();
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
    data[th_in] = arr;
    updatePlot(all = false);
    startDragBehavior();
    updateOnServer();
    saved = false;
}


function updateOnServer() {
    if (!serve) return;
    // may be removed
    return new Promise((resolve, reject)=>{
        let x_list = [],
            y_list = [],
            z_list = [];

        let [a,b,c] = swapped ? [col.y, col.x,col.z] :  [col.x, col.y,col.z]

        for (let i of data) {
            x_list.push(i[a]);
            y_list.push(i[b]);
            z_list.push(i[c]);
        };
        var s_data = [x_list, y_list, z_list];
        viewerWindow.webContents.send("sdata", [s_data, Object.values(col)]);
        resolve();
    })
};


function resizePlot() {
    // this triggers the responsiveness on plotly
    window.dispatchEvent(new Event('resize'));
    // setTimeout(function () {
    //     var height = window.innerHeight - document.getElementById("figurecontainer").offsetTop;
    //     $("#figurecontainer").height(height - 2);
    //     Plotly.relayout(figurecontainer, {
    //         autosize: true
    //     });
    // }, 330)
}



function alertElec(msg, type=1){
    dialog.showMessageBox(parentWindow,{
        type: type==1? "error": 'warning',
        title: "Failed to execute.",
        message: msg,
        buttons: ['OK']
    });
}