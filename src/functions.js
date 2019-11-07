const fs = require("fs");
const path = require('path');
const url = require('url');
var undoStack = [],
    redoStack = [],
    editorWindow, viewer = [, , ],
    show = false,
    saved = true,
    compFName, firstSave = true,
    issame = false,
    fullData = [],
    fullDataCols = [],
    fileNames = [],
    saveNames = [],
    legendNames = [], rangedSelector=0;

function updateData() {
    col.x = xCol.selectedIndex;
    col.y = yCol.selectedIndex;
    col.z = zCol.selectedIndex;
    th_in = 0;
    if (ddd) { //3D
        $slider.slider({
            max: data.length - 1,
            value: 0
        })
        $ch.text(xName + '=' + data[0][col.x][0])
        //set custom handler length
        var tmpl = []
        for (let i of data) tmpl.push(i[col.x][0].toString().length);

        $ch.width(Math.floor((Math.max(...tmpl) / 2) + 2) * em2px);
    } else { //2D
        col.z = col.y;
        col.y = col.x;
        col.x = 0
        col2dChanged()
    };
    fullDataCols[0] = JSON.parse(JSON.stringify(col));
    updatePlot(1);
    makeRows();
    startDragBehavior();
    updateOnServer();
    if (!swapped) {
        if (ddd) {
            localStorage.setItem("cols3d", JSON.stringify(col));
        } else {
            var tmp = {
                x: col.y,
                y: col.z,
                z: 0,
                s: 0
            }
            localStorage.setItem("cols2d", JSON.stringify(tmp));
        }

    }


};

document.ondragover = document.ondrop = (ev) => {
    ev.preventDefault()
}

document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}


function fileLoader() {
    const fname = dialog.showOpenDialog({
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname !== undefined) fileReader(fname[0]);
}


function fileReader(fname) {
    //check if other file is open
    if (!saved) var res = dialog.showMessageBox({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "There are some modified data, that you haven't saved yet.\n Are you sure to open a new file without saving?",
        buttons: ['Yes', "No"]
    });
    if (res) return;

    // parse the file and data
    data = parseData(fs.readFileSync(fname, "utf8"))
    if(data==undefined) return
    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname))
    var extn = path.extname(fname)
    save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation = dirname;
    localStorage.setItem("recent", JSON.stringify(recentLocation));


    //reset everything....
    swapped = 0;
    refdat = 0;
    xName = "X";
    issame = false;
    firstSave = true;
    swapper = false;
    undoStack = [];
    redoStack = [];
    fullData = [];
    fullDataCols = [];
    fileNames = [];
    saveNames = [];
    legendNames = [];
    swapperIsOn = false;
    $("#sCol, #sColInp").hide();
    $("#particle").remove();
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    $("#full").show();
    $('#jsoneditor').height(window.innerHeight - jsoneditor.offsetTop)
    if (figurecontainer.data.length > 2){
        let tt = [];
        for(let i=1;i<figurecontainer.data.length;i++){
            tt.push(i)
        }
        Plotly.deleteTraces(figurecontainer, tt);
    }
    if (figurecontainer.layout.selectdirection != 'any') {
        Plotly.relayout(figurecontainer, {
            selectdirection: 'any'
        });
    }
    xCol = document.getElementById("xCol");
    yCol = document.getElementById("yCol");

    //reset menus
    menu.getMenuItemById("pax").visible = true;
    menu.getMenuItemById("pay").visible = false;
    menu.getMenuItemById("swapen").visible = true;

    for (let i of ["pax", 'wire', 'surf']) menu.getMenuItemById(i).enabled = false;




    ddd = data.length != 1;
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);


    //setup the column selector and menu.
    var enableMenu = ['save', 'saveas', 'tfd', 'tfs', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf', 'rgft', 'lmfit']
    if (ddd) { //3
        $(".3D").show()
        var fl = JSON.parse(localStorage.getItem("cols3d"));
        if (fl !== null) {
            col = fl;
        }
        enableMenu.push('pax', 'wire', 'surf');

    } else { //2d
        serve = 0;
        $(".3D").hide()
        var fl = JSON.parse(localStorage.getItem("cols2d"));
        if (fl !== null) {
            col = fl;
        }
    }

    var op = "";
    for (var i = 1; i <= data[0].length; i++) {
        op += '<option>' + i + '</option>';
    };
    for (let i of $("#xCol, #yCol, #zCol, #sCol")) i.innerHTML = op;
    for (let i of enableMenu) menu.getMenuItemById(i).enabled = true;
    

    xCol.selectedIndex = col.x;
    yCol.selectedIndex = col.y;
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;


    fullDataCols.push(JSON.parse(JSON.stringify(col)));
    fullData.push(data);
    fileNames.push(fname);

    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname));
    var extn = path.extname(fname);
    var save_name = path.join(dirname, filename + "_new" + extn);
    saveNames.push(save_name);
    legendNames.push(path.basename(fileNames[0]) + ` ${col.y+1}:${col.z+1}`)

    // plot here
    updateData();
    makeEditable();
    makeRows();
    Plotly.restyle(figurecontainer, {
        name: legendNames[0]
    });
    //update recent menu

    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();

    $ch.text(xName + '=' + data[th_in][col.x][0]);
    $("#drag").html((_, html) => html.replace("Y", "X"));
    resizePlot();
    showStatus('Data file loaded ...');

}



