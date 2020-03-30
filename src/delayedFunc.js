// function selUpdate() {
//     var op = "";
//     for (var i = 1; i <= data[0].length; i++) {
//         op += '<option>' + i + '</option>';
//     };
//     for (let i of $("#xCol, #yCol, #zCol, #sCol")) i.innerHTML = op;
//     if(ddd){
//         xCol.selectedIndex = col.x;
//         yCol.selectedIndex = col.y;
//         zCol.selectedIndex = col.z;
//         sCol.selectedIndex = col.s;
//     }else{
//         xCol.selectedIndex = col.y;
//         yCol.selectedIndex = col.z;
//         sCol.selectedIndex = col.s;
//     }
// }
selUpdate = setUpColumns





function changeEditable(index, colorReset=true){
    console.log(`current ${currentEditable}, index : ${index}`)
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
    firstSave = true;
    undoStack = []
    redoStack = []
}


function addNewFileDialog() {
    if (swapperIsOn) {
        dialog.showMessageBoxSync({
            type: "warning", title: "Can't add the file!!!",
            message: "Plot along X before adding a new file.",
            buttons: ['Ok']
        });
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
    // layout.showlegend = true
    let dat = parseData(fs.readFileSync(fname, "utf8"))
    if(dat==undefined) return
    if (fullData[0].length != dat.length) {
        dialog.showMessageBoxSync(parentWindow,{
                type: "warning", title: "Can't add the file!!!",
                message: "Trying to open a file with different grid.\nThis is not supported for 3D data.",
                buttons: ['Ok']
            });
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
    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
}


function addTrace() {
    let ind = fullData.length-1
    let thisTrace = clone(iniPointsD)

    thisTrace.name = legendNames[ind]
    thisTrace.x = fullData[ind][th_in][fullDataCols[ind].y]
    thisTrace.y = fullData[ind][th_in][fullDataCols[ind].z]
    delete thisTrace.marker.color
    delete thisTrace.line.color
    // thisTrace.marker.color = thisTrace.line.color = colorList[ind % 9]
    Plotly.addTraces(figurecontainer, thisTrace);
}




var swapperIsOn = false
function openSwapper() {
    swapperIsOn = true;
    $("#sCol, #sColInp").show();
    // col.s = sCol.selectedIndex;
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
                if (j !== undefined)
                    txt += j.map(n => parseFloat(n).toFixed(8)).join("\t") + "\n";
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
    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    updateData();
    th_in = 0;
    $slider.slider("value", 0);
    $ch.text(xName + '=' + data[th_in][col.x][0]);
    $("#drag").html((_, html) => html.replace(n1, n2));
};



function selectEvent(event) {
    if (event != undefined) {
        index = [];
        for (let pt of event.points) {
            if(pt.curveNumber == currentEditable) index.push(pt.pointIndex);
        }
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
figurecontainer.on("plotly_legendclick", function(){
    var tmpLeg=[]
    for (let i of figurecontainer.data) tmpLeg.push(i.name)
    legendNames = tmpLeg;
});