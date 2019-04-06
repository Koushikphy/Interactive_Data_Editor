//NOTES:
// make a fullData array that holds allthe data for all the files 
// and also keep the data array that stores the data that is being edited currently
// now make changes like earlier and like the data to the full data
//
// trigger legend only when multiple files are present
//











const fs = require("fs");
const path = require('path');
const url = require('url');
var undoStack = [], redoStack = [], editorWindow, viewer = [, ,],
    show = false, saved = true, compFName, firstSave = true, issame = false;

var fullData = [], fullDataCols = [], fileNames = [];

function showStatus(msg) {
    $("#status").html(msg);
    $("#status").toggle('slide', { direction: 'left' }, 500)
        .delay(3000)
        .toggle('slide', { direction: 'left' }, 500);
}

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

    } else { //2D
        col.z = col.y;
        col.y = col.x;
        col.x = 0
    };
    updatePlot(1);
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

    //set custom handler length
    var tmpl = []
    for (let i of data) {
        tmpl.push(i[col.x][0].toString().length);
    }
    $ch.width(Math.floor((Math.max(...tmpl) / 2) + 2) * em2px);
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
    fileNames = []
    $("#sCol, #sColInp").hide();
    $("#particle").remove();
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    $("#full").show();
    if (figurecontainer.data.length == 2) Plotly.deleteTraces(figurecontainer, 1);
    Plotly.relayout(figurecontainer, {
        selectdirection: 'any'
    });
    xCol = document.getElementById("xCol");
    yCol = document.getElementById("yCol");

    //reset menus
    menu.getMenuItemById("pax").visible = true;
    menu.getMenuItemById("pay").visible = false;
    menu.getMenuItemById("swapen").visible = true;
    menu.getMenuItemById("swapex").visible = false;

    for (let i of ["pax", 'wire', 'surf']) {
        menu.getMenuItemById(i).enabled = false;
    }


    // parse the file and data
    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname))
    var extn = path.extname(fname)
    save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation = dirname;
    localStorage.setItem("recent", JSON.stringify(recentLocation));
    data = fs.readFileSync(fname, "utf8");
    data = parseData(data);
    ddd = data.length != 1;
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);


    //setup the column selector and menu.
    var enableMenu = ['save', 'saveas', "spr", 'pamh', 'swapen', "edat", "fill", "filter", 'af', 'arf']
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
    for (let i of enableMenu) { menu.getMenuItemById(i).enabled = true; }

    xCol.selectedIndex = col.x;
    yCol.selectedIndex = col.y;
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;



    fullDataCols.push(col);
    fullData.push(data);
    fileNames.push(fname);

    // plot here
    updateData();
    makeEditable();
    makeRows();

    //update recent menu

    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();

    $ch.text(xName + '=' + data[th_in][col.x][0]);
    $("#drag").html((_, html) => html.replace("Y", "X"));
    resizePlot();
    showStatus('Data file loaded ...');

}

function ind(input) {
    var ind = $('li').index(input)
    selectEditable(ind)
}

//handle case when removing the same  and when there is only one 
function removeRow(row) {
    if (fullData.length == 1) return
    index = $('.closefile').index(row)
    fullData.splice(index, 1);
    fullDataCols.splice(index, 1);
    fileNames.splice(index, 1);
    updatePlotTrace()

}

function makeRows() {
    // iterate this over filenames
    tmp = '<ol>'
    for (let name of fileNames) {
        name = path.basename(name, path.extname(name))
        tmp += `<li onclick='ind(this)'>
        <input type="button" class = 'closefile' value="X">
        <label class='filename' >${name}</label>
        </li>`;
    }
    tmp+='</ol>'
    $('#files').html(tmp)
    $("li .closefile").click(function(e) {
        removeRow(this)
        e.stopPropagation();
     });
}

function addNewFileDialog() {
    var fname = dialog.showOpenDialog({
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname !== undefined) addNewFile(fname[0]);
    fname = fname[0]
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
}


// provide an option to load from the recent file
function addNewFile(fname) {
    layout.showlegend = true
    data = parseData(fs.readFileSync(fname, "utf8"))
    fullData.unshift(data); //add at the beggining i.e instantly editable
    fullDataCols.unshift(JSON.parse(JSON.stringify(col)));
    fileNames.unshift(fname);
    updatePlotTrace();
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);

}



function updatePlotTrace() {
    Plotly.newPlot(figurecontainer, [iniPointsD], layout, {
        displaylogo: false,
        modeBarButtonsToRemove: ['sendDataToCloud']
    });
    for (let i = 0; i < fullData.length - 1; i++) {
        Plotly.addTraces(figurecontainer, iniPointsC)
    };
    if (fullData.length > 1) {
        layout.showlegend = true;
    } else {
        layout.showlegend = false;
    }
    Plotly.relayout(figurecontainer, layout)
    updatMultiPlot();
    makeEditable();
    makeRows()
    figurecontainer.on("plotly_selected", selectEvent);
}