function selUpdate() {
    var op = "";
    for (var i = 1; i <= data[0].length; i++) {
        op += '<option>' + i + '</option>';
    };
    for (let i of $("#xCol, #yCol, #zCol, #sCol")) i.innerHTML = op;
    if(ddd){
        xCol.selectedIndex = col.x;
        yCol.selectedIndex = col.y;
        zCol.selectedIndex = col.z;
        sCol.selectedIndex = col.s;
    }else{
        xCol.selectedIndex = col.y;
        yCol.selectedIndex = col.z;
        sCol.selectedIndex = col.s;
    }

}

function addNewFileDialog() {
    if (swapperIsOn) {
        dialog.showMessageBox({
            type: "warning",
            title: "Can't add the file!!!",
            message: "Plot along X before adding a new file.",
            buttons: ['Ok']
        });
        return
    }
    var fname = dialog.showOpenDialog({
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname === undefined) return
    addNewFile(fname[0]);
}


function addNewFile(fname) {
    // layout.showlegend = true
    data = parseData(fs.readFileSync(fname, "utf8"))
    if(data==undefined) return
    if (fullData[0].length != data.length) {
        dialog.showMessageBox({
            type: "warning",
            title: "Can't add the file!!!",
            message: "Trying to open a file with different grid.\nThis is not supported for 3D data.",
            buttons: ['Ok']
        });
        return
    }
    if (fullData[0][0].length != data[0].length) {
        selUpdate();
    }

    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname));
    var extn = path.extname(fname);
    var save_name = path.join(dirname, filename + "_new" + extn);
    var oldLength = data[0].length;
    fullData.unshift(data); //add at the beggining i.e instantly editable
    fullDataCols.unshift(JSON.parse(JSON.stringify(col)));
    fileNames.unshift(fname);
    saveNames.unshift(save_name);
    legendNames.unshift(path.basename(fileNames[0]) + ` ${fullDataCols[0].y + 1}:${fullDataCols[0].z + 1}`)

    addTrace();
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
}


function addTrace() {

    let len = figurecontainer.data.length
    let thisTrace = JSON.parse(JSON.stringify(iniPointsC))

    thisTrace.name = legendNames[0]
    thisTrace.x = fullData[0][th_in][fullDataCols[0].y]
    thisTrace.y = fullData[0][th_in][fullDataCols[0].z]
    Plotly.addTraces(figurecontainer, thisTrace, 0);
    marker = [{
        symbol: "circle-dot",
        color: '#b00',
        size: 6,
        opacity: 1
    }]
    line = [{
        width: 2,
        color: "#1e77b4",
        dash: 0,
        shape: 'linear'
    }]
    for (let i = 1; i < figurecontainer.data.length; i++) {
        marker.push({
            symbol: "circle-dot",
            color: colorList[i % 9],
            size: 6,
            opacity: 1
        })
        line.push({
            width: 2,
            color: colorList[i % 9],
            dash: 0,
            shape: 'linear'
        })
    }
    col = fullDataCols[0];
    Plotly.restyle(figurecontainer, {
        line,
        marker
    });
    makeRows();
    makeEditable();

    firstSave = true;
    undoStack = []
    redoStack = []
}


