const Plotly = require('plotly.js-gl3d-dist');
const $ = require('../lib/jquery.min')
const { dialog, BrowserWindow, getCurrentWindow } = require('@electron/remote');
const { clamp, clone, expRotate, parseData, transpose, alertElec, showStatus, showInfo } = require('../js/utils')
const { layout, colorList, iniPointsD } = require('../js/plotUtils')

const xCol = document.getElementById("xCol")
const yCol = document.getElementById("yCol")
const zCol = document.getElementById("zCol")
const sCol = document.getElementById("sCol")
const slider = document.getElementById('range')
const thumb = document.getElementById('thumb')
const figurecontainer = document.getElementById("figurecontainer")


var fullData = [], fullDataCols = [], fileNames = [], saveNames = [], legendNames = [],
    data = [], dpsx = [], dpsy = [], index = [], saved = true, firstSave = true,
    col = { x: 0, y: 0, z: 0, s: 0 }, currentEditable = 0, xName = "X", lockXc = 1,
    swapped = 0, is3D = false, oldDpsLen = 0, th_in = 0;

//start a new plot
Plotly.newPlot(figurecontainer, [clone(iniPointsD)], clone(layout), {
    displaylogo: false,
    editable: true,
    responsive: true,
    modeBarButtonsToRemove: ["toImage", "sendDataToCloud"],
    modeBarButtonsToAdd: [[{
        name: 'Save the image',
        icon: Plotly.Icons.camera,
        click() { $('#popupEx').show() }
    }]]
});
var points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");


enableMenu = (list) => { for (let i of list) menu.getMenuItemById(i).enabled = true }
disableMenu = (list) => { for (let i of list) menu.getMenuItemById(i).enabled = false }
hideMenu = (list) => { for (let i of list) menu.getMenuItemById(i).visible = false }
visibleMenu = (list) => { for (let i of list) menu.getMenuItemById(i).visible = true }





function setUpFor2d() {
    $('.3D').hide()
    $('#yLabel').html('X')
    $('#zLabel').html('Y')
    col = store.get("cols2d", { x: 0, y: 0, z: 0, s: 0 })
    enableMenu(['save', 'saveas', 'tfs', 'tpl', "spr", 'swapen', "extend", "fill", "filter", 'af', 'arf', 'rgfit', 'lmfit', 'smooth', 'fixer'])
    disableMenu(["tax", '3dview'])
}


function setUpFor3d() {
    $('.3D').show()
    $('#yLabel').html('Y')
    $('#zLabel').html('Z')
    setUpSlider();
    col = store.get("cols3d", { x: 0, y: 0, z: 0, s: 0 })
    enableMenu(['save', 'saveas', 'tfs', 'tpl', "spr", 'swapen', "extend", "fill", "filter", 'af', 'arf', 'tax', '3dview', 'smooth', 'fixer'])
    disableMenu(["rgfit", 'lmfit'])
}


function setUpColumns() {
    for (let i in col) col[i] = col[i] < data[0].length ? col[i] : 0
    $("#xCol, #yCol, #zCol, #sCol").html(data[0].map((_, i) => `<option>${i + 1}</option>`).join(''))
    xCol.selectedIndex = col.x;
    yCol.selectedIndex = col.y;
    zCol.selectedIndex = col.z;
    sCol.selectedIndex = col.s;
}

xCol.onchange = yCol.onchange = updateData
zCol.onchange = (ev) => { colChanged(ev.target.selectedIndex); window.dispatchEvent(new Event('columnChanged')) }



