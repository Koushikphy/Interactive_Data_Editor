const {repeatMirrorData,fillMissingGrid,useRegression,useSpline,levenMarFit,regressionFit} = require('../js/utils');
const { PlotSchema } = require('plotly.js-gl3d-dist');
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
    if (!index.length || !swapperIsOn) return;
    saveOldData();
    for (let ind of index) [data[th_in][col.z][ind], data[th_in][col.s][ind]] = [data[th_in][col.s][ind], data[th_in][col.z][ind]]
    endJobs()
}


function moveReflect(key, mod){
    saveOldData();
    var ind = index[index.length-1]+1;
    var tmp = clone(dpsy.slice(index[0], ind));
    if(!key) ind=index[0]-index.length;
    if(mod) tmp.reverse();
    tmp.shift();

    dpsy.splice(ind, tmp.length, ...tmp);
    endJobs()
};



var mirror = 0;
function repeatMirror() {
    last  = parseFloat($("#einp").val());
    times = parseFloat($("#etime").val());
    if(!last|!times) { showStatus('Invalid inputs.'); return}
    mirror = $("#repSel")[0].selectedIndex;


    for (let i = 0; i < data.length; i++) {
        if (data[i][col.y].indexOf(last)==-1) {
            alertElec("Endpoint must exist !!!");
            // $("#extend").slideUp();
            return;
        }
    }

    data = repeatMirrorData(data, col.y, last, times)

    endJobs({resize:true, startdrag:true})
    var tmp = mirror ? 'mirrored' : 'repeated'
    showStatus(`Data ${tmp} ${times} times...`)
}



function dataFiller() {
    saveOldData()
    start= parseFloat($("#fstart").val());
    stop = parseFloat($("#fend").val());
    step = parseFloat($("#fstep").val());
    if(isNaN(start)|isNaN(step)|!step) { showStatus('Invalid inputs.'); return}
    var allowRegression = $("#expSel")[0].selectedIndex ? true : false;
    
    for(let dt of data[0][col.y]){
        if(dt[0]>=dt[1]){
            alertElec('Monotonically increasing values required for interpolation.')
            return
        }
    }
    data = fillMissingGrid(data, ddd, col, allowRegression, start, stop, step )

    endJobs({resize:true, startdrag:true})
    showStatus('Missing values are filled...');
}



function filterData() {
    var condition = $("#flSel")[0].selectedIndex;
    var thrsh = parseFloat($("#flc").val());
    var fillVal = parseFloat($("#flf").val());
    var colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    data = applyCutOFF(data, colmn,condition, thrsh, fillVal)

    endJobs({resize:true, startdrag:true})
    showStatus('Data filtered...');

}


function deleteExtrapolate(){
    saveOldData()
    data[th_in][col.z] = useRegression(dpsx, dpsy, index)  // also apply this to dpsy
    endJobs()
}


function dataSupEnd(){
    saveOldData()
    data[th_in][col.z] = useRegression(dpsx, dpsy, index,2)
    endJobs()
}


function dataSupStart(){
    saveOldData()
    data[th_in][col.z] = useRegression(dpsx, dpsy, index,3)
    endJobs()
}



function deleteInterpolate() {
    saveOldData()
    data[th_in][col.z] = useSpline(dpsx, dpsy, index)
    endJobs()
};



function autoSmooth() {
    if (ma) {
        saveOldData();
        ma = 0;
    }
    if (!index.length) return;
    if (index[0] == 0) index.splice(0, 1)
    if (index[index.length - 1] == dpsx.length - 1) index.splice(-1, 1)
    for (let i of index) {
        dpsy[i] = (dpsy[i - 1] + dpsy[i] + dpsy[i + 1]) / 3.0
    };
    data[th_in][col.z] = dpsy;
    updatePlot();
    // updateonserver will be done on keyup
    saved = false;
};



function changeSign() {
    if (!index.length) return;
    saveOldData();
    for (let ind of index) data[th_in][col.z][ind] = -data[th_in][col.z][ind];
    endJobs()
};



function setValue(val){
    saveOldData();
    var value = parseFloat(val);
    if (isNaN(value) ) return;
    for (let ind of index) data[th_in][col.z][ind] = value;
    endJobs({clearIndex:true})
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
}



function removeBadData(){
    if (!index.length) return;
    saveOldData()
    for (let i = index.length - 1; i >= 0; i--) {
        for(let j=0; j<data[0].length; j++) data[th_in][j].splice(index[i], 1);
    }
    endJobs({clearIndex:true})
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
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
    var n = parseInt($('#polyInp').val())
    if(n>=dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    let [fity, coeff] = regressionFit(dpsx, dpsy, n)
    Plotly.restyle(figurecontainer, {'x':[dpsx], 'y': [fity]}, 1)
    var formulaStr = 'y = '+ coeff[0].toPrecision(5)
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
    // close the dialog box
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {annotations:[{text:'', showarrow:false}]})
    for (let i of ['edat','fill','filter','af','arf','rgft']) menu.getMenuItemById(i).enabled = true;
    setTimeout(resizePlot, 300)
}


function lmfit(){
    // use a form and parse multiple values
    var funcStr      = $('#funcStr').val()
    var paramList    = $('#paramList').val().split(',')
    var maxIter      = parseInt($('#iterationVal').val())
    var parameters   = $('#intVal').val().split(',').map(x=>parseFloat(x))
    var maxVal       = $('#maxVal').val().split(',').map(x=>parseFloat(x))
    var minVal       = $('#minVal').val().split(',').map(x=>parseFloat(x))
    var dampVal      = parseFloat($('#dampVal').val())
    var stepVal      = parseFloat($('#stepVal').val())
    var etVal        = parseFloat($('#etVal').val())
    var egVal        = parseFloat($('#egVal').val())

    let [fity, params, chiError] = levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal,stepVal, etVal, egVal)

    let anotX=0.5, anotY=1;
    if(figurecontainer.layout.annotations!= undefined){  // persists annotation data if already used
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
    // jobs to do after a function is called like update plot
    return new Promise((resolve,reject)=>{
        updatePlot(updateAll);
        updateOnServer();
        saved = false;
        fullData[0] = data;
        if (clearIndex) index = [];
        if (startdrag) startDragBehavior()
        if (resize) resizePlot()
        resolve()
    })
}