// this will be the new update plot function
function updatePlot(all = true) {
    //current true means just update the current plot i.e. 0th 
    // leave others as it is.
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    var xl = [dpsx],
        yl = [dpsy],
        name = [legendNames[0]];
    //! put another for swapper
    if (swapperIsOn) {
        Plotly.restyle(figurecontainer, {
            x: [data[th_in][col.y], data[th_in][col.y]],
            y: [data[th_in][col.z], data[th_in][col.s]],
        })
    } else if (all) {
        for (let i = 1; i < fullData.length; i++) {
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
            'x': xl,
            'y': yl,
            name
        }, 0)
    }
    for (var i = 0; i < dpsx.length; i++) {
        points[i].handle = {
            x: dpsx[i],
            y: dpsy[i]
        };
    };
}


function selectEditable(index) {
    if (swapperIsOn) {
        [col.s, col.z] = [col.z, col.s]
        sCol.selectedIndex = col.s;
        zCol.selectedIndex = col.z;
        Plotly.restyle(figurecontainer, {
            x: [data[th_in][col.y], data[th_in][col.y]],
            y: [data[th_in][col.z], data[th_in][col.s]]
        })
    } else {
        if (index >= fullData.length) return;
        [fullData[0], fullData[index]] = [fullData[index], fullData[0]];
        [fullDataCols[0], fullDataCols[index]] = [fullDataCols[index], fullDataCols[0]];
        [fileNames[0], fileNames[index]] = [fileNames[index], fileNames[0]];
        [saveNames[0], saveNames[index]] = [saveNames[index], saveNames[0]];
        [legendNames[0], legendNames[index]] = [legendNames[index], legendNames[0]];

        data = fullData[0];
        col = fullDataCols[0];

        updatePlot()
        makeRows()
        if (fullData[0][0].length != fullData[index].length) {
            selUpdate();
        }
    }
    firstSave = true
    makeEditable()
    undoStack = []
    redoStack = []
    updateOnServer()
}


function makeEditable() {
    if (ddd) {
        xCol.selectedIndex = col.x;
        yCol.selectedIndex = col.y;
        zCol.selectedIndex = col.z;
        sCol.selectedIndex = col.s;
    } else {
        xCol.selectedIndex = col.y;
        yCol.selectedIndex = col.z;
        sCol.selectedIndex = col.s;
    }
    pointscontainer = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points");
    points = pointscontainer.getElementsByTagName("path");
    data = fullData[0]
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    Plotly.restyle(figurecontainer, {
        "x": [dpsx],
        "y": [dpsy]
    }, 0);

    for (var i = 0; i < dpsx.length; i++) {
        points[i].handle = {
            x: dpsx[i],
            y: dpsy[i]
        };
    };
    startDragBehavior();
    document.title = "Interactive Data Editor - " + replaceWithHome(fileNames[0]);
}



var swapperIsOn = false
function openSwapper() {
    swapperIsOn = true;
    $("#sCol").show();
    col.s = sCol.selectedIndex;
    let len = figurecontainer.data.length
    if (len > 2) {
        let toRemove = []
        for (let i = 2; i < len; i++) {
            toRemove.push(i)
        }
        Plotly.deleteTraces(figurecontainer, toRemove)
    } else if (len == 1) {
        let thisTrace = JSON.parse(JSON.stringify(iniPointsD))
        thisTrace.line.color = thisTrace.marker.color = colorList[1]
        Plotly.addTraces(figurecontainer, thisTrace)
    }
    let lname = path.basename(fileNames[0])
    Plotly.restyle(figurecontainer, {
        x: [data[th_in][col.y], data[th_in][col.y]],
        y: [data[th_in][col.z], data[th_in][col.s]],
        name: [
            lname + ` ${col.y +1 }:${col.z +1}`,
            lname + ` ${col.y +1}:${col.s +1}`
        ]
    })
    Plotly.relayout(figurecontainer, {
        selectdirection: 'h'
    });
    menu.getMenuItemById("af").enabled = false;
    menu.getMenuItemById("arf").enabled = false;
    $('#files').addClass('disabled')
    updateJSON();
}


