var copyVar;
function copyThis() {
    copyVar = JSON.stringify([dpsx, dpsy]);
}
function pasteThis() {
    var [t1, t2] = JSON.parse(copyVar);
    // if (data[th_in][0].length != t1.length){
    if(!t1.every((v,i)=>v===data[th_in][col.y][i])){
        alert("Copy paste between different data set is not supported!");
        return;
    }
    saveOldData();
    data[th_in][col.y] = t1
    data[th_in][col.z] = t2
    endJobs()
}



function swapData() {
    if (!index.length) return;
    if(!swapperIsOn)  return;
    saveOldData();
    for (let ind of index) {
        [data[th_in][col.z][ind], data[th_in][col.s][ind]] = [data[th_in][col.s][ind], data[th_in][col.z][ind]]
    }
    endJobs()
}


function moveReflect(key, mod){
    saveOldData();
    var ind = index[index.length-1]+1;
    var tmp = dpsy.slice(index[0], ind);
    if(!key) ind=index[0]-index.length;
    if(mod) tmp.reverse();
    tmp.shift();
    dpsy.splice(ind, tmp.length, ...tmp);
    updatePlot();
    updateOnServer();
};


var last = '', times=''
function repeatMirror() {
    last  = parseFloat($("#einp").val());
    times = parseFloat($("#etime").val());
    if(!last|!times) { showStatus('Invalid inputs.'); return}
    var mirror = $("#repSel")[0].selectedIndex;

    var cols_wo_y = []
    var tmp = data[0].length

    for (let i = 0; i < tmp; i++) {
        if (i != col.y) cols_wo_y.push(i)
    }

    for (let i = 0; i < data.length; i++) {
        if (!(data[0][col.y].indexOf(last) + 1)) {
            alert("Endpoint must exist !!!");
            $("#extend").slideUp();
            return;
        }
    }

    data = data.map(dat => {

        var ind = dat[col.y].indexOf(last) + 1
        var newy = dat[col.y].slice(0, ind)
        var tmp = newy.slice()
        tmp.splice(0, 1)

        for (let time = 0; time < times - 1; time++) {
            for (let i = 0; i < tmp.length; i++) {
                newy.push(tmp[i] + last * (1 + time));
            }
        }

        for (let i of cols_wo_y) {
            var new_dat = dat[i].slice(0, ind)
            var tmp = new_dat.slice()
            for (let time = 0; time < times - 1; time++) {
                if (mirror) {
                    ptmp = tmp.reverse().slice()
                } else {
                    ptmp = tmp.slice()
                }
                ptmp.splice(0, 1)
                new_dat.push(...ptmp)
            }
            dat[i] = new_dat;
        }
        dat[col.y] = newy;
        return dat
    })
    endJobs({resize:true, startdrag:true})
    var tmp = mirror ? 'mirrored' : 'repeated'
    showStatus(`Data ${tmp} ${times} times...`)
}




var start='', stop='', step='';
function dataFiller() {
    saveOldData()
    start= parseFloat($("#fstart").val());
    stop = parseFloat($("#fend").val());
    step = parseFloat($("#fstep").val());
    if(isNaN(start)|isNaN(step)|!step) { showStatus('Invalid inputs.'); return}
    var allowRegression = $("#expSel")[0].selectedIndex ? true : false;

    var cols_wo_y = []   // on which columns to fill the data
    if(ddd){
        for (let i = 0; i < data[0].length; i++) if ((i != col.y) & (i != col.x)) cols_wo_y.push(i)
    }else { // no col.x remove in 2d
        for (let i = 0; i < data[0].length; i++) if (i != col.y) cols_wo_y.push(i)
    }


    var fullArr = Plotly.d3.range(start, stop,step)
    data = data.map(dat => {
        if (fullArr.length == dat[0].length) return dat; // no interpolation required
        var xs = dat[col.y].slice()
        var lInd = dat[col.y].length - 1;
        // check if regression is required by cheking the starting of the array
        let backRegRequired = false, frontRegRequired = false;
        if(allowRegression){
            frontRegRequired = fullArr[0]<xs[0]
            backRegRequired = fullArr[fullArr.length-1]>xs[xs.length-1]
        }


        for (let tc of cols_wo_y) {

            newArr = [];
            var ys = dat[tc].slice();
            spl = new Spline(xs, ys)
            if(frontRegRequired){
                frontReg = new Regression(xs.slice(0,3), ys.slice(0,3),2)
            }
            if(backRegRequired){
                backReg = new Regression(
                    xs.slice(Math.max(xs.length-3,1)),
                    ys.slice(Math.max(ys.length-3,1)),
                    2
                )
            }

            for (let val of fullArr) {
                ind = dat[col.y].indexOf(val)
                if (ind != -1) {  // value already available, no filling required
                    newArr.push(dat[tc][ind])
                } else {
                    if (val <= dat[col.y][0]) {  // front extrapolation
                        if (frontRegRequired){
                            newArr.push(frontReg.val(val))
                        }else{  // else just use the 1st value
                            newArr.push(dat[tc][0])
                        }
                    } else if (val >= dat[col.y][lInd]) { //back extrapolation
                        if (backRegRequired){
                            newArr.push(backReg.val(val))
                        }else{
                            newArr.push(dat[tc][lInd])
                        }
                    } else {                            //spline interpolation
                        newArr.push(spl.getVal(val))
                    }
                }
            }
            dat[tc] = newArr;
        }

        dat[col.y] = fullArr;
        if(ddd) dat[col.x] = new Array(fullArr.length).fill(dat[col.x][0])
        return dat;
    })

    endJobs({resize:true, startdrag:true})
    showStatus('Missing values are filled...');
}



