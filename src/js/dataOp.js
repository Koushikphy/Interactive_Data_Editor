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

    data = fillMissingGrid(data, is3D, col, allowRegression, start, stop, step)
    endJobs({ startdrag: true, minimal: false })
    showStatus('Missing values are filled...');
}



function filterData() {
    let condition = $("#flSel")[0].selectedIndex;
    let thrsh = parseFloat($("#flc").val());
    let fillVal = parseFloat($("#flf").val());
    let colmn = $("#flcl").val().split(',').map(x => {
        let xT = parseFloat(x);
        if(xT>data[0].length) alertElec('Invalid column number');
        return parseFloat(x) - 1;
    });

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


var cRange = false, cRangeY = [NaN, NaN]; //hidden feature
function setCutRange() {
    if (!cRange) return
    // should also include other traces if they are currently plotted
    let a = Math.min(...dpsy), b = Math.max(...dpsy);
    let [aY, bY] = cRangeY;
    a = isNaN(aY) ? a : Math.max(aY, a)
    b = isNaN(bY) ? b : Math.min(bY, b)

    // upper cutoff is lower than the min value or lower cutoff is bigger than max value
    if (a > b) a = b - 1 // improve this

    ab = (b - a) * .03 // gives a slight padding in range
    range = [a - ab, b + ab]
    Plotly.relayout(figurecontainer, { "yaxis.autorange": false, "yaxis.range": [a - ab, b + ab], "xaxis.autorange": true })
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
        this.isActive = false;
        this.shown = false
        this.inpElem = document.getElementById('smoothInp')
        this.allColElem = document.getElementById('smAllCol')
        this.allBlockElem = document.getElementById('smAllBlock')

        this.inpElem.onmouseover = (ev) => { ev.target.focus() }
        this.inpElem.oninput = this.smoothApprox
        this.allBlockElem.onclick = this.smoothApprox
        document.getElementById('smoothApl').onclick = () =>{
            this.saveApprox()
            if (!this.shown) {
                showStatus('Press Alt+S to quickly apply the corrected approximation');
                this.shown = true
            }
        }
    }

    open = () => {
        this.isActive = true
        Plotly.addTraces(figurecontainer, iniPointsSm);
        this.smoothApprox()
        analytics.add('smoother')

        window.addEventListener('columnChanged', this.smoothApprox)
        window.addEventListener('sliderChanged', this.smoothApprox)
        window.addEventListener('keydown', this.saveProxy)
    }

    close = () => {
        this.isActive = false
        try {
            Plotly.deleteTraces(figurecontainer, 1);
        } catch (error) {
            console.log('AutoSmoother Error: No trace found while trying to delete the approximated trace.')
        }

        window.removeEventListener('columnChanged', this.colChangedProxy)
        window.removeEventListener('sliderChanged', this.sliderChangeProxy)
        window.removeEventListener('keydown', this.saveProxy)
    }

    smoothApprox = () => {
        if (!this.isActive) return
        const smtFactor = parseFloat(this.inpElem.value)
        if (smtFactor > 1 || smtFactor < 0) alertElec("Smoothing factor must be in between 0 and 1")
        Plotly.restyle(figurecontainer, { x: [dpsx], y: [splineSmoother(dpsx, dpsy, smtFactor)], 'name': ['Approximated'] }, 1)
    }

    saveProxy = (ev) =>{
        if (ev.altKey && ev.key == 's') this.saveApprox()
    }

    saveApprox = () => {

        const smtFactor = parseFloat(this.inpElem.value)
        const notAllCol = !this.allColElem.checked
        const notAllX = !this.allBlockElem.checked
        const cz = col.z
        var cx = col.x, cy = col.y;
        data = data.map((dat, ii) => (notAllX && ii != th_in) ? dat : dat.map((y, ind) => (ind == cx || ind == cy || (notAllCol && ind != cz)) ? y : splineSmoother(dat[cy], y, smtFactor)))
        fullData[0] = data
        updatePlot()
        viewer3D.update()
        // this.close()
        saved = false
    }
}

const smooth = new Smoother()


class AutoFixer {
    constructor() {
        this.active = false
        this.res = null
        this.shown = false
        document.getElementById('fixer_apply').onclick = this.saveValue
        this.smoothElem = document.getElementById('autoSmot')
        this.cutElem = document.getElementById('autoCut')
        this.smoothElem.oninput = this.cutElem.oninput = this.runFixer
        this.smoothElem.onmouseover = this.cutElem.onmouseover = (ev) => { ev.target.focus() }
    }

    saveProxy = (ev) =>{
        if (ev.altKey && ev.key == 's') this.saveValue()
    }

    open = () => {
        this.active = true
        Plotly.addTraces(figurecontainer, iniPointsSm);
        this.runFixer()
        window.addEventListener('sliderChanged', this.runFixer)
        window.addEventListener('columnChanged', this.runFixer)
        window.addEventListener('keydown', this.saveProxy)
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
        window.removeEventListener('sliderChanged', this.runFixer)
        window.removeEventListener('columnChanged', this.runFixer)
        window.removeEventListener('keydown', this.saveProxy)
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

    saveValue = () => {
        if (!this.active && this.res) return
        undoRedo.save()
        data[th_in][col.z] = dpsy = this.res
        updatePlot()
        Plotly.restyle(figurecontainer, { 'name': ['Approximated'] }, 1)
        saved = false
        if (!this.shown) {
            showStatus('Press Alt+S to quickly apply the corrected approximation');
            this.shown = true
        }
        viewer3D.update()
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
        // console.log(tool)
        if (this.active && this.currentTool == tool) return
        if (this.active) this.closeToolBar(false)
        if (figurecontainer.data.length > 1) alertElec('Supported only for one plot at a time.')
        $('#toolBar').show()
        $('#toolBar>div').slideUp()
        $(`#${tool}`).slideDown(350, () => { resizePlot() })
        this.currentTool = tool
        this.active = true
        this.specialTools[this.currentTool]?.open(this.currentTool)
        disableMenu(["swapen"])
        analytics.add(tool)
    }

    closeToolBar = (complete = true) => {
        if (!this.active) return
        $(`#${this.currentTool}`).slideUp(350)
        if (complete) setTimeout(() => { $('#toolBar').hide(); resizePlot() }, 350)
        enableMenu(["swapen"])
        this.specialTools[this.currentTool]?.close()
        this.active = false
        this.currentTool = null
    }
}

const toolbarutil = new ToolBarUtils()