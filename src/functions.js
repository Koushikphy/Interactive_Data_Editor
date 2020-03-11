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


    ddd = data.length != 1;
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);

    //setup the column selector and menu.
    var enableMenu = ['save', 'saveas', 'tfd', 'tfs', "spr", 'swapen', "edat", "fill", "filter", 'af', 'arf']
    if (ddd) { //3
        $(".3D").show()
        var fl = JSON.parse(localStorage.getItem("cols3d"));
        enableMenu.push('pax', 'wire', 'surf');
    } else { //2d
        serve = 0;
        $(".3D").hide()
        var fl = JSON.parse(localStorage.getItem("cols2d"));
        enableMenu.push('rgft', 'lmfit')
        for (let i of ["pax", 'wire', 'surf']) menu.getMenuItemById(i).enabled = false;

    }
    if (fl !== null) col = fl

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

    // console.log(points)
    // plot here
    updateData();
    // console.log(points)

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



function colsChanged(value) {
    col.s = value;
    updatePlot();
    // let lname = path.basename(fileNames[0])
    // Plotly.restyle(figurecontainer, {
    //     name: [
    //         lname + ` ${col.y+1}:${col.z+1}`,
    //         lname + ` ${col.y+1}:${col.s+1}`
    //     ]
    // })
    if (!swapped) localStorage.setItem("cols3d", JSON.stringify(col));
    console.log('cos s chnaged called')
};


function sSwapper() {
    $("#sColInp").blur();
    [col.s, col.z] = [col.z, col.s]
    sCol.selectedIndex = col.s;
    if(ddd){
        zCol.selectedIndex = col.z;
    } else{
        yCol.selectedIndex = col.z;
    }
    // updatePlot();
    colsChanged(col.s);
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


// var dPoints ={x:[],y:[]}

// for(let dat of figurecontainer.data){
//     dPoints.x.push(dat.x)
//     dPoints.y.push(dat.y)
// }
var curveNumber, pointIndex,dragging=false;
figurecontainer.on('plotly_hover',e=>{
    if(!dragging){
    curveNumber = e.points[0].curveNumber;
    pointIndex = e.points[0].pointIndex}
})

function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    var yaxis = figurecontainer._fullLayout.yaxis;
    var xaxis = figurecontainer._fullLayout.xaxis;
    var oldX, oldCord, indd,  oldDat={x:[],y:[]}, dPoints = {x:[],y:[]};

    drag.origin(function () {
        saveOldData();
        let [x,y] = this.getAttribute('transform').slice(10,-1).split(/,| /);
        // get the curve number and the index of the point being dragged
        // let len = figurecontainer.data.length
        // if(len==1){
        //     curveNumber=0
        //     pointIndex = figurecontainer.data[0].x.indexOf(this.handle.x)
        // }else{
        //     for(let i=0;i<len;i++){
        //         let ind = figurecontainer.data[i].y.indexOf(this.handle.y)
        //         // let ind = figurecontainer.data[i].y.indexOf(yaxis.p2l(y))
        //         if(ind>=0){
        //             curveNumber = i;
        //             pointIndex = ind
        //             break
        //         }
        //     }
        // }
        dPoints.x = figurecontainer.data[curveNumber].x
        dPoints.y = figurecontainer.data[curveNumber].y
        if (index.length) oldDat = JSON.parse(JSON.stringify(dPoints))
        console.log(x,y,curveNumber,pointIndex)
        console.log(figurecontainer._hoverdata)
        dragging = true
        return {x,y}
    });
    drag.on("drag", function () {
        let xmouse = d3.event.x, ymouse = d3.event.y;
        let yVal = clamp(yaxis.p2l(ymouse), yaxis.range[0], yaxis.range[1]);
        dPoints.y[pointIndex] = yVal
        if (index.length) {
            let shift = yVal - oldDat.y[pointIndex]
            for (let i of index) dPoints.y[i] = shift + oldDat.y[i]
        };
        // move in x direction
        if (!lockXc) {
            let xVal = clamp(xaxis.p2l(xmouse), xaxis.range[0], xaxis.range[1]);
            dPoints.x[pointIndex] = xVal
            if (index.length) {
                let shift = xVal - oldDat.x[pointIndex]
                for (let i of index) dPoints.x[i] = shift + oldDat.x[i]//  points[ind].handle.x = shift + oldX[ind];
            };
        };
        Plotly.restyle(figurecontainer,{
            x: [dPoints.x],
            y: [dPoints.y]
        }, curveNumber)
    });
    drag.on("dragend", function () {
        // updateFigure();
        fullData[curveNumber][th_in][col.z] = dPoints.y
        if (!lockXc) fullData[curveNumber][th_in][col.y] = dPoints.x
        // fullData[0] = data;
        dragging = false
        // updatePlot(all = false)
        if(polyFitLive) polyfit($("#polyInp").val());
        updateOnServer();
        // d3.select(".scatterlayer .trace:first-of-type .points path:first-of-type").call(drag);
    });
    // d3.selectAll(".scatterlayer .trace:first-of-type .points path").call(drag);
    d3.selectAll(".points path").call(drag);
};
startDragBehavior()


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


function resizePlot() {
    setTimeout(function () {
        var height = window.innerHeight - document.getElementById("figurecontainer").offsetTop;
        $("#figurecontainer").height(height - 2);
        Plotly.relayout(figurecontainer, {
            autosize: true
        });
    }, 330)
}