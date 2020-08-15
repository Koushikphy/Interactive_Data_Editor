const {repeatMirrorData,fillMissingGrid,useRegression,applyCutOFF,useSpline,levenMarFit,regressionFit} = require('../js/utils');


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


function swapData() {
    if (!swapperIsOn) return;
    saveOldData();
    for (let i of index) [data[th_in][col.z][i], data[th_in][col.s][i]] = [data[th_in][col.s][i], data[th_in][col.z][i]]
    endJobs({minimal:false})
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

    if(! data.every(e=>e[col.y].includes(last))){ alertElec("Endpoint must exist !!!"); return}

    data = repeatMirrorData(data, col.y, last, times, mirror)
    endJobs({startdrag:true,minimal:false})
    showStatus(`Data ${mirror ? 'mirrored' : 'repeated'} ${times} times...`)
}



function dataFiller() {
    start= parseFloat($("#fstart").val());
    stop = parseFloat($("#fend").val());
    step = parseFloat($("#fstep").val());
    if(isNaN(start)|isNaN(step)|!step) { showStatus('Invalid inputs.'); return}
    let allowRegression = $("#expSel")[0].selectedIndex ? true : false;
    
    if(!data[0][col.y].every((i,j,k)=> j==0 ? true:i>k[j-1])){
        alertElec('Monotonically increasing values required for interpolation.')
        return
    }

    data = fillMissingGrid(data, ddd, col, allowRegression, start, stop, step )
    endJobs({startdrag:true,minimal:false})
    showStatus('Missing values are filled...');
}



function filterData() {
    let condition = $("#flSel")[0].selectedIndex;
    let thrsh = parseFloat($("#flc").val());
    let fillVal = parseFloat($("#flf").val());
    let colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    data = applyCutOFF(data, colmn, condition, thrsh, fillVal)

    endJobs({minimal:false})
    showStatus('Data filtered...');
}


function deleteExtrapolate(){
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        saveOldData()
        dpsy = data[th_in][col.z] = useRegression(dpsx, dpsy, ind) // also apply this to dpsy
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
        dpsy = data[th_in][col.z] = useRegression(dpsx, dpsy, ind,2)
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
        dpsy = data[th_in][col.z] = useRegression(dpsx, dpsy, ind,3)
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
        dpsy = data[th_in][col.z] = useSpline(dpsx, dpsy, ind)
        endJobs()
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
}

// temporary macro function
function autoSm(len=data.length){
    for(let j=0;j<len;j++){
        dpsYY = data[j][col.z]
        dpsXX = data[j][col.y]
        // for (let i of index) {
        //     dps[i] = (dps[i - 1] + dps[i] + dps[i + 1]) / 3.0
        // };
        // data[j][col.z] = dps;


        data[j][col.z] = useRegression(dpsXX, dpsYY, index) 
    }
    updatePlot()
    updateOnServer()
}


function autoSmooth() {
    try{
        let ind = index.filter((i)=>i<dpsx.length)
        if(!ind.length) throw {ty:'sS', msg: "No data points selected."}
        if(ind.includes(0) || ind.includes(dpsx.length-1)) throw {ty:'sS', msg: "Can't apply mooving average at endpoints"}
        for (let i of ind) dpsy[i] = (dpsy[i - 1] + dpsy[i] + dpsy[i + 1]) / 3.0
        data[th_in][col.z] = dpsy;
        endJobs({serVerUpdate:false})
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
    endJobs()
}


function removeBadData(){
    saveOldData()
    data[th_in] = data[th_in].map(x=>x.filter((_,i)=>!index.includes(i)))
    endJobs({clearIndex:true,startdrag:true})
}


function endJobs({resize=false,startdrag=false,clearIndex=false,serVerUpdate=true,minimal=true}={}){
    fullData[currentEditable] = data;
    minimal? Plotly.restyle(figurecontainer, {y: [dpsy]}, currentEditable) : updatePlot(false);
    if (resize) resizePlot()
    if (serVerUpdate) updateOnServer();
    if (startdrag) startDragBehavior()
    if (clearIndex){
        Plotly.restyle(figurecontainer, {selectedpoints: [null]})
        index = []
    }
    saved = false;
}


//########################### regression fit ########################
function clearFit(lm=false){
    Plotly.deleteTraces(figurecontainer, 1);
    enableMenu(['edat','fill','filter','af','arf',lm? 'rgft':'lmfit'])
    lm ? Plotly.relayout(figurecontainer, {annotations:[{text:'', showarrow:false}]}) : 
        document.getElementById('formulaStr').innerHTML = ' '
    setTimeout(resizePlot, 300)
}


function polyfit(){
    let n = parseInt($('#polyInp').val())
    if(n>=dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    let [fity, coeff] = regressionFit(dpsx, dpsy, n)
    Plotly.restyle(figurecontainer, {'x':[dpsx], 'y': [fity]}, 1)

    document.getElementById('formulaStr').innerHTML = coeff.map((el,i)=>{
        if(i==0) return el.toPrecision(5)
        return `${el>0?'+':''}${el.toPrecision(5)}${i>1? `x<sup>${i}</sup>` : 'x'}`
    }).join(' ')
}


//########################### LM FIT ##############################
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




function diff12(){
    data = data.map(el=>[...el, el[4].map((i,j)=>i-el[3][j])])
    fullData[currentEditable] = data
    col.z = 6
    updatePlot(false)
    setUpColumns()
}


function merge12(){
    data = data.map(el=>{
        el[4] = el[3].map((i,j)=> i+el[6][j]  )
        el.splice(6)
        return el
    })
    col.z = 4
    updatePlot(false)
    fullData[currentEditable] = data
    setUpColumns()
}


function diff23(){
    data = data.map(el=>[...el, el[5].map((i,j)=>i-el[4][j])])
    fullData[currentEditable] = data
    col.z = 6
    updatePlot(false)
    setUpColumns()
}


function merge23(){
    data = data.map(el=>{
        el[5] = el[4].map((i,j)=> i+el[6][j]  )
        el.splice(6)
        return el
    })
    fullData[currentEditable] = data
    col.z = 5
    updatePlot(false)
    setUpColumns()
}