function updateData(init = false, all = true) {
    if (!init) {
        col.x = xCol.selectedIndex;
        col.y = yCol.selectedIndex;
        col.z = zCol.selectedIndex;
    }
    th_in = 0;

    if (!swapped) {
        store.set(is3D ? "cols3d" : "cols2d", col)
    } else {
        [col.x, col.y] = [col.y, col.x]
    }

    fullDataCols[currentEditable] = JSON.parse(JSON.stringify(col));
    legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${(swapped ? col.x : col.y) + 1}:${col.z + 1}`

    if (is3D) setUpSlider()

    updatePlot(all);
    startDragBehavior();
    viewer3D.update()
    sidebar.updateSelector()
};


function fileOpener(fname) {
    try {
        return parseData(fs.readFileSync(fname, "utf8"))
    } catch (err) {
        if (err.code === 'ENOENT') {
            recentFiles = recentFiles.filter(x => x != fname);
            recentMenu();
            alertElec("File doesn't exist", 1, "Can't open file")
        }
    }
}


function fileLoader() {
    var fname = dialog.showOpenDialogSync(getCurrentWindow(), {
        defaultPath: recentLocation,
        properties: ['openFile', "multiSelections"]
    });
    if (fname !== undefined) {
        fileReader(fname[0]);
        for (let i = 1; i < fname.length; i++) addNewFile(fname[i])
    }
}


function fileReader(fname) {
    if (!saved) var res = dialog.showMessageBoxSync(getCurrentWindow(), {
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to open a new file without saving the changes?",
        buttons: ['Yes', "No"]
    });
    if (res) return;

    data = fileOpener(fname)
    is3D = data.length != 1;

    //clear everything....
    swapped = 0; xName = "X"; saved = true, index = [], firstSave = true;
    undoRedo.reset()
    swapper.close();


    if (figurecontainer.data.length > 1) { // delete extra traces
        Plotly.deleteTraces(figurecontainer, Plotly.d3.range(1, figurecontainer.data.length))
        if (currentEditable != 0) {
            Plotly.update(figurecontainer, { ...clone(iniPointsD), x: [[1]], y: [[1]] }, clone(layout))
            $(`.scatterlayer .trace:first-of-type .points path`).css({ 'pointer-events': 'all' })
            points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");
            currentEditable = 0
        }
    }


    let dirname = path.dirname(fname);
    let filename = path.basename(fname, path.extname(fname));
    let extn = path.extname(fname);
    let save_name = path.join(dirname, filename + "_new" + extn);
    recentLocation = dirname;

    fullDataCols = [clone(col)]
    fullData = [data]
    fileNames = [fname]
    saveNames = [save_name]
    legendNames = [path.basename(fname) + ` ${col.y + 1}:${col.z + 1}`]

    is3D ? setUpFor3d() : setUpFor2d();
    setUpColumns();
    updateData(true, false);
    showStatus('Data file loaded ...');

    document.title = "Interactive Data Editor - " + replaceWithHome(fname);
    recentFiles = recentFiles.filter(x => x != fname);
    recentFiles.push(fname);
    recentMenu();
    store.set('recent', recentLocation);
    resizePlot();

    $("#particle").remove();
    document.getElementById('branding').style.display = 'block'
    if (window["pJSDom"] instanceof Array) window["pJSDom"][0].pJS.fn.vendors.destroypJS();
    $("#zCol").removeClass("rightBorder")
    toolbarutil.closeToolBar()
    autoSaver.resetReminder()
    sidebar.buildSideBar()
    analytics.add('fileLoaded')
}



function addNewFileDialog() {
    if (swapped) alertElec("Plot along X before adding a new file.", 0, "Can't add the file!!!")

    var fname = dialog.showOpenDialogSync(getCurrentWindow(), {
        defaultPath: recentLocation,
        properties: ['openFile', "multiSelections"]
    });
    if (fname !== undefined) for (let i of fname) addNewFile(i);
}


function addNewFile(fname) {
    dat = fileOpener(fname)
    if (fullData[0].length != dat.length) alertElec("Trying to open a file with different grid.\nThis is not supported for 3D data.", 1, "Can't add the file!!!")

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
    sidebar.buildSideBar()
    analytics.add('fileAdded');
}

function addTrace() {
    let ind = fullData.length - 1
    let thisTrace = {
        ...clone(iniPointsD),
        x: fullData[ind][th_in][fullDataCols[ind].y],
        y: fullData[ind][th_in][fullDataCols[ind].z],
        name: legendNames[ind]
    }

    delete thisTrace.marker.color
    delete thisTrace.line.color

    Plotly.addTraces(figurecontainer, thisTrace);
}


function updatePlot(all = true) {
    //true means just update the current plot i.e. 0th, leave others as it is.
    if (swapper.active) {
        Plotly.restyle(figurecontainer, {
            'x': [data[th_in][col.y], data[th_in][col.y]],
            'y': [data[th_in][col.z], data[th_in][col.s]],
            'name': [col.z, col.s].map(e => path.basename(fileNames[0]) + ` ${(swapped ? col.x : col.y) + 1}:${e + 1}`)
        })
    } else if (all) {
        Plotly.restyle(figurecontainer, {
            'x': fullData.map((el, i) => el[th_in][fullDataCols[i].y]),
            'y': fullData.map((el, i) => el[th_in][fullDataCols[i].z]),
            'name': legendNames
        })
    } else {
        Plotly.restyle(figurecontainer, {
            'x': [data[th_in][col.y]],
            'y': [data[th_in][col.z]],
            "name": [legendNames[currentEditable]]
        }, currentEditable)
    }


    dpsy = data[th_in][col.z]
    dpsx = data[th_in][col.y]
    dpsx.forEach((_, i) => points[i].index = i)
    setCutRange()
}


function sliderChanged(shift = 0) {
    if ((shift == -1 && th_in == 0) || (shift == +1 && th_in == data.length - 1)) return
    th_in += shift
    let max = data.length - 1;
    let xPX = th_in * (figurecontainer.offsetWidth - 6 - thumb.offsetWidth) / max + 3;
    thumb.style.left = `${xPX}px`
    thumb.innerText = `${xName}=${data[th_in][col.x][0]}`
    updatePlot();
    if (oldDpsLen != dpsx.length) {
        startDragBehavior()
        oldDpsLen = dpsx.length
    }
    window.dispatchEvent(new Event('sliderChanged'))
}


function setUpSlider() {
    slider.max = data.length - 1
    slider.value = 0;
    thumb.innerText = `${xName}=${data[0][col.x][0]}`
    thumb.style.left = `${3}px`
    slider.oninput = function () {
        th_in = parseInt(slider.value);
        sliderChanged()
    }
}


function colChanged(value) {
    col.z = value;

    if (smooth.isActive) {
        fullDataCols[0].z = fullDataCols[1].z = value;
        updatePlot(all = true)
        viewer3D.update()
        return
    }

    fullDataCols[currentEditable].z = col.z = value;
    legendNames[currentEditable] = path.basename(fileNames[currentEditable]) + ` ${(swapped ? col.x : col.y) + 1}:${col.z + 1}`
    updatePlot(all = false);

    viewer3D.update()
    if (oldDpsLen != dpsx.length) {
        $(`.scatterlayer .trace:nth-of-type(${currentEditable + 1}) .points path`).css({ 'pointer-events': 'all' })
        startDragBehavior()
        oldDpsLen = dpsx.length
    }
    if (!swapped) store.set(is3D ? "cols3d" : "cols2d", col);
    sidebar.updateSelector()
};




function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    var oldDatX, oldDatY, pIndex;

    drag.origin(function () {
        undoRedo.save()
        let [x, y] = this.getAttribute('transform').slice(10, -1).split(/,| /);
        pIndex = this.index
        if (index.length) {
            oldDatY = dpsy.slice(0)
            if (!lockXc) oldDatX = dpsx.slice(0)
        }
        return { x, y }
    })

    drag.on("drag", function () {
        let yaxis = figurecontainer._fullLayout.yaxis;
        let yVal = clamp(yaxis.p2l(d3.event.y), ...yaxis.range);
        dpsy[pIndex] = yVal //dpsy is a reference to data, so this also modifies the data
        for (let i of index) dpsy[i] = yVal - oldDatY[pIndex] + oldDatY[i]
        if (lockXc) {
            Plotly.restyle(figurecontainer, { y: [dpsy] }, currentEditable)
        } else {// move in x direction
            let xaxis = figurecontainer._fullLayout.xaxis;
            let xVal = clamp(xaxis.p2l(d3.event.x), ...xaxis.range);
            dpsx[pIndex] = xVal
            for (let i of index) dpsx[i] = xVal - oldDatX[pIndex] + oldDatX[i]
            Plotly.restyle(figurecontainer, { x: [dpsx], y: [dpsy] }, currentEditable)
        };
    });
    drag.on("dragend", () => {
        fullData[currentEditable] = data
        viewer3D.update()
    })
    d3.selectAll(`.scatterlayer .trace:nth-of-type(${currentEditable + 1}) .points path`).call(drag);
};


function keyBoardDrag(moveDown) {
    var yaxis = figurecontainer._fullLayout.yaxis;
    var add = yaxis.p2l(1) - yaxis.p2l(0);
    if (moveDown) add = -add;
    for (let i of index) dpsy[i] += add
    Plotly.restyle(figurecontainer, { y: [dpsy] }, currentEditable)
}



class Viewer_3D {
    constructor() {
        this.viewerWindow = null
        this.counter = 0
        this.timer = null
        this.exportAll = false
    }

    isOpen = () => {
        return this.viewerWindow
    }

    open = () => {
        if (this.viewerWindow) {
            this.viewerWindow.focus()
            return
        }
        if (!is3D) return
        this.viewerWindow = createWindow('src/html/3D_Viewer.html', "Interactive Data Editor - 3D Viewer", true)
        this.viewerWindow.on("closed", () => { this.viewerWindow = null; this.exportAll = false })
        this.viewerWindow.webContents.once("dom-ready", this.update)
    }

    update = () => {
        // data operations are very frequent to sending all of them is overkill, lets send them every 10 operations
        if (this.counter % 10 == 0) analytics.add('ops')
        this.counter++

        if (!this.viewerWindow) return;
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {  //send updated value only once within .5 sec
            if (!this.exportAll) {
                let cx = swapped ? col.y : col.x
                let cy = swapped ? col.x : col.y
                var s_data = [[
                    fullData[currentEditable].map(i => i[cx]),
                    fullData[currentEditable].map(i => i[cy]),
                    fullData[currentEditable].map(i => i[col.z])
                ]]
            } else {
                var s_data = fullData.map((el, j) => [
                    el.map(i => i[swapped ? fullDataCols[j].y : fullDataCols[j].x]),
                    el.map(i => i[swapped ? fullDataCols[j].x : fullDataCols[j].y]),
                    el.map(i => i[fullDataCols[j].z])
                ])
            }
            this.viewerWindow.webContents.send("sdata", [s_data, swapped, col.z, data[0].length]);
        }, 500) // a half second pause before sending the data
    }
}

const viewer3D = new Viewer_3D()



function changeEditable(index, reset = false) {
    if (smooth.isActive) {
        // when smooth mode is on just change the editable so that the other trace can be sent to the 3d Viewer
        currentEditable = currentEditable ? 0 : 1;
        viewer3D.update()
        return
    }
    if (swapper.active) {
        [col.s, col.z] = [col.z, col.s]
        sCol.selectedIndex = col.s;
        zCol.selectedIndex = col.z;
        updatePlot();
        viewer3D.update()
        if (!swapped) store.set("cols3d", col);
        return
    }
    $(`.scatterlayer .trace .points path`).css({ 'pointer-events': 'none' })

    let line1 = figurecontainer._fullData[currentEditable].line
    let marker1 = figurecontainer._fullData[currentEditable].marker

    let line2 = figurecontainer._fullData[index].line
    let marker2 = figurecontainer._fullData[index].marker

    line1.dash = Number(line1.dash) // weird but _fullData store dash as string
    line2.dash = Number(line2.dash)

    Plotly.restyle(figurecontainer, {
        line: [line2, line1],
        marker: [marker2, marker1]
    }, [currentEditable, index])

    if (fullData[currentEditable][0].length != fullData[index][0].length) setUpColumns()
    currentEditable = index

    $(`.scatterlayer .trace:nth-of-type(${currentEditable + 1}) .points path`).css({ 'pointer-events': 'all' })
    points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${currentEditable + 1}) .points`)
        .getElementsByTagName("path");

    if (reset) return // used for reset

    data = fullData[currentEditable]
    col = fullDataCols[currentEditable]
    dpsy = data[th_in][col.z];
    dpsx = data[th_in][col.y];
    dpsx.forEach((_, i) => { points[i].index = i })
    startDragBehavior();
    firstSave = true; undoStack = []; redoStack = []
    zCol.selectedIndex = col.z
    document.title = "Interactive Data Editor - " + replaceWithHome(fileNames[currentEditable])
    viewer3D.update()
}