function exitSwapper() {
    swapperIsOn = false
    Plotly.deleteTraces(figurecontainer, [0, 1])
    let toUpdate = [JSON.parse(JSON.stringify(iniPointsC))];
    for (let i = 1; i < fullData.length; i++) {
        let thisTrace = JSON.parse(JSON.stringify(iniPointsC))
        thisTrace.line.color = thisTrace.marker.color = colorList[i % 9]
        toUpdate.push(thisTrace);
    }
    Plotly.addTraces(figurecontainer, toUpdate);
    data = fullData[0]
    Plotly.relayout(figurecontainer, {
        selectdirection: 'any'
    });
    $("#sCol, #sColInp").hide();
    updatePlot(all = true);
    makeEditable()
    updateJSON();
    menu.getMenuItemById("af").enabled = true;
    menu.getMenuItemById("arf").enabled = true;
    $('#files').removeClass('disabled')
}



function saveAs() {
    var tmp_name = dialog.showSaveDialog({
        title: "Save As:",
        defaultPath: saveNames[0]
    });
    if (tmp_name === undefined) return
    saveNames[0] = tmp_name;
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
                if (j !== undefined)
                    txt += j.map(n => parseFloat(n).toFixed(8)).join("\t") + "\n";
            };
            txt += "\n";
        };
        fs.writeFileSync(saveNames[0], txt);
        showStatus("Data Saved in file " + replaceWithHome(saveNames[0]));
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
        dialog.showMessageBox({
            type: "warning",
            title: "Can't Plot along Y!!!",
            message: "File(s) have different grid points along the Y axis\nFree version doesn't allow plotting such data",
            buttons: ['Ok']
        });
        return false
    }
    swapped = !swapped;
    var [n1, n2] = ["Y", "X"];
    if (swapped)[n1, n2] = [n2, n1];
    xName = n2;
    [xCol, yCol] = [yCol, xCol];
    data = fullData[0]
    col = fullDataCols[0]
    updateData();
    th_in = 0;
    $slider.slider("value", 0);
    $ch.text(xName + '=' + data[th_in][col.x][0]);
    $("#drag").html((_, html) => html.replace(n1, n2));
};



function sliderChanged() {
    $("#custom-handle").blur()
    $slider.slider("value", th_in)
    $ch.text(xName + '=' + data[th_in][col.x][0])
    startDragBehavior();
    updatePlot()
};



function colsChanged(value) {
    col.s = value;
    updatePlot();
    let lname = path.basename(fileNames[0])
    Plotly.restyle(figurecontainer, {
        name: [
            lname + ` ${col.y+1}:${col.z+1}`,
            lname + ` ${col.y+1}:${col.s+1}`
        ]
    })
    if (!swapped) localStorage.setItem("cols3d", JSON.stringify(col));
};

function col2dChanged(){
    $("select").blur();
    legendNames[0] = path.basename(fileNames[0]) + ` ${col.y + 1}:${col.z + 1}`
    updatePlot(all = false);
    updateOnServer();
    startDragBehavior();
    makeRows()
}

function colChanged(value) {
    $("select").blur();
    fullDataCols[0].z = col.z = value;
    legendNames[0] = path.basename(fileNames[0]) + ` ${col.y + 1}:${col.z + 1}`
    updatePlot(all = false);
    updateOnServer();
    startDragBehavior();
    makeRows()
    if (!swapped) localStorage.setItem("cols3d", JSON.stringify(col));
};



function resizePlot() {
    setTimeout(function () {
        var height = window.innerHeight - document.getElementById("figurecontainer").offsetTop;
        $("#figurecontainer").height(height - 2);
        Plotly.relayout(figurecontainer, {
            autosize: true
        });
    }, 330)
}


function sSwapper() {
    [col.s, col.z] = [col.z, col.s]
    sCol.selectedIndex = col.s;
    zCol.selectedIndex = col.z;
    updatePlot();
    updateOnServer();

}



function selectEvent(event) {
    if (event != undefined) {
        index = [];
        del_dat = [];
        $('.custom-cm').hide();
        for (let pt of event.points) {
            // ind = dpsx.findIndex(n => n == pt.x);
            if (dpsy[pt.pointIndex] == pt.y) {
                index.push(pt.pointIndex);
            };
        };
        index = [...new Set(index)];
        if (rangedSelector) {
            index = Plotly.d3.range(index[0], index[index.length - 1]+1)
            Plotly.restyle(figurecontainer, {selectedpoints: [index]});
        }
    };
};