function filterData() {
    var condition = $("#flSel")[0].selectedIndex;
    var thrsh = parseFloat($("#flc").val());
    var fillVal = parseFloat($("#flf").val());
    var colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    if (condition == 0) {
        data = data.map(dat => {
            for (let tc of colmn) {
                dat[tc] = dat[tc].map(x => {
                    if (x < thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })
    } else if (condition == 1) {
        data = data.map(dat => {
            for (let tc of colmn) {
                dat[tc] = dat[tc].map(x => {
                    if (x > thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })
    } else if (condition == 2) {
        data = data.map(dat => {
            for (let tc of colmn) {
                dat[tc] = dat[tc].map(x => {
                    if (x == thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })
    }
    endJobs({resize:true, startdrag:true})
    showStatus('Data filtered...');
}




function deleteExtrapolate(){
    if (!index.length) return;

    first  = index[0]
    last = index[index.length - 1]
    // take 3 numbers from both sides
    xs = dpsx.slice(Math.max(first-3,0),first).concat(dpsx.slice(last+1,last+4))
    ys = dpsy.slice(Math.max(first-3,0),first).concat(dpsy.slice(last+1,last+4))
    exterp = new Regression(xs,ys, 2)
    saveOldData();
    for (let ind of index) data[th_in][col.z][ind] = exterp.val(data[th_in][col.y][ind]);
    endJobs();
}


function dataSupEnd(){
    if (!index.length) return
    first = index[0]
    if(first==0) return
    let xs= dpsx.slice(Math.max(first-3,0),first)
    let ys= dpsy.slice(Math.max(first-3,0),first)
    exterp = new Regression(xs,ys, 2)
    saveOldData();
    let tmpVal = exterp.val(data[th_in][col.y][first]) - data[th_in][col.z][first]
    for (let ind of index) data[th_in][col.z][ind] += tmpVal;
    endJobs();
}

function dataSupStart(){
    if (!index.length) return
    last = index[index.length - 1]
    if(last==dpsx.length-1) return
    let xs= dpsx.slice(last+1,last+4)
    let ys= dpsy.slice(last+1,last+4)
    exterp = new Regression(xs,ys, 2)
    saveOldData();
    let tmpVal = exterp.val(data[th_in][col.y][last]) - data[th_in][col.z][last]
    for (let ind of index)  data[th_in][col.z][ind] +=tmpVal;
    endJobs();
}



function deleteInterpolate() {
    if (!index.length) return;
    var xs = dpsx.slice();
    var ys = dpsy.slice();
    //check for endpoints
    if (index[0] == 0) index.splice(0, 1)
    if (index[index.length - 1] == dpsx.length - 1) index.splice(-1, 1)
    for (var i = index.length - 1; i >= 0; i--) {
        xs.splice(index[i], 1);
        ys.splice(index[i], 1);
    }
    spl = new Spline(xs,ys)
    saveOldData();
    for (let ind of index) data[th_in][col.z][ind] = spl.getVal(data[th_in][col.y][ind]);
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
    for (let ind of index) data[th_in][col.z][ind] *= -1;
    endJobs()
};



function setValue(){
    saveOldData();
    var value = parseFloat($("#valinput").val());
    if (isNaN(value) ){
        return;
    } else{
        for (let ind of index) data[th_in][col.z][ind] = value;
    }
    endJobs({clearIndex:true})
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
    $('#setval').remove();
}



function removeBadData(){
    if (!index.length) return;
    saveOldData()
    for (let i = index.length - 1; i >= 0; i--) {
        for(let j=0; j<data[0].length; j++){
            data[th_in][j].splice(index[i], 1);
        }
    }
    endJobs({clearIndex:true})
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
}



function revertPloyFit(){
    Plotly.deleteTraces(figurecontainer, 1);
    polyFitLive = false;
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = true;
}

function initPolyfit(){
    if (!polyFitLive) {
        if(ddd){
            alert('Regression fitting is only supported for 2D data.'); return
        }
        if(figurecontainer.data.length>1){
            alert('Supported only for one plot at time.'); return
        }
    }
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = false;
    return true
}

var polyFitLive = false
function polyfit(n){
    //if 2d return
    if(!n) return
    if(n>=dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    var xs = dpsx.slice(), ys = dpsy.slice(), fity=[];
    var poly = new Regression(xs,ys,n, true)
    for(let xx of dpsx) fity.push(poly.val(xx))
    if(!polyFitLive){ // initiate the plot in not started
        polyFitLive = true
        let thisTrace = JSON.parse(JSON.stringify(iniPointsD))
        thisTrace.mode = 'lines'
        thisTrace.line.color = '#207104'
        thisTrace.line.shape = 'spline'
        thisTrace.name = 'Fitted line'
        thisTrace.x = dpsx
        thisTrace.y = fity
        Plotly.addTraces(figurecontainer, thisTrace)
    } else{
        Plotly.restyle(figurecontainer, {'x':[dpsx], 'y': [fity]}, 1)
    }
    var formulaStr = 'y = '+ poly.cf[0].toPrecision(5)
    for(let i=1;i<=n;i++){
        let vv = poly.cf[i].toPrecision(5)
        formulaStr += ` ${vv>=0? '+' : '-'}${Math.abs(vv)}x<sup>${i>1? i : ''}</sup>`
    }
    document.getElementById('formulaStr').innerHTML = formulaStr;
    return true // to be parsed by the menutrigger
}



//########################### LM FIT ##############################

function initialSetup() {
    var funcStr      = $('#funcStr').val()
    var paramList    = $('#paramList').val().split(',')
    var iterationVal = parseInt($('#iterationVal').val())
    var intVal       = $('#intVal').val().split(',').map(x=>parseFloat(x))
    var maxVal       = $('#maxVal').val().split(',').map(x=>parseFloat(x))
    var minVal       = $('#minVal').val().split(',').map(x=>parseFloat(x))
    var dampVal      = parseFloat($('#dampVal').val())
    var stepVal      = parseFloat($('#stepVal').val())
    var etVal        = parseFloat($('#etVal').val())
    var egVal        = parseFloat($('#egVal').val())


    if (!funcStr) throw 'Funtion is required.'
    if (!paramList) throw 'Prameters list is required'
    if (!iterationVal) throw 'Maximum iteraion number is required'
    // set an predifned damping, error tol, error convergence, step size
    var parLen = paramList.length
    if(!isNaN(intVal[0])){
        console.log(intVal)
        if(intVal.length!=parLen) throw 'Wrong number of initial values'
    } else{
        intVal = new Array(parLen).fill(0)
    }
    if(!isNaN(minVal[0])){
        if(!minVal.length!=parLen) throw 'Wrong number of minimum values'
    } else{
        minVal = new Array(parLen).fill(Number.MIN_SAFE_INTEGER)
    }
    if(!isNaN(maxVal[0])){
        if(!maxVal.length!=parLen) throw 'Wrong number of maximum values'
    } else{
        maxVal = new Array(parLen).fill(Number.MAX_SAFE_INTEGER)
    }
    if(dampVal){
        if(dampVal<0) throw 'Damping factor must be positive'
    } else{
        dampVal = 1.5
    }
    if(!stepVal) stepVal = 1e-2
    if(!etVal) etVal = 1e-5
    if(!egVal) egVal = 1e-5

    try {// parse the formula
        funcList = ['sin','asin','sinh','cos','acos','cosh','tan','tanh','atan','exp','sqrt','log']
        for(let func of funcList){
            funcStr = funcStr.split(func).join('Math.'+func)//  .replace(func, 'Math.'+func)
        }
        func= eval(`(function([${paramList}]){return (x)=> ${funcStr}})`)
    } catch (error) {
        throw "Can't parse the formula."
    }

        // save the attributes for agin use
    $('#funcStr').attr('value', $('#funcStr').val())
    $('#paramList').attr('value', $('#paramList').val())
    $('#iterationVal').attr('value', $('#iterationVal').val())
    $('#intVal').attr('value', $('#intVal').val())
    $('#maxVal').attr('value', $('#maxVal').val())
    $('#minVal').attr('value',$('#minVal').val())
    $('#dampVal').attr('value', $('#dampVal').val())
    $('#stepVal').attr('value', $('#stepVal').val())
    $('#etVal').attr('value', $('#etVal').val())
    $('#egVal').attr('value', $('#egVal').val())
    extendUtils['lmfit'] = $('#extendutils').html()
    return [func, iterationVal, intVal ,maxVal ,minVal ,dampVal ,stepVal ,etVal, egVal]
}





function initLMfit(){
    if(ddd){
        alert('Data fitting is only supported for 2D data.'); return
    }
    if(figurecontainer.data.length>1){
        alert('Supported only for one plot at time.'); return
    }
    let thisTrace = JSON.parse(JSON.stringify(iniPointsD))
    thisTrace.mode = 'lines'
    thisTrace.line.color = '#207104'
    thisTrace.line.shape = 'spline'
    thisTrace.name = 'Fitted line'
    thisTrace.x = [dpsx[0]]
    thisTrace.y = [dpsy[0]]
    Plotly.addTraces(figurecontainer, thisTrace);
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = false;
    return true
}


function closeLMfit(){
    // close the dialog box
    Plotly.deleteTraces(figurecontainer, 1)
    Plotly.relayout(figurecontainer, {annotations:[{text:'', showarrow:false}]})
    for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = true;
    resizePlot()
}


function lmfit(){
    setTimeout(()=>{ // don't block the main event loop during iteration
    try{// params means initial values of parameters
        var [func,maxIter, parameters, maxVal ,minVal ,dampval ,stepVal ,etVal, egVal] = initialSetup()
    } catch(err){
        alert(err); return ;
    }

    var olderror = Number.MIN_SAFE_INTEGER
    var converged = false
    xs = dpsx.slice(); ys = dpsy.slice()
    try {
        func(parameters)(xs[0])  // check if the function is usable
    } catch (error) {
        alert("Something wrong, can't use the formula"); console.log(error);return ;
    }
    for (let iteraion=0;iteraion<maxIter && !converged; iteraion++) {
        parameters = stepAhed( xs, ys, parameters, dampval, stepVal, func);
        for (let k = 0; k < parameters.length; k++) {
            parameters[k] = Math.min( Math.max(minVal[k], parameters[k]),  maxVal[k]);
        }

        var error = 0, fity=[];
        const tfunc = func(parameters);
        for (var i = 0; i < xs.length; i++) {
            tmp  = tfunc(xs[i])
            error += Math.abs(ys[i] - tmp);
            fity.push(tmp)
        }
        converged = Math.abs(error- olderror) <= egVal || error <=etVal;
        olderror = error
    }

    var chiError = 0; tfunc = func(parameters);
    for (var i = 0; i < xs.length; i++) {
        tmp  = tfunc(xs[i])
        yy = ys[i]
        if(yy>Number.EPSILON) chiError += (yy-tmp)**2/tmp
    }

    Plotly.restyle(figurecontainer, {x:[dpsx], y:[fity]},1)
    anotText = `y = ${$('#funcStr').val()}<br>Parameters = ${parameters.map(x=>x.toPrecision(5))}<br>&#967;<sup>2</sup> Error = ${chiError.toPrecision(5)}`
    Plotly.relayout(figurecontainer, {annotations: [
        {
            xref: 'paper', x: 0,
            yref: 'paper', y: 0,
            showarrow:false,
            text: anotText,
            bordercolor : '#000000'
        }
    ]})
    showStatus('Data fitting done')
    },1)
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