class ValueSwapper {
    constructor() {
        this.active = false
        this.affectMenu = ['extend', 'fill', 'filter', 'af', 'arf', 'smooth', "fixer", "tpl"]
        sCol.onchange = this.swapperColChanged
        $('#intSwap').on('click', this.toggleColumn);
    }

    open = () => {
        if (figurecontainer.data.length != 1) alertElec("Can't use this feature when multiple plots are open.", 0, "Operation Unavailable")
        let thisTrace = {
            ...iniPointsD,
            x: data[th_in][col.y],
            y: data[th_in][col.s],
            name: path.basename(fileNames[0]) + ` ${col.y + 1}:${col.s + 1}`
        }
        thisTrace.line.color = thisTrace.marker.color = colorList[1]
        Plotly.addTraces(figurecontainer, thisTrace)
        Plotly.relayout(figurecontainer, { selectdirection: 'h' })
        $("#sCol, #sColInp,#intSwap").show();
        $("#zCol").addClass("rightBorder")
        disableMenu(this.affectMenu)
        this.active = true
    }

    close = () => {
        if (!this.active) return
        Plotly.deleteTraces(figurecontainer, 1)
        Plotly.relayout(figurecontainer, { selectdirection: 'any' });
        data = fullData[0]
        $("#sCol, #sColInp,#intSwap").hide();
        $("#zCol").removeClass("rightBorder")
        enableMenu(this.affectMenu)
        this.active = false
    }

