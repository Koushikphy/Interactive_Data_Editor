
function addNewFileDialog() {
    if (swapperIsOn) {
        dialog.showMessageBoxSync({
            type: "warning",
            title: "Can't add the file!!!",
            message: "Plot along X before adding a new file.",
            buttons: ['Ok']
        });
        return
    }
    var fname = dialog.showOpenDialogSync({
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
        dialog.showMessageBoxSync({
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
    // pointscontainer = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points");
    // points = figurecontainer.querySelector(".trace:first-of-type .points").getElementsByTagName("path");
    points = figurecontainer.getElementsByClassName('points')[0].getElementsByTagName('path')

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
    $("#sCol, #sColInp").show();
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
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = false;
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
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = true;
    $('#files').removeClass('disabled')
}




function saveAs() {
    var tmp_name = dialog.showSaveDialogSync({
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
        dialog.showMessageBoxSync({
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
        // if (rangedSelector) {
        //     index = Plotly.d3.range(index[0], index[index.length - 1]+1)
        //     Plotly.restyle(figurecontainer, {selectedpoints: [index]});
        // }
    };
};





function spreadsheet() {
    editorWindow = new BrowserWindow({
        minWidth: 1200,
        title: "Interactive Data Editor",
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
        title: "Interactive Data Editor",
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



figurecontainer.on("plotly_selected", selectEvent);
figurecontainer.on("plotly_relayout", updateJSON);
figurecontainer.on("plotly_legendclick", function(){
    var tmpLeg=[]
    for (let trace of figurecontainer.data) {
        tmpLeg.push(trace.name)
    }
    legendNames = tmpLeg;
    updateJSON()
});