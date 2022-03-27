const { repeatMirrorData, fillMissingGrid, useRegression, applyCutOFF, useSpline, levenMarFit, regressionFit, fixBadData } = require('../js/utils');
const { splineSmoother } = require('../js/numeric');
const { iniPointsSm, iniPointsF } = require('../js/plotUtils')

// copy paste values between different x/y
var copyVar;
function copyThis() {
    copyVar = JSON.stringify([dpsx, dpsy]);
}

function pasteThis() {
    var [t1, t2] = JSON.parse(copyVar);
    if (!t1.every((v, i) => v === data[th_in][col.y][i])) alertElec("Copy paste between different data set is not supported!")
    undoRedo.save()//saveOldData();
    data[th_in][col.y] = t1
    data[th_in][col.z] = t2
    endJobs()
}


function swapData() {
    undoRedo.save()//saveOldData();
    for (let i of index) [data[th_in][col.z][i], data[th_in][col.s][i]] = [data[th_in][col.s][i], data[th_in][col.z][i]]
    endJobs({ minimal: false })
}


function moveReflect(right, mirror) {
    undoRedo.save()//saveOldData();
    let ind = index[index.length - 1] + 1;
    let tmp = dpsy.slice(index[0], ind)
    if (!right) ind = index[0] - index.length;
    if (mirror) tmp.reverse();
    tmp.shift();
    dpsy.splice(ind, tmp.length, ...tmp);
    endJobs()
};


function repeatMirror() {
    last = parseFloat($("#einp").val());
    times = parseFloat($("#etime").val());
    if (!last | !times) alertElec('Invalid inputs.')
    mirror = $("#repSel")[0].selectedIndex;

    if (!data.every(e => e[col.y].includes(last))) alertElec("Endpoint must exist !!!")

    data = repeatMirrorData(data, col.y, last, times, mirror)
    endJobs({ startdrag: true, minimal: false })
    showStatus(`Data ${mirror ? 'mirrored' : 'repeated'} ${times} times...`)
}



function dataFiller() {
    let start = parseFloat($("#fstart").val());
    let stop = parseFloat($("#fend").val());
    let step = parseFloat($("#fstep").val());
    let allowRegression = $("#expSel")[0].selectedIndex ? true : false;
    if (document.getElementById('gridSel').selectedIndex) {
        if (step != parseInt(step)) alertElec("Number of grid must be integer")
        step = (stop - start) / (step - 1)
    }

    if (isNaN(start) | isNaN(step) | !step) alertElec('Invalid inputs.')

    if (!data[0][col.y].every((i, j, k) => j == 0 ? true : i > k[j - 1])) alertElec('Monotonically increasing values required for interpolation.')

    data = fillMissingGrid(data, ddd, col, allowRegression, start, stop, step)
    endJobs({ startdrag: true, minimal: false })
    showStatus('Missing values are filled...');
}



function filterData() {
    let condition = $("#flSel")[0].selectedIndex;
    let thrsh = parseFloat($("#flc").val());
    let fillVal = parseFloat($("#flf").val());
    let colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    data = applyCutOFF(data, colmn, condition, thrsh, fillVal)

    endJobs({ minimal: false })
    showStatus('Data filtered...');
}