    swapperColChanged = (ev) => {
        col.s = ev.target.selectedIndex;
        updatePlot();
        if (!swapped) store.set("cols3d", col);
    };

    toggleColumn = () => {
        [col.s, col.z] = [col.z, col.s]
        zCol.selectedIndex = col.z
        sCol.selectedIndex = col.s
        updatePlot();
    }

}

const swapper = new ValueSwapper()



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
    var tmpData = swapped ? expRotate(data, col.y, col.x) : data
    // https://www.npmjs.com/package/d3-format#locale_formatPrefix
    //^ using d3 format, `g` means decimal/exponent notation, rounded to significant digits
    // TODO: let the users chose what format to use for each column along with delimiter.
    const fmt = Plotly.d3.format(".8g")
    try {
        var txt = tmpData.map(x => transpose(x).map(y => y.map(fmt).join('\t')).join('\n')).join('\n\n')
        fs.writeFileSync(saveNames[currentEditable], txt);
        showStatus("Data Saved in file " + replaceWithHome(saveNames[currentEditable]));
        saved = true;
        autoSaver.resetReminder()
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

    if (fullData.length > 1 && !fullData.every(v => v.length == fullData[0].length)) { // reverse back
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


class UndoRedoUtilities {

    constructor() {
        this.stackLen = 10
        this.undoStack = []
        this.redoStack = []
        this.workingArr = [];
    }

    save = () => {
        if (!data.length) return;
        this.redoStack = []
        if (this.undoStack.length == this.stackLen) this.undoStack.splice(0, 1)
        this.undoStack.push(this.getData())
    }

    undo = () => {
        if (this.undoStack.length) {
            this.workingArr = this.redoStack;
            this.perform(this.undoStack.pop())
        }
    }

    redo = () => {
        if (this.redoStack.length) {
            this.workingArr = this.undoStack
            this.perform(this.redoStack.pop())
        }
    }
    reset = () => {
        this.undoStack = []
        this.redoStack = []
    }

    getData = () => JSON.stringify([th_in, col, swapped, data[th_in]])


    perform = (olddata) => {
        var arr, tmpSwapped, tmpTh_in;
        [tmpTh_in, col, tmpSwapped, arr] = JSON.parse(olddata);
        if (tmpSwapped != swapped) isswap();

        zCol.selectedIndex = col.z;
        sCol.selectedIndex = col.s;
        th_in = tmpTh_in
        this.workingArr.push(this.getData())
        data[th_in] = arr;

        sliderChanged()
        // updatePlot(false);
        // startDragBehavior();
        // updateOnServer();
        viewer3D.update()
        saved = false;
    }
}

const undoRedo = new UndoRedoUtilities()


function createWindow(file, title, max = false) {
    let tmpWindow = new BrowserWindow({
        minHeight: 700,
        minWidth: 600,
        show: false,
        title: title,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
            nativeWindowOpen: true
        }
    });

    if (max) tmpWindow.maximize();
    tmpWindow.loadFile(file)
    tmpWindow.setMenuBarVisibility(false);
    tmpWindow.show();
    return tmpWindow
}

var settingEditWindow = null
function settingWindow() {
    if (settingEditWindow) {
        settingEditWindow.focus()
        return
    }
    settingEditWindow = createWindow("src/html/pop.html", "Interactive Data Editor - Plot Settings", false)
    settingEditWindow.on("closed", () => { settingEditWindow = null })
    settingEditWindow.webContents.once("dom-ready", () => {

        settingEditWindow.webContents.send("plotsetting", [figurecontainer.layout, figurecontainer.data.map((el, i) => ({
            "Title": el.name,
            "Style": el.mode,
            "Marker": {
                ...el.marker,
                "color": figurecontainer._fullData[i].marker.color
            },
            "Line": {
                ...el.line,
                "color": figurecontainer._fullData[i].line.color
            }
        }))]);
    })
}


var editorWindow = null
function spreadsheet() {
    if (editorWindow) {
        editorWindow.focus()
        return
    }
    editorWindow = createWindow("src/html/spreadsheet.html", "Interactive Data Editor - Spreadsheet", true)
    editorWindow.on("closed", () => { editorWindow = null })

    editorWindow.webContents.once("dom-ready", () => {
        editorWindow.webContents.send("slider", [xName, col.x, data]);
    })
}


class sideBarUtil {
    constructor() {
        this.sideBarDiv = document.getElementById("files");
        this.minWidth = window.innerWidth / 4.0;
        this.curWidth = this.minWidth;
        this.open = false

        $('#split-bar').mousedown((e) => {
            e.preventDefault();
            $(document).mousemove((e) => {
                e.preventDefault();
                var x = e.pageX - $('#sidebar').offset().left;
                if (x > this.minWidth && x < window.innerWidth / 2.5) {
                    $('#sidebar').width(x - 2);
                    this.curWidth = x;
                    resizePlot()
                }
            })
        });

        $(document).mouseup(function (e) {
            $(document).unbind('mousemove');
        });

        $('#closeSideBar').click(this.closeSideBar)

    }

    buildSideBar = () => {
        document.getElementById("files").innerHTML = fileNames.map((i, j) => `
            <div class="fList ${currentEditable == j ? 'selected' : ''}"  data-index=${j}>
                <div class="nameBar">
                    <div class="fName" title='${i}' data-index=${j} >
                        ${j + 1}. ${path.basename(i)}
                    </div>
                    <img class="fcpyBtn" title='Use this file' src="./copy.svg" data-index=${j} data-type='copy'>
                    <img class="fclsBtn" title='Remove this file' src="./close.svg" data-index=${j} data-type='close'>
                </div>

                <div class="colBar">
                    <div class="sideBar" style="display:${is3D ? "inline-flex" : "none"}" >
                        <span>X</span>
                        <select data-index=${j} data-type='x' class='sideSelector'>
                            ${fullData[j][0].map((_, k) => `<option ${k == fullDataCols[j].x ? "selected" : ""} >${k + 1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sideBar">
                        <span>${is3D ? "Y" : "X"}</span>
                        <select data-index=${j} data-type='y' class='sideSelector'>
                            ${fullData[j][0].map((_, k) => `<option ${k == fullDataCols[j].y ? "selected" : ""} >${k + 1}</option>`).join('')}
                        </select>
                    </div>
                    <div class="sideBar">
                        <span>${is3D ? "Z" : "Y"}</span>
                        <select  data-index=${j} data-type='z' class='sideSelector'>
                            ${fullData[j][0].map((_, k) => `<option ${k == fullDataCols[j].z ? "selected" : ""} >${k + 1}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>`
        ).join(' ')

        $('.fName').click(this.editableManager)
        $('.fcpyBtn,.fclsBtn').click(this.traceManager)
        $('.sideSelector').on('change', this.columnManager)

        this.curWidth = this.minWidth = $(".colBar").width() + 30
    }

    editableManager() { // context dom
        $('.fList').removeClass('selected');
        $(this).closest('.fList').addClass('selected')
        let index = parseInt(this.dataset.index);
        if (currentEditable != index) changeEditable(index)
    }

    traceManager = (ev) => { //context instance
        let type = ev.target.dataset.type;
        let index = parseInt(ev.target.dataset.index)
        if (type == 'copy') {
            fullData.push(fullData[index]); //not cloning same file
            fullDataCols.push(clone(fullDataCols[index]))
            fileNames.push(fileNames[index])
            saveNames.push(saveNames[index])
            legendNames.push(clone(legendNames[index]))
            addTrace()
        } else if (type == 'close') {
            if (index == currentEditable) return
            if (index <= currentEditable) {
                if (swapper.active) return
                currentEditable = index
                $(`.scatterlayer .trace .points path`).css({ 'pointer-events': 'none' })
                $(`.scatterlayer .trace:nth-of-type(${index + 1}) .points path`).css({ 'pointer-events': 'all' })
                points = figurecontainer.querySelector(`.scatterlayer .trace:nth-of-type(${index + 1}) .points`).getElementsByTagName("path");
                dpsx.forEach((_, i) => { points[i].index = i })
            }
            Plotly.deleteTraces(figurecontainer, index)
            fullData.splice(index, 1)
            fullDataCols.splice(index, 1)
            fileNames.splice(index, 1)
            saveNames.splice(index, 1)
            legendNames.splice(index, 1)
        }
        this.buildSideBar()
        if (viewer3D.exportAll && currentEditable != index) viewer3D.update()
    }

    columnManager() { //context dom
        let type = this.dataset.type;
        let index = this.dataset.index
        let val = this.selectedIndex
        if (index == currentEditable) {
            if (type == 'z') {
                zCol.selectedIndex = val
                colChanged(val)
            } else if (type == 'y') {
                yCol.selectedIndex = val
                updateData()
            } else if (type == 'x') {
                xCol.selectedIndex = val
                updateData()
            }
        } else {
            fullDataCols[index][type] = val
            let colC = fullDataCols[index]
            legendNames[index] = path.basename(fileNames[index]) + ` ${(swapped ? colC.x : colC.y) + 1}:${colC.z + 1}`
            updatePlot(true)
            if (viewer3D.exportAll) viewer3D.update()
        }
    }

    openSideBar = () => {
        $("#sidebar").css("width", this.curWidth)
        $("#sidebar").css("border-width", "1")
        setTimeout(resizePlot, 100)
        this.open = true
        this.buildSideBar()
    }

    closeSideBar = () => {
        if (!this.open) return
        $("#sidebar").css("width", "0")
        setTimeout(resizePlot, 100)
        setTimeout(() => {
            $("#sidebar").css("border-width", "0")
        }, 50)
        this.open = false
    }

    updateSelector = () => {
        if (!this.open) return
        $(`.sideSelector[data-type="x"][data-index="${currentEditable}"`)[0].selectedIndex = xCol.selectedIndex
        $(`.sideSelector[data-type="y"][data-index="${currentEditable}"`)[0].selectedIndex = yCol.selectedIndex
        $(`.sideSelector[data-type="z"][data-index="${currentEditable}"`)[0].selectedIndex = zCol.selectedIndex
    }
}

const sidebar = new sideBarUtil()

class Analytics {
    constructor() {
        // read from userdata if client id is already given or is it a new client
        this.cid = store.get('cid')
        if (this.cid === undefined) {
            this.cid = crypto.randomUUID();
            store.set('cid', this.cid)
        }

        // now read the analytics id, read from .env file
        this.uuid = fs.readFileSync(path.join(app.getAppPath(), '.env'), 'utf8').trim()
        this.queue = store.get('analyticsQueue', [])
        // do not send analytics in testing mode
        // send analytics data only in production, otherwise dev mode will spam the data
        if (app.isPackaged) {
            var shown = store.get('shown', 0)
            store.set('shown', shown + 1)
            if (shown % 10 == 0) { // shown after every 10 opening
                setTimeout(() => {
                    showInfo(
                        "Note from developer !",
                        "User data share policy",
                        "Interactive Data Editor will collect and share user data with the developer to give a better user experience. Only data related to the software usage will be collected, and any sensitive information associated with the user's system will not be shared.",
                    )
                }, 300)
            }
            this.add()
            this.send() // send the load event immidiately
            setInterval(this.send.bind(this), 1000 * 60 * 10) // send every 10 minutes
        }
    }

    // analytics will save all the data in a queue and send all together in a single POST to analytics server every 5 minutes.
    add(page = 'home') {
        this.queue.push(page)
        store.set('analyticsQueue', this.queue)
    }

    // Starting from version 10, Interactive Data Editor will collect and share user data with the developer to give a  better user experience. Only data related to the software usage will be collected, and any sensitive information associated with the user's system will not be shared.
    send() {
        if (this.queue.length == 0) return
        const type = 'pageview'
        fetch('https://www.google-analytics.com/batch', {
            method: 'POST',
            body: this.queue.map(e => `v=1&t=${type}&tid=${this.uuid}&cid=${this.cid}&dp=${e}`).join('\n')
        }).then(d => {
            if (d.status == 200) {
                // analytics send successful
                this.queue = []
                store.set('analyticsQueue', this.queue)
            } else {
                console.error("Cannot post to analytics server")
            }
        })
    }
}

const analytics = new Analytics()