// this will be the new update plot function
function updatMultiPlot() {
    var xl = [], yl = [], names = [];
    for (let i = 0; i < fullData.length; i++) {
        xl.push(fullData[i][th_in][fullDataCols[i].y]);
        yl.push(fullData[i][th_in][fullDataCols[i].z]);
        fnm = path.basename(fileNames[i], path.extname(fileNames[i]))
        names.push(fnm + ` ${fullDataCols[i].y+1}:${fullDataCols[i].z+1}`);
    };
    //remove showlegend from the iniPoints and add it here.
    Plotly.restyle(figurecontainer, {
        'x': xl,
        'y': yl,
        name: names
    })

    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    for (var i = 0; i < dpsx.length; i++) {
        points[i].handle = {
            x: dpsx[i],
            y: dpsy[i]
        };
    };
}

keepTrackIndex = 0
function selectEditable(index) {
    if (index >= fullData.length) return;
    // move the file name in dash board to top
    // change the title to editable file name
    [fullData[0], fullData[index]] = [fullData[index], fullData[0]];
    [fullDataCols[0], fullDataCols[index]] = [fullDataCols[index], fullDataCols[0]];
    [fileNames[0], fileNames[index]] = [fileNames[index], fileNames[0]];
    data = fullData[0];
    col = fullDataCols[0];
    xCol.selectedIndex = col.x;
    yCol.selectedIndex = col.y;
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
    //! reorder filenames here
    updatMultiPlot()
    makeEditable()
    makeRows()
    document.title = "Interactive Data Editor - " + replaceWithHome(fileNames[0]);
}

function makeEditable() {
    pointscontainer = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points");
    points = pointscontainer.getElementsByTagName("path");
    updateEditablePlot();
    startDragBehavior();
}

function updateEditablePlot() {
    // data = fullData[0]
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
}

function compfileLoader() {
    refdat = 1;
    var fname = dialog.showOpenDialog({
        defaultPath: recentLocation,
        properties: ['openFile']
    });

    if (fname === undefined) return;
    fname = fname[0];
    compdata = fs.readFileSync(fname, "utf8");
    compdata = parseData(compdata);
    if (swapped) compdata = expRotate(compdata);
    compFName = replaceWithHome(fname);
    showStatus(compFName + ' loaded for comparison.');
    updatePlot(1);
    menu.getMenuItemById("compf").visible = true;
}


function transpose(m) {

    return m[0].map((_, i) => m.map(x => x[i]));
};


function parseData(strDps) {
    var newdat = [],
        blocks = [];
    strDps = strDps.trim().split(/\t\t\t|\r?\n\r?\n/);
    for (let i of strDps) {
        blocks = i.trim().split("\n");
        for (var j = 0; j < blocks.length; j++) {
            blocks[j] = blocks[j].trim().split(/[\s\t]+/);
            blocks[j] = blocks[j].map(x => parseFloat(x));
        };
        newdat.push(transpose(blocks));
    };
    return newdat;
};



function expRotate(tmpData, i, j) {
    //Bunch up on i-th column and sort along j-th column
    tmpData = tmpData.map(x => transpose(x));
    if (!issame) {
        issame = true;
        var b = tmpData[0].length;
        for (let a of tmpData) {
            if (a.length != b) {
                issame = false;
                break;
            };
        };
    }


    if (issame) {
        tmpData = transpose(tmpData);
        tmpData = tmpData.map(x => transpose(x));
        return tmpData;
    };


    tmpData = [].concat(...tmpData).filter(x => x !== undefined);

    var tmp = new Set();
    for (let a of tmpData) {
        tmp.add(a[i]);
    };
    tmp = [...tmp].sort((a, b) => a - b);
    var newdat = [];
    for (let x of tmp) {
        var tmpdat = [];
        for (let line of tmpData) {
            if (x == line[i]) {
                tmpdat.push(line)
            };
        };
        tmpdat = tmpdat.sort((m, n) => m[j] - n[j]);
        newdat.push(transpose(tmpdat));
    };
    return newdat;
};



function rotateData() {
    if (!data.length) return;
    data = expRotate(data, col.x, col.y);
    if (!compdata.length) return;
    compdata = expRotate(compdata, col.x, col.y);
};