function regWrapper(op = 1) {
    try {
        let ind = index.filter((i) => i < dpsx.length)
        if (!ind.length) throw { ty: 'sS', msg: "No data points selected." }
        undoRedo.save()//saveOldData()
        dpsy = data[th_in][col.z] = useRegression(dpsx, dpsy, ind, op)
        endJobs()
    } catch (e) {
        e.ty == 'sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}

deleteExtrapolate = () => { regWrapper(1) }
dataSupEnd = () => { regWrapper(2) }
dataSupStart = () => { regWrapper(3) }


function deleteInterpolate() {
    try {
        let ind = index.filter((i) => i < dpsx.length)
        if (!ind.length) throw { ty: 'sS', msg: "No data points selected." }
        if (ind.includes(0) || ind.includes(dpsx.length - 1)) throw { ty: 'sS', msg: "Can't apply spline at endpoints" }
        if (!data[0][col.y].every((i, j, k) => j == 0 ? true : i > k[j - 1])) throw { ty: 'sS', msg: 'Monotonically increasing values required.' }

        undoRedo.save()//saveOldData()
        dpsy = data[th_in][col.z] = useSpline(dpsx, dpsy, ind)
        endJobs()
    } catch (e) {
        e.ty == 'sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}


function autoSmooth() {
    try {
        let ind = index.filter((i) => i < dpsx.length)
        if (!ind.length) throw { ty: 'sS', msg: "No data points selected." }
        if (ind.includes(0) || ind.includes(dpsx.length - 1)) throw { ty: 'sS', msg: "Can't apply moving average at endpoints" }
        // for (let i of ind) dpsy[i] = (dpsy[i - 1] + dpsy[i] + dpsy[i + 1]) / 3.0
        for (let i of ind) dpsy[i] = _mv(dpsx.slice(i - 1, i + 2), dpsy.slice(i - 1, i + 2)) // for uneven grid
        data[th_in][col.z] = dpsy;
        endJobs({ serVerUpdate: false })
    } catch (e) {
        e.ty == 'sS' ? showStatus(e.msg) : console.error(e.stack)
    }
    function _mv(xx, yy) {
        // xx and yy should be a length of 3
        h = xx[1] - xx[0]
        hp = xx[2] - xx[1]
        val = (yy[0] / h + yy[2] / hp) / (1.0 / h + 1.0 / hp)
        return (yy[1] + val) / 2.0
    }
}



function changeSign() {
    let ind = index.filter((i) => i < dpsx.length)
    undoRedo.save()//saveOldData();
    for (let i of ind) data[th_in][col.z][i] = -data[th_in][col.z][i];
    endJobs()
};



function setValue(val) {
    undoRedo.save()//saveOldData();
    let value = parseFloat(val);
    if (isNaN(value)) return;
    for (let i of index) data[th_in][col.z][i] = value;
    endJobs()
}


function removeBadData() {
    undoRedo.save()//saveOldData()
    data[th_in] = data[th_in].map(x => x.filter((_, i) => !index.includes(i)))
    endJobs({ clearIndex: true, startdrag: true, minimal: false })
}


function endJobs({ resize = false, startdrag = false, clearIndex = false, serVerUpdate = true, minimal = true } = {}) {
    fullData[currentEditable] = data;
    minimal ? Plotly.restyle(figurecontainer, { y: [dpsy] }, currentEditable) : updatePlot(false);
    if (resize) resizePlot()
    if (serVerUpdate) viewer3D.update() // updateOnServer();
    if (startdrag) startDragBehavior()
    if (clearIndex) {
        Plotly.restyle(figurecontainer, { selectedpoints: [null] })
        index = []
    }
    saved = false;
}



// clip value to only positive ones
const clip = (val) => val > 0 ? val : 0;


function diff12() {
    if (swapped) alertElec('Operation not available in swapped mode');
    if (data[0].length != 6) alertElec('Data not in proper structure')
    data = data.map(el => [...el, el[4].map((i, j) => clip(i - el[3][j]))])
    col.z = 6
    fullDataCols[currentEditable].z = 6
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    // updateOnServer()
    viewer3D.update()
}


function merge12() {
    if (swapped) alertElec('Operation not available in swapped mode');
    if (data[0].length != 7) alertElec('Data not in proper structure')
    data = data.map(el => {
        el[4] = el[3].map((i, j) => i + clip(el[6][j]))
        return el.slice(0, 6)
    })
    col.z = 4
    fullDataCols[currentEditable].z = 4
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    // updateOnServer()
    viewer3D.update()
}

function diff23() {
    if (swapped) alertElec('Operation not available in swapped mode');
    if (data[0].length != 6) alertElec('Data not in proper structure')
    data = data.map(el => [...el, el[5].map((i, j) => clip(i - el[4][j]))])
    col.z = 6
    fullDataCols[currentEditable].z = 6
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    // updateOnServer()
    viewer3D.update()
}


function merge23() {
    if (swapped) alertElec('Operation not available in swapped mode');
    if (data[0].length != 7) alertElec('Data not in proper structure')
    data = data.map(el => {
        el[5] = el[4].map((i, j) => i + clip(el[6][j]))
        return el.slice(0, 6)
    })
    col.z = 5
    fullDataCols[currentEditable].z = 5
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    // updateOnServer()
    viewer3D.update()
}


class FitData {
    constructor() {
        this.active = false
        this.type = null
        this.res = null
        document.getElementById('rgfit_apply').onclick = this.rgfit
        document.getElementById('lmfit_apply').onclick = this.lmfit
        document.getElementById('rgfit_save').onclick = document.getElementById('lmfit_save').onclick = this.save
    }

    open = (type) => {
        this.active = true
        this.type = type
        Plotly.addTraces(figurecontainer, iniPointsF);
    }

    close = () => {
        this.active = false
        Plotly.deleteTraces(figurecontainer, 1);
        if (this.type == 'lmfit') Plotly.relayout(figurecontainer, { annotations: [{ text: '', showarrow: false }] })
        if (this.type = 'rgfit') document.getElementById('formulaStr').innerHTML = ' '
        this.type = null
    }


    lmfit = () => {
        // use a form and parse multiple values
        let funcStr = $('#funcStr').val()
        let paramList = $('#paramList').val().split(',')
        let maxIter = parseInt($('#iterationVal').val())
        let parameters = $('#intVal').val().split(',').map(x => parseFloat(x))
        let maxVal = $('#maxVal').val().split(',').map(x => parseFloat(x))
        let minVal = $('#minVal').val().split(',').map(x => parseFloat(x))
        let dampVal = parseFloat($('#dampVal').val())
        let stepVal = parseFloat($('#stepVal').val())
        let etVal = parseFloat($('#etVal').val())
        let egVal = parseFloat($('#egVal').val())

        let [fity, params, chiError] = levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal, stepVal, etVal, egVal)

        let anotX = 0.5, anotY = 1;
        if (figurecontainer.layout.annotations != undefined) {  // persists annotation if already used
            anotX = figurecontainer.layout.annotations[0].x
            anotY = figurecontainer.layout.annotations[0].y
        }

        let anotText = `y = ${$('#funcStr').val()}<br>
                ${$('#paramList').val().split(',').join(', ')} = ${params.map(x => x.toPrecision(5)).join(', ')}
                <br>&#967;<sup>2</sup> Error = ${chiError.toPrecision(5)}`
        Plotly.update(figurecontainer, { x: [dpsx], y: [fity] }, {
            annotations: [{
                xref: 'paper', x: anotX,
                yref: 'paper', y: anotY,
                showarrow: false,
                text: anotText,
                bordercolor: '#000000'
            }]
        }, 1)
        this.res = fity
    }

    rgfit = () => {
        let n = parseInt($('#polyInp').val())
        if (n >= dpsx.length) {
            showStatus(`Fitting of order ${n} is not possible.`); return
        }
        let [fity, coeff] = regressionFit(dpsx, dpsy, n)
        this.res = fity
        Plotly.restyle(figurecontainer, { 'x': [dpsx], 'y': [fity] }, 1)

        document.getElementById('formulaStr').innerHTML = 'y = ' + coeff.map((el, i) => {
            if (i == 0) return el.toPrecision(5)
            return `${el > 0 ? '+' : ''}${el.toPrecision(5)}${i > 1 ? `x<sup>${i}</sup>` : 'x'}`
        }).join(' ')
    }

    save = () => {
        let dirname = path.dirname(fileNames[0]);
        let filename = path.basename(fileNames[0], path.extname(fileNames[0]));
        let extn = path.extname(fileNames[0]);
        let save_name = path.join(dirname, filename + "_fit" + extn);

        var tmp_name = dialog.showSaveDialogSync({
            title: "Save As:",
            defaultPath: save_name
        });
        if (tmp_name === undefined) return

        try {
            var txt = transpose([dpsx, dpsy, this.res]).map(i => i.join('\t')).join('\n')
            fs.writeFileSync(tmp_name, txt);
            showStatus("Data Saved in file " + replaceWithHome(tmp_name));
            saved = true;
        } catch (error) {
            showStatus("Something went wrong! Couldn't save the data...")
            return false;
        }
    }
}

const fitData = new FitData()



class Smoother {
    constructor() {
        this.res = null;
        this.isActive = false;
        this.shown = false
        document.getElementById('smoothApl').onclick = this.saveApprox
        document.getElementById('smoothInp').onmouseover = (ev) => { ev.target.focus() }
        document.getElementById('smoothInp').oninput = this.smoothApprox
    }

    open = () => {
        this.isActive = true
        Plotly.addTraces(figurecontainer, iniPointsSm);
        fullData.push([])
        fullDataCols.push(col)
        legendNames.push('Smooth Approximation')
        this.smoothApprox()
        analytics.add('smoother')
        if (!this.shown && ddd) {
            showStatus('Press Ctrl+Tab to view the approximated data in 3D viewer.')
            this.shown = true
        }
    }

    close = () => {
        currentEditable = 0;
        this.isActive = false
        this.res = null

        try {
            Plotly.deleteTraces(figurecontainer, 1);
        } catch (error) {
            console.log('AutoSmoother Error: No trace found while trying to delete the approximated trace.')
        }
        fullData.splice(1, 1)
        fullDataCols.splice(1, 1)
        legendNames.splice(1, 1)

    }

    smoothApprox = () => {

        const smtFactor = parseFloat(document.getElementById('smoothInp').value)
        const notAllCol = !document.getElementById('smCheck').checked
        const notAllX = !document.getElementById('smColCheck').checked
        const cz = col.z
        if (smtFactor > 1 || smtFactor < 0) alertElec("Smoothing factor must be in between 0 and 1")

        var cx = col.x, cy = col.y;
        // smooth in one direction 
        this.res = data.map((dat, ii) => (notAllX && ii != th_in) ? dat : dat.map((y, ind) => (ind == cx || ind == cy || (notAllCol && ind != cz)) ? y : splineSmoother(dat[cy], y, smtFactor)))
        // for 2D case, we have to smooth it in two direction...
        //NOTE: here just ignoring the other side smoothing, this is simpler and the other side can be simply done with rotating the axis
        // if(data.length!=1) {
        //     var [cx, cy] = [cy, cx];
        //     // now rotate the direction to smooth in another direction
        //     res = expRotate(res, cx, cy)
        //     res = res.map(dat=> dat.map((y,ind)=> (ind ==cx || ind == cy|| (notAllCol && ind!=cz)) ? y : this.#smoothOut(dat[cy],y,smtFactor)))
        //     // rotate again to return the data in original structure.
        //     var [cx, cy] = [cy, cx]
        //     this.res= expRotate(res,cx,cy)
        // } else{
        //     this.res = res
        // }
        // this.res = res
        // if (!this.initialDone) this.initalSetup()
        fullData[1] = this.res
        updatePlot()
    }

    saveApprox = () => {
        // modify the data with the approximation
        if (this.res == null) return
        data = this.res
        fullData[0] = data
        updatePlot()
        // if (ddd) updateOnServer()
        viewer3D.update()
        this.close()
        saved = false
    }
}

const smooth = new Smoother()


class AutoFixer {
    constructor() {
        this.active = false
        window.addEventListener('keydown', (ev) => {
            if (ev.altKey && ev.key == 's') this.saveValue()
        })
        this.res = null
        this.shown = false
        window.addEventListener('traceChanged', this.runFixer)
        document.getElementById('fixer_apply').onclick = this.saveValue
        this.smoothElem = document.getElementById('autoSmot')
        this.cutElem = document.getElementById('autoCut')
        this.smoothElem.oninput = this.cutElem.oninput = this.runFixer
        this.smoothElem.onmouseover = this.cutElem.onmouseover = (ev) => { ev.target.focus() }
    }

    open = () => {
        this.active = true
        Plotly.addTraces(figurecontainer, iniPointsSm);
        this.runFixer()
    }

    close = () => {
        if (!this.active) return
        this.active = false
        this.res = null
        try {
            Plotly.deleteTraces(figurecontainer, 1)
        } catch (e) {
            console.log('AutoFixer Error: No trace found while trying to delete the approximated trace.')
        }
    }

    runFixer = () => {
        if (!this.active) return
        const smVal = parseFloat(this.smoothElem.value)
        const cutVal = parseFloat(this.cutElem.value)

        fixBadData(dpsx, dpsy, smVal, cutVal).then((x) => {
            this.res = x
            Plotly.restyle(figurecontainer, { x: [dpsx], y: [this.res], 'name': ['Approximated'] }, 1)
        })
    }

    saveValue() {
        // console.log('ran saved value')
        if (!this.active && this.res) return
        data[th_in][col.z] = dpsy = this.res
        updatePlot()
        Plotly.restyle(figurecontainer, { 'name': ['Approximated'] }, 1)
        saved = false
        if (!this.shown) {
            showStatus('Press Alt+S to quickly apply the corrected approximation');
            this.shown = true
        }
    }
}
const fixer = new AutoFixer()



class ToolBarUtils {
    // have to make, div id, menu id, trigger all same name
    constructor() {
        this.availableTools = ['extend', 'fill', 'filter', 'smooth', 'fixer', 'lmfit', 'rgfit']
        this.currentTool = null
        this.active = false
        $('#toolBar>div').hide()
        $('.utilBtn').on('click', this.closeToolBar)
        document.getElementById('fill_apply').onclick = dataFiller
        document.getElementById('extend_apply').onclick = repeatMirror
        document.getElementById('filter_apply').onclick = filterData

        // attach function runs, these are ran when these toolbars is opened
        this.specialTools = {
            'smooth': smooth,
            'fixer': fixer,
            'rgfit': fitData,
            'lmfit': fitData
        }
    }

    openToolBar(tool) {
        console.log(tool)
        if (figurecontainer.data.length > 1) alertElec('Supported only for one plot at a time.')
        if (this.active && this.currentTool == tool) return
        $('#toolBar').show()
        $('#toolBar>div').slideUp()
        $(`#${tool}`).slideDown(350, () => { resizePlot() })
        this.currentTool = tool
        this.active = true
        this.specialTools[this.currentTool]?.open(this.currentTool)
        disableMenu(this.getToolMenuList(tool))
        analytics.add(tool)
    }

    closeToolBar = () => {
        if (!this.active) return
        $(`#${this.currentTool}`).slideUp(350, () => { $('#toolBar').hide(); resizePlot() })
        enableMenu(this.getToolMenuList())
        this.specialTools[this.currentTool]?.close()
        this.active = false
        this.currentTool = null
    }

    getToolMenuList(tool) {
        let menuList = ['extend', 'fill', 'filter', 'smooth', 'fixer']
        // when a toolbar is open/close also disable new file add, add file, swapper, plotlist
        menuList.push('af', 'arf', 'swapen', 'tpl')
        if (!ddd) menuList.push('lmfit', 'rgfit')
        return menuList.filter(e => e != tool)
    }
}

const toolbarutil = new ToolBarUtils()