const {repeatMirrorData,fillMissingGrid,useRegression,applyCutOFF,useSpline,levenMarFit,regressionFit} = require('../js/utils');
const {iniPointsF} = require('../js/plotUtils')


// copy paste values between different x/y
var copyVar;
function copyThis() {
    copyVar = JSON.stringify([dpsx, dpsy]);
}

function pasteThis() {
    var [t1, t2] = JSON.parse(copyVar);
    if(!t1.every((v,i)=>v===data[th_in][col.y][i])){
        alertElec("Copy paste between different data set is not supported!")
        return;
    }
    saveOldData();
    data[th_in][col.y] = t1
    data[th_in][col.z] = t2
    endJobs()
}


function sSwapper() {
    [col.s, col.z] = [col.z, col.s]
    sCol.selectedIndex = col.s;
    zCol.selectedIndex = col.z;
    colsChanged(col.s);
    updateOnServer();
}


function swapData() {
    if (!swapperIsOn) return;
    saveOldData();
    for (let i of index) [data[th_in][col.z][i], data[th_in][col.s][i]] = [data[th_in][col.s][i], data[th_in][col.z][i]]
    endJobs()
}


function moveReflect(right, mirror){
    saveOldData();
    let ind = index[index.length-1]+1;
    let tmp = dpsy.slice(index[0], ind)
    if(!right) ind=index[0]-index.length;
    if(mirror) tmp.reverse();
    tmp.shift();
    dpsy.splice(ind, tmp.length, ...tmp);
    endJobs()
};




function repeatMirror() {
    last  = parseFloat($("#einp").val());
    times = parseFloat($("#etime").val());
    if(!last|!times) { showStatus('Invalid inputs.'); return}
    mirror = $("#repSel")[0].selectedIndex;

    for (let i = 0; i < data.length; i++) {
        if (data[i][col.y].indexOf(last)==-1) {
            alertElec("Endpoint must exist !!!");
            return;
        }
    }
    data = repeatMirrorData(data, col.y, last, times)
    endJobs({startdrag:true})
    showStatus(`Data ${mirror ? 'mirrored' : 'repeated'} ${times} times...`)
}



function dataFiller() {
    saveOldData()
    start= parseFloat($("#fstart").val());
    stop = parseFloat($("#fend").val());
    step = parseFloat($("#fstep").val());
    if(isNaN(start)|isNaN(step)|!step) { showStatus('Invalid inputs.'); return}
    let allowRegression = $("#expSel")[0].selectedIndex ? true : false;
    
    for(let dt of data[0][col.y]){
        if(dt[0]>=dt[1]){ // just checking once
            alertElec('Monotonically increasing values required for interpolation.')
            return
        }
    }
    data = fillMissingGrid(data, ddd, col, allowRegression, start, stop, step )
    endJobs({startdrag:true})
    showStatus('Missing values are filled...');
}



function filterData() {
    let condition = $("#flSel")[0].selectedIndex;
    let thrsh = parseFloat($("#flc").val());
    let fillVal = parseFloat($("#flf").val());
    let colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    data = applyCutOFF(data, colmn,condition, thrsh, fillVal)

    endJobs()
    showStatus('Data filtered...');
}


function deleteExtrapolate(){
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        saveOldData()
        data[th_in][col.z] = useRegression(dpsx, dpsy, ind) // also apply this to dpsy
        endJobs()
    }catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}


function dataSupEnd(){
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        saveOldData()
        data[th_in][col.z] = useRegression(dpsx, dpsy, ind,2)
        endJobs()
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}


function dataSupStart(){
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        saveOldData()
        data[th_in][col.z] = useRegression(dpsx, dpsy, ind,3)
        endJobs()
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}



function deleteInterpolate() {
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        if(ind.includes(0) || ind.includes(dpsx.length-1)) throw {ty:'sS', msg: "Can't apply spline at endpoints"}
        saveOldData()
        data[th_in][col.z] = useSpline(dpsx, dpsy, ind)
        endJobs()
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}



function autoSmooth() {
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        if(ind.includes(0) || ind.includes(dpsx.length-1)) throw {ty:'sS', msg: "Can't apply mooving average at endpoints"}
        for (let i of ind) {
            dpsy[i] = (dpsy[i - 1] + dpsy[i] + dpsy[i + 1]) / 3.0
        };
        data[th_in][col.z] = dpsy;
        endJobs()
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}



function changeSign() {
    let ind = index.filter((i)=>i<dpsx.length)
    saveOldData();
    for (let i of ind) data[th_in][col.z][i] = -data[th_in][col.z][i];
    endJobs()
};