function updateFigure() {
    var y = [],
        x = [];
    if (lockXc) {
        for (let i of points) {
            y.push(i.handle.y);
        };
        Plotly.restyle(figurecontainer, {
            "y": [y]
        }, 0);
        dpsy = data[th_in][col.z] = y;
    } else {
        for (let i of points) {
            x.push(i.handle.x);
            y.push(i.handle.y);
        };
        Plotly.restyle(figurecontainer, {
            "x": [x],
            "y": [y]
        }, 0);
        dpsy = data[th_in][col.z] = y;
        dpsx = data[th_in][col.y] = x;
    };
};



function clamp(x, lower, upper) {
    return Math.max(lower, Math.min(x, upper));
};


var oldX, oldCord, indd;
function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    drag.origin(function () {
        saveOldData();
        var transform = d3.select(this).attr("transform");
        var translate = transform.substring(10, transform.length - 1).split(/,| /);
        if (index.length) {
            // var [_, _, dat] = JSON.parse(olddata);
            oldX = dpsx;
            oldCord = dpsy;
            indd = oldX.indexOf(this.handle.x);
        };
        return {
            x: translate[0],
            y: translate[1]
        };
    });
    drag.on("drag", function () {
        var xmouse = d3.event.x,
            ymouse = d3.event.y;
        d3.select(this).attr("transform", "translate(" + [xmouse, ymouse] + ")");
        var handle = this.handle;
        var yaxis = figurecontainer._fullLayout.yaxis;
        handle.y = clamp(yaxis.p2l(ymouse), yaxis.range[0], yaxis.range[1]);
        if (index.length) {
            var moved = handle.y - oldCord[indd];
            for (let ind of index) {
                points[ind].handle.y = moved + oldCord[ind];
            };
        };
        if (!lockXc) {
            var xaxis = figurecontainer._fullLayout.xaxis;
            handle.x = clamp(xaxis.p2l(xmouse), xaxis.range[0], xaxis.range[1]);
            if (index.length) {
                var moved = handle.x - oldX[indd];
                for (let ind of index) {
                    points[ind].handle.x = moved + oldX[ind];
                };
            };
        };
        updateFigure();
    });
    drag.on("dragend", function () {
        updateFigure();
        fullData[0] = data;
        updatePlot(all = false)
        if(polyFitLive) polyfit($("#polyInp").val());    // calls for regression fit
        updateOnServer();
        d3.select(".scatterlayer .trace:first-of-type .points path:first-of-type").call(drag);
    });
    d3.selectAll(".scatterlayer .trace:first-of-type .points path").call(drag);
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
    for (let ind of index) {
        points[ind].handle.y += add;
    }
    updateFigure();
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
    return new Promise((resolve, reject)=>{
        var x_list = [],
            y_list = [],
            z_list = [];
        for (let i of data) {
            x_list.push(i[col.x]);
            y_list.push(i[col.y]);
            z_list.push(i[col.z]);
        };
        var s_data = [x_list, y_list, z_list];
        var c2s = []
        for (let w in viewer) viewer[w].webContents.send("sdata", [s_data, swapped, Object.values(col)]);
        resolve();
    })
};




function spreadsheet() {
    editorWindow = new BrowserWindow({
        minWidth: 1200,
        show: false,
        webPreferences: {
            nodeIntegration: true
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
    if (!app.isPackaged) editorWindow.webContents.openDevTools();
    editorWindow.webContents.once("dom-ready", function () {
        editorWindow.webContents.send("slider", [xName, col.x, data]);
    })
}



function openViewer(x) {
    serve = 1;
    var target = "3D_Viewer_Lines.html"
    if (x) target = "3D_Viewer_Surface.html"

    viewerWindow = new BrowserWindow({
        show: false,
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true
        }
    });
    viewerWindow.maximize();
    setTimeout(function () {
        viewerWindow.loadURL(url.format({
            pathname: path.join(__dirname, target),
            protocol: 'file:',
            slashes: true
        }));
    }, 50)
    viewerWindow.on("closed", function () {
        delete viewer[target]
    })
    viewerWindow.show();
    viewerWindow.setMenuBarVisibility(false);
    viewer[target] = viewerWindow;
    if (!app.isPackaged) viewerWindow.webContents.openDevTools();
    viewerWindow.webContents.once("dom-ready", function () {
        updateOnServer()
    })
};