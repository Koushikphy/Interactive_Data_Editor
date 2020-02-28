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
        $("#drag").html((_, html) => html.replace("Y", "X"));
    } else { //2D
        col.z = col.y;
        col.y = col.x;
        col.x = 0
        // col2dChanged()
    };
    fullDataCols[0] = JSON.parse(JSON.stringify(col));




    updatePlot();
    // makeRows();
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
            alert("Bad data found !!!\nCheck the file before openning.")
        }
        return
    }
    return newdat;
};




function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
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
    const fname = dialog.showOpenDialogSync({
        defaultPath: recentLocation,
        properties: ['openFile']
    });
    if (fname !== undefined) fileReader(fname[0]);
}


function fileReader(fname) {
    //check if other file is open
    if (!saved) var res = dialog.showMessageBoxSync({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to open a new file without saving the changes?",
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
    if (figurecontainer.data.length > 1){
        let tt = Plotly.d3.range(1,figurecontainer.data.length)
        Plotly.deleteTraces(figurecontainer, tt);
    }
    if (figurecontainer.layout.selectdirection != 'any') {
        Plotly.relayout(figurecontainer, { selectdirection:'any'});
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

    //a precaution here for the 
    let tmpL = data[0].length
    if(col.x>tmpL) col.x = 0
    if(col.y>tmpL) col.y = 0
    if(col.z>tmpL) col.z = 0
    if(col.s>tmpL) col.s = 0

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

    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();

    resizePlot();
    showStatus('Data file loaded ...');

    // load all scripts here
    if(notLoaded){ // this seems pretty bad, replace with require in future
        $.getScript('../lib/delay.min.js')
        notLoaded = false
    }

}
var notLoaded = true


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


function updatePlot(all = true) {
    //true means just update the current plot i.e. 0th
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




function sliderChanged() {
    $("#custom-handle").blur()
    $slider.slider("value", th_in)
    $ch.text(xName + '=' + data[th_in][col.x][0])
    updatePlot()
    startDragBehavior();
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
        for (let w in viewer) viewer[w].webContents.send("sdata", [s_data, Object.values(col)]);
        resolve();
    })
};