function setValue(val){
    saveOldData();
    let value = parseFloat(val);
    if (isNaN(value) ) return;
    for (let ind of index) data[th_in][col.z][ind] = value;
    endJobs({clearIndex:true})
}


function removeBadData(){
    saveOldData()
    let ind = index.filter((i)=>i<dpsx.length)
    for (let i = ind.length - 1; i >= 0; i--) {
        for(let j=0; j<data[0].length; j++) data[th_in][j].splice(index[i], 1);
    }
    endJobs({clearIndex:true})
}


//########################### regression fit ########################

function initPolyfit(){
    if(figurecontainer.data.length>1){ alertElec('Supported only for one plot at time.'); return}
    let thisTrace = iniPointsF
    thisTrace.x = [dpsx[0]]
    thisTrace.y = [dpsy[0]]
    Plotly.addTraces(figurecontainer, thisTrace)

    for (let i of ['edat','fill','filter','af','arf','lmfit']) menu.getMenuItemById(i).enabled = false;
    setTimeout(resizePlot, 300)
    return true
}


function clearPloyFit(){
    Plotly.deleteTraces(figurecontainer, 1);
    for (let i of ['edat','fill','filter','af','arf','lmfit']) menu.getMenuItemById(i).enabled = true;
    setTimeout(resizePlot, 300)
}


function polyfit(){
    let n = parseInt($('#polyInp').val())
    if(n>=dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    let [fity, coeff] = regressionFit(dpsx, dpsy, n)
    Plotly.restyle(figurecontainer, {'x':[dpsx], 'y': [fity]}, 1)
    let formulaStr = 'y = '+ coeff[0].toPrecision(5)
    for(let i=1;i<=n;i++){
        let vv = coeff[i].toPrecision(5)
        formulaStr += ` ${vv>=0? '+' : '-'}${Math.abs(vv)}x<sup>${i>1? i : ''}</sup>`
    }
    document.getElementById('formulaStr').innerHTML = formulaStr;
    return true // to be parsed by the menutrigger
}



//########################### LM FIT ##############################
function initLMfit(){
    if(figurecontainer.data.length>1) {alertElec('Supported only for one plot at a time.'); return}

    let thisTrace = iniPointsF
    thisTrace.x = [dpsx[0]]
    thisTrace.y = [dpsy[0]]
    Plotly.addTraces(figurecontainer, thisTrace);
    for (let i of ['edat','fill','filter','af','arf','rgft']) menu.getMenuItemById(i).enabled = false;
    setTimeout(resizePlot, 300)
    return true
}


function clearLMfit(){
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {annotations:[{text:'', showarrow:false}]})
    for (let i of ['edat','fill','filter','af','arf','rgft']) menu.getMenuItemById(i).enabled = true;
    setTimeout(resizePlot, 300)
}


function lmfit(){
    // use a form and parse multiple values
    let funcStr      = $('#funcStr').val()
    let paramList    = $('#paramList').val().split(',')
    let maxIter      = parseInt($('#iterationVal').val())
    let parameters   = $('#intVal').val().split(',').map(x=>parseFloat(x))
    let maxVal       = $('#maxVal').val().split(',').map(x=>parseFloat(x))
    let minVal       = $('#minVal').val().split(',').map(x=>parseFloat(x))
    let dampVal      = parseFloat($('#dampVal').val())
    let stepVal      = parseFloat($('#stepVal').val())
    let etVal        = parseFloat($('#etVal').val())
    let egVal        = parseFloat($('#egVal').val())

    let [fity, params, chiError] = levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal,stepVal, etVal, egVal)

    let anotX=0.5, anotY=1;
    if(figurecontainer.layout.annotations!= undefined){  // persists annotation if already used
        anotX = figurecontainer.layout.annotations[0].x
        anotY = figurecontainer.layout.annotations[0].y
    }

    anotText = `y = ${$('#funcStr').val()}<br>
                ${$('#paramList').val().split(',').join(', ')} = ${params.map(x=>x.toPrecision(5)).join(', ')}
                <br>&#967;<sup>2</sup> Error = ${chiError.toPrecision(5)}`
    Plotly.update(figurecontainer,{x:[dpsx], y:[fity]}, {annotations: [{
        xref: 'paper', x: anotX,
        yref: 'paper', y: anotY,
        showarrow:false,
        text: anotText,
        bordercolor : '#000000'
        }]},
    1)
}




function endJobs({resize=false, updateAll = false, startdrag=false, clearIndex=false}={}){
        fullData[0] = data;
        updatePlot(updateAll);
        if (resize) resizePlot()
        updateOnServer();
        if (startdrag) startDragBehavior()
        if (clearIndex){
            Plotly.restyle(figurecontainer, {selectedpoints: [null]})
            index = []
        }
        saved = false;
}