function saveAs() {
    var tmp_name = dialog.showSaveDialog({
        title: "Save As:",
        defaultPath: save_name
    });
    if (tmp_name === undefined) return
    save_name = tmp_name;
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
                if (j == undefined) console.log(i)
                txt += j.map(n => parseFloat(n).toFixed(8)).join("\t") + "\n";
            };
            txt += "\n";
        };
        fs.writeFileSync(save_name, txt);
        showStatus("Data Saved in file " + replaceWithHome(save_name));
        saved = true;
    } catch (error) {
        showStatus("Something went wrong! Couldn't save the data...")
        return false;
    }

};




function editor() {
    editorWindow = new BrowserWindow({
        minWidth: 1200,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    editorWindow.maximize();
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, "handtable.html"),
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



function incRefData() {
    var mark = menu.getMenuItemById("compf").checked;
    if (mark) {
        refdat = 1;
        updatePlot(1);
        showStatus(compFName + ' shown for comparison.');
    } else {
        refdat = 0;
        Plotly.deleteTraces(figurecontainer, 1);
    };


};



function isswap() {
    swapped = !swapped;
    var [n1, n2] = ["Y", "X"];
    if (swapped) [n1, n2] = [n2, n1];
    xName = n2;
    [xCol, yCol] = [yCol, xCol];
    [col.x, col.y] = [col.y, col.x];
    rotateData();
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
    updatePlot(1);
    startDragBehavior();
};



function colsChanged(value) {
    col.s = value;
    updatePlot();
};



function colChanged(value) {
    $("select").blur();
    fullDataCols[0].z = value;
    updatePlot(1);
    updateOnServer();
    startDragBehavior();
    if (!swapped) localStorage.setItem("cols3d", JSON.stringify(col));
};



function resizePlot() {
    var height = window.innerHeight - document.getElementById("header").offsetTop - document.getElementById("figurecontainer").offsetTop;
    $("#figurecontainer").height(height - 2);

    Plotly.relayout(figurecontainer, {
        autosize: true
    });
}


function sSwapper() {
    [col.s, col.z] = [col.z, col.s]
    sCol.selectedIndex = col.s;
    zCol.selectedIndex = col.z;
    updatePlot();
    updateOnServer();

}


function initSwapper() {
    $("#sCol, #sColInp").show()
    refdat = 0;
    swapper = true;
    if (figurecontainer.data.length == 2) Plotly.deleteTraces(figurecontainer, 1);
    Plotly.addTraces(figurecontainer, iniPointsC);
    col.s = sCol.selectedIndex;
    Plotly.relayout(figurecontainer, {
        selectdirection: 'h'
    });
    updatePlot();
    menu.getMenuItemById("swapen").visible = false;
    menu.getMenuItemById("swapex").visible = true;
}



function delSwapper() {
    $("#sCol, #sColInp").hide();
    swapper = false;
    if (figurecontainer.data.length == 2) Plotly.deleteTraces(figurecontainer, 1);
    Plotly.relayout(figurecontainer, {
        selectdirection: 'any'
    });
    updatePlot();
    menu.getMenuItemById("swapen").visible = true;
    menu.getMenuItemById("swapex").visible = false;
}





function selectEvent(event) {
    index = [];
    del_dat = [];
    if (event == undefined) {
        Plotly.restyle(figurecontainer, {
            selectedpoints: [null]
        });
    } else {
        for (let pt of event.points) {
            ind = dpsx.findIndex(n => n == pt.x);
            if (dpsy[ind] == pt.y) {
                index.push(ind);
            };
        };
        index = [...new Set(index)];
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
    updatePlot(1);
    startDragBehavior();
    updateOnServer();
    saved = false;
}


function updateOnServer() {
    if (!serve) return;
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
};

updatePlot = updatMultiPlot
// function updatePlot(both = 0) {
//     dpsy = data[th_in][col.z];
//     dpsx = data[th_in][col.y];
//     console.log(points)
//     if (swapper) {
//         dpsy2 = data[th_in][col.s];
//         Plotly.restyle(figurecontainer, {
//             "x": [dpsx, dpsx],
//             "y": [dpsy, dpsy2]
//         });
//     } else if (both && refdat && compdata.length) {
//         if (figurecontainer.data.length == 1) {
//             Plotly.addTraces(figurecontainer, iniPointsC);
//         };
//         Plotly.restyle(figurecontainer, {
//             "x": [dpsx, compdata[th_in][col.y]],
//             "y": [dpsy, compdata[th_in][col.z]]
//         });
//     } else {
//         Plotly.restyle(figurecontainer, {
//             "x": [dpsx],
//             "y": [dpsy]
//         }, 0);
//     };
//     for (var i = 0; i < dpsx.length; i++) {
//         points[i].handle = {
//             x: dpsx[i],
//             y: dpsy[i]
//         };
//     };

// };