const { ipcRenderer, shell } = require('electron');
const { downloadImage } = require('../js/download')


function resizePlot() {
    window.dispatchEvent(new Event('resize'));
}


var fired = false
function keyDownfired() {
    if (!fired) {
        fired = true
        undoRedo.save()
    }
}

window.addEventListener('keyup', function (e) {
    if ((document.activeElement.type != "text") && (e.key == 'm' || e.key == 'M' || e.key == 'ArrowDown' || e.key == 'ArrowUp')) {
        fired = false
        fullData[currentEditable] = data;
        viewer3D.update()
    }
})


window.addEventListener('keydown', function (e) {
    if (document.activeElement.type == "text") return
    // console.log(e)
    if (e.key == ' ') {
        if (cRangeY.every(i => isNaN(i))) {
            Plotly.relayout(figurecontainer, {
                "xaxis.autorange": true,
                "yaxis.autorange": true
            })
        } else {
            cRange = true
            setCutRange()
        }

    } else if (e.key == ",") {
        sliderChanged(-1)

    } else if (e.key == ".") {
        sliderChanged(+1)

    } else if ((e.key == "s" || e.key == "S") && !e.ctrlKey) {
        Plotly.relayout(figurecontainer, { dragmode: "select" })

    } else if ((e.key == "z" || e.key == "Z") && !e.ctrlKey && !e.shiftKey) {
        Plotly.relayout(figurecontainer, { dragmode: "zoom" })

    } else if ((e.key == "z" || e.key == "Z") && e.ctrlKey && !e.shiftKey) {
        undoRedo.undo()//unDo()

    } else if ((e.key == "z" || e.key == "Z") && e.ctrlKey && e.shiftKey) {
        undoRedo.redo()//reDo()

    } else if ((e.key == "d" || e.key == "D") && index.length) {
        deleteInterpolate()

    } else if ((e.key == "e" || e.key == "E") && index.length && enable) {
        deleteExtrapolate()

    } else if ((e.key == "k" || e.key == "K") && index.length) {
        dataSupStart()

    } else if ((e.key == "l" || e.key == "L") && index.length) {
        dataSupEnd()

    } else if ((e.key == "m" || e.key == "M") && index.length) {
        keyDownfired(); autoSmooth()

    } else if ((e.key == "c" || e.key == "C") && e.ctrlKey) {
        copyThis()

    } else if ((e.key == "c" || e.key == "C") && index.length && !e.ctrlKey) {
        changeSign()

    } else if ((e.key == "p" || e.key == "P") && index.length && swapper.active) {
        swapData()

    } else if ((e.key == "v" || e.key == "V") && e.ctrlKey) {
        pasteThis()

    } else if ((e.key == "x" || e.key == "X") && index.length && enable) {
        removeBadData()

    } else if (e.key == "ArrowDown" && index.length) {
        keyDownfired(); keyBoardDrag(0)

    } else if (e.key == "ArrowUp" && index.length) {
        keyDownfired(); keyBoardDrag(1)

    } else if (e.key == "Tab" && e.ctrlKey && figurecontainer.data.length != 1) {
        let ind = currentEditable == figurecontainer.data.length - 1 ? 0 : currentEditable + 1
        changeEditable(ind)

    } else if (e.key == "ArrowLeft" && e.ctrlKey && !e.shiftKey) {
        moveReflect(false, false)

    } else if (e.key == "ArrowRight" && e.ctrlKey && !e.shiftKey) {
        moveReflect(true, false)

    } else if (e.key == "ArrowLeft" && !e.ctrlKey && e.shiftKey) {
        moveReflect(false, true)

    } else if (e.key == "ArrowRight" && !e.ctrlKey && e.shiftKey) {
        moveReflect(true, true)

    } else if ((e.key == "a" || e.key == "A") && e.ctrlKey && enable) {
        index = Plotly.d3.range(index[0], index[index.length - 1] + 1, 1)
        Plotly.restyle(figurecontainer, { selectedpoints: [index] })

    } else if (e.key == "1" && e.ctrlKey) {
        diff12()

    } else if (e.key == "2" && e.ctrlKey) {
        merge12()

    } else if (e.key == "3" && e.ctrlKey) {
        diff23()

    } else if (e.key == "4" && e.ctrlKey) {
        merge23()

    }else{
            console.log('No available trigger',e.key)
    }
});


function ipcTrigger(_, d) {
    console.log(d)
    if (d == 'open') {
        fileLoader()

    } else if (d == 'add') {
        addNewFileDialog()

    } else if ((d == 'save' && firstSave) || (d == 'saveas')) {
        saveAs()

    } else if (d == 'save' && !firstSave) {
        saveData()

    } else if (d == 'savepref') {
        saveProp.createui()

    } else if (d == '3dview') {
        viewer3D.open()
        analytics.add('3Dviewer')

    } else if (d == 'tax' && is3D) {
        isswap()
        analytics.add('swapAxis')

    } else if (d == 'spread') {
        spreadsheet()
        analytics.add('spreadsheet')

    } else if (d == 'pamh') {
        lockXc = menu.getMenuItemById("pamh").checked ? 0 : 1
        analytics.add('moveX')

    } else if (d == 'fullscreen') {
        resizePlot()

    } else if (d == 'tswap' && !swapper.active) {
        swapper.open()
        analytics.add('swapper')

    } else if (d == 'tswap' && swapper.active) {
        swapper.close()

    } else if (d == 'tplots' && !$('#sidebar').width() && enable) {
        sidebar.openSideBar()
        analytics.add('plotList')

    } else if (d == 'tplots' && $('#sidebar').width() && enable) {
        sidebar.closeSideBar()

    } else if (toolbarutil.availableTools.includes(d)) {
        toolbarutil.openToolBar(d)

    } else if (d == 'pdash') {
        settingWindow()
        analytics.add('settingWindow')

    } else if (d == 'trigdown') {
        $('#popupEx').show()
        analytics.add('exportImage')

    } else if (d.substring(0, 8) == 'autosave') {
        autoSaver.setTimeOut(parseInt(d.substring(8)))
    }
}


class AutoSaveUtil {
    constructor() {
        this.timeOut = enable ? parseInt(store.get('autosave', 0)) : 0 ;
        this.reminderInterval = null
        this.autoSaveMenuItems = menu.getMenuItemById('autosave').submenu.items;
        this.autoSaveMenuItems[{ 0: 0, 1: 1, 5: 2, 10: 3 }[this.timeOut]].checked = true
    }

    setTimeOut = (val) => {
        this.timeOut = parseInt(val)
        store.set('autosave', this.timeOut)
        this.autoSaveMenuItems.forEach(e => { e.checked = false })
        this.autoSaveMenuItems[{ 0: 0, 1: 1, 5: 2, 10: 3 }[this.timeOut]].checked = true
        this.resetReminder()
    }

    resetReminder = () => {
        clearInterval(this.reminderInterval)
        if (this.timeOut == 0) return
        this.reminderInterval = setInterval(() => {
            if (firstSave) {
                showStatus("You may want to save the file.")
            } else {
                if (!saved) saveData()
            }
        }, this.timeOut * 1000 * 60)
    }
}

const autoSaver = new AutoSaveUtil()



const conMenu = Menu.buildFromTemplate([
    {
        label: 'Change Value',
        visible: enable,
        click() { $('#popupSetVal').show() }
    }, {
        label: 'Change Sign',
        accelerator: 'C',
        visible: enable,
        enabled: enable,
        click: changeSign,
    }, {
        label: 'Remove Data',
        accelerator: 'X',
        visible: enable,
        enabled: enable,
        click: removeBadData
    }, {
        label: 'Smooth Data',
        submenu: [
            {
                label: 'Cubic Spline',
                accelerator: 'D',
                click: deleteInterpolate
            }, {
                label: 'Moving Average',
                accelerator: 'M',
                click: autoSmooth
            }, {
                label: 'Regression Fitting',
                accelerator: 'E',
                click: deleteExtrapolate,
                visible: enable,
                enabled: enable,
            },
        ]
    }
])

figurecontainer.oncontextmenu = () => { if (index.length) conMenu.popup() }// trigger only when some values are selected



// make all the popups draggable
for (let elem of document.getElementsByClassName('title')) {
    elem.addEventListener('mousedown', function (e) {
        x = e.clientX;
        y = e.clientY;
        document.onmouseup = (e) => {
            document.onmouseup = null;
            document.onmousemove = null;
        };
        document.onmousemove = (e) => {
            this.parentElement.style.top = `${this.parentElement.offsetTop - y + e.clientY}px`
            this.parentElement.style.left = `${this.parentElement.offsetLeft - x + e.clientX}px`
            x = e.clientX;
            y = e.clientY;
        };
    })
}



figurecontainer.onclick = (e) => {
    if (e.target.tagName == "rect") {
        Plotly.restyle(figurecontainer, { selectedpoints: [null] });
        index = [];
    }
}


ipcRenderer.on("back", (_, d) => {
    data = d.map(x => transpose(x))
    fullData[currentEditable] = data
    updatePlot();
    setUpColumns()
    startDragBehavior();
    viewer3D.update()
})


ipcRenderer.on("menuTrigger", ipcTrigger)

ipcRenderer.on('checkClose', function (_, _) {
    var res = 0;
    if (!saved) res = dialog.showMessageBoxSync({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Quit without saving?",
        buttons: ['Yes', "No"]
    });
    if (!res) {
        viewer3D.close();
        ipcRenderer.send('checkClose', 'closeIt')
    };
})


window.addEventListener("resize", function () {
    // reposition the slider thumb
    let max = data.length - 1;
    let xPX = th_in * (figurecontainer.offsetWidth - 6 - thumb.offsetWidth) / max + 3;
    thumb.style.left = `${xPX}px`
})


figurecontainer.on("plotly_selected", (ev) => {
    if (ev != undefined) {
        index = [];
        for (let pt of ev.points) {
            if (pt.curveNumber == currentEditable) index.push(pt.pointIndex);
        }
    };
});


figurecontainer.on("plotly_legendclick", function () { // to catch the name if changed from legend
    legendNames = figurecontainer.data.map(e => e.name)
});


figurecontainer.on("plotly_relayout", (lay) => {
    let keys = Object.keys(lay)
    // console.log(keys)
    if (keys.length == 2 && keys.includes("xaxis.autorange") && keys.includes("yaxis.autorange")) {
        cRange = false
        cRangeY = [NaN, NaN]
    } else if ((keys.includes("yaxis.range[0]") && keys.includes("yaxis.range[1]")) || // zoomed view
        (keys.includes("xaxis.range[0]") && keys.includes("xaxis.range[1]"))) {
        cRange = false
    } else if (keys.length == 1 && keys.includes("yaxis.range[0]")) {
        cRange = true;
        cRangeY[0] = lay["yaxis.range[0]"]
        setCutRange()
    } else if (keys.length == 1 && keys.includes("yaxis.range[1]")) {
        cRange = true;
        cRangeY[1] = lay["yaxis.range[1]"]
        setCutRange()
    }
});


ipcRenderer.on("plotsetting", (_, d) => { // incoming info from the plotsetting window
    Plotly.update(figurecontainer, ...d)
})


ipcRenderer.on("colchanged", (_, d) => { // incoming info from the viewer window
    zCol.selectedIndex = d
    colChanged(d)
})

ipcRenderer.on("exportAll", (_, d) => { // incoming info from the viewer window
    viewer3D.exportAll = d
    viewer3D.update()
})

// load file if droped inside the window
document.ondragover = document.ondrop = (ev) => ev.preventDefault()
document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}

// attach change with mouse scroll functionality to selectors
for (let elem of document.getElementsByClassName('sWheel')) {
    elem.addEventListener('wheel', function (e) {
        let cur = this.selectedIndex
        let max = this.length - 1
        let add = e.deltaY > 0 ? 1 : -1
        if ((max == cur && add == 1) || (cur == 0 && add == -1)) return
        this.selectedIndex = cur + add
        this.dispatchEvent(new Event('change'))
    }, { passive: true });
    elem.addEventListener('mouseleave', elem.blur);
}



// attach change X/Y with mouse scroll functionality to the figurecontainer and slider
[figurecontainer, slider].forEach(elem => {
    elem.addEventListener('wheel', (ev) => {
        if (fileNames.length) ev.deltaY < 0 ? sliderChanged(+1) : sliderChanged(-1)
    }, { passive: true })
})




$('.closbtn').on('click', () => { $('.popup').hide() })

$('#dwBtn').on('click', () => {
    downloadImage($('#dfileName').val(), $('#imRes').val(), $('#fileFormat').val())
    $('.popup').hide()
})

$('#valinput').on('change', () => {
    setValue($('#valinput').val())
    $('.popup').hide()
})

$('#valBtn').on('click', () => {
    setValue($('#valinput').val())
    $('.popup').hide()
})

$('.eLink').on('click', function () {
    shell.openExternal(this.dataset.url)
})

// blank eventlistner due to the bug in chrome version
// remove it when upstream chrome fixes it
$('input[type=number]').on('wheel', () => { })