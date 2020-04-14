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

var undoStack = [], redoStack = [],
    show = false,
    saved = true, firstSave = true,
    issame = false,
    fullData = [], fullDataCols = [], fileNames = [], saveNames = [], legendNames = [],
    currentEditable = 0,
    data = [], dpsx = [], dpsy = [], index = [],
    th_in = 0, refdat = 1, ma = 1, 
    serve = 0, lockXc = 1, swapped = 0,
    swapper = false, ddd = false,
    col = {x: 0,y: 0,z: 0,s: 0},
    xName = "X";




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
    }

    th_in = 0;

    if (!swapped){
        localStorage.setItem( ddd? "cols3d" : "cols2d", JSON.stringify(col));
    } else{
        [col.x, col.y] = [col.y, col.x]
    }
    fullDataCols[0] = JSON.parse(JSON.stringify(col));

    if(ddd) setUpSlider()

    updatePlot(all);
    updateOnServer();
    startDragBehavior();
};


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
// var notLoaded = true



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
        if (index.length) {oldDatX = clone(dpsx); oldDatY = clone(dpsy);}
        return {x,y}
    })

    drag.on("drag", function () {
        // axis is put here, as the axis changes when axis range is changed
        let yaxis = figurecontainer._fullLayout.yaxis;
        let xaxis = figurecontainer._fullLayout.xaxis;

        let yVal = clamp(yaxis.p2l(d3.event.y), ...yaxis.range);
        dpsy[pIndex] = yVal //dpsy is a reference to data, so this also modifies the data
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




function updateOnServer() {
    if (!serve) return;
    // may be removed
    return new Promise((resolve, reject)=>{
        let x_list = [],
            y_list = [],
            z_list = [];

        let [a,b,c] = swapped ? [col.y, col.x,col.z] : [col.x, col.y,col.z]

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



function changeEditable(index, colorReset=true){
    // console.log(`current ${currentEditable}, index : ${index}`)
    if (swapperIsOn) return  // we can just swap s and z anyways
    $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'none'})

    if(colorReset){ // needed for deleting traces lower than the currenteditable
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
    }
    if (fullData[currentEditable][0].length != fullData[index][0].length) setUpColumns()

    currentEditable = index

    $(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points path`).css({'pointer-events':'all'})
    points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${currentEditable+1}) .points`)
            .getElementsByTagName("path");

    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    for (let i = 0; i < dpsx.length; i++) points[i].index = i
    startDragBehavior();
    firstSave = true; undoStack = []; redoStack = []
}


function addNewFileDialog() {
    if (swapperIsOn) {
        alertElec("Plot along X before adding a new file.",0,"Can't add the file!!!")
        return
    }
    var fname = dialog.showOpenDialogSync(parentWindow,{
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname === undefined) return
    addNewFile(fname[0]);
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
    swapperIsOn = true;
    $("#sCol, #sColInp").show();
    let len = figurecontainer.data.length
    if (len > 2) { // we just need two traces
        Plotly.deleteTraces(figurecontainer,Plotly.d3.range(2,len))
    } else if (len == 1) {
        let thisTrace = JSON.parse(JSON.stringify(iniPointsD))
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

    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = false;
    $('#plotlist').addClass('disabled')
    // updateJSON();
}


function exitSwapper() {
    swapperIsOn = false
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {selectdirection: 'any'});
    data = fullData[0]
    $("#sCol, #sColInp").hide();
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = true;
    $('#plotlist').removeClass('disabled')
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
    var tmpData = tmpData.map(x => transpose(x));
    var txt = "";
    try {
        for (let i of tmpData) {
            for (let j of i) {
                if (j !== undefined) txt += j.map(n => parseFloat(n).toFixed(8)).join("\t") + "\n";
            };
            txt += "\n";
        };
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
    for (let i = 0; i < fullData.length; i++) {
        [fullDataCols[i].x, fullDataCols[i].y] = [fullDataCols[i].y, fullDataCols[i].x]
        fullData[i] = expRotate(fullData[i], fullDataCols[i].x, fullDataCols[i].y)
    }

    const allEqual = fullData.every(v => v.length === fullData[0].length)

    if (!allEqual) {
        for (let i = 0; i < fullData.length; i++) {
            [fullDataCols[i].x, fullDataCols[i].y] = [fullDataCols[i].y, fullDataCols[i].x]
            fullData[i] = expRotate(fullData[i], fullDataCols[i].x, fullDataCols[i].y)
        }
        alertElec("File(s) have different grid points along the Y axis.", 0, "Can't Plot along Y!!!")
        return false
    }
    swapped = !swapped;
    let [n1,n2] = swapped ? ["X", "Y"] : ["Y", "X"];
    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    xName = n2; 
    updateData();
    $("#drag").html((_, html) => html.replace(n1, n2));
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
    if (!ma) ma = 1;
    if (!undoStack.length) return;
    let olddata = undoStack.pop()
    redoStack.push(JSON.stringify([th_in, col, swapped, data[th_in]]));
    doIt(olddata);
}


function doIt(olddata) {
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
