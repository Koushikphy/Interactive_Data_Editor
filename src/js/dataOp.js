const {repeatMirrorData,fillMissingGrid,useRegression,applyCutOFF,useSpline,levenMarFit,regressionFit} = require('../js/utils');


// copy paste values between different x/y
var copyVar;
function copyThis() {
    copyVar = JSON.stringify([dpsx, dpsy]);
}

function pasteThis() {
    var [t1, t2] = JSON.parse(copyVar);
    if(!t1.every((v,i)=>v===data[th_in][col.y][i])) alertElec("Copy paste between different data set is not supported!")
    saveOldData();
    data[th_in][col.y] = t1
    data[th_in][col.z] = t2
    endJobs()
}


function swapData() {
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
    if(!last|!times) alertElec('Invalid inputs.')
    mirror = $("#repSel")[0].selectedIndex;

    if(! data.every(e=>e[col.y].includes(last))) alertElec("Endpoint must exist !!!")

    data = repeatMirrorData(data, col.y, last, times, mirror)
    endJobs({startdrag:true,minimal:false})
    showStatus(`Data ${mirror ? 'mirrored' : 'repeated'} ${times} times...`)
    analytics.send('extend')
}



function dataFiller() {
    let start= parseFloat($("#fstart").val());
    let stop = parseFloat($("#fend").val());
    let step = parseFloat($("#fstep").val());
    let allowRegression = $("#expSel")[0].selectedIndex ? true : false;
    if(document.getElementById('gridSel').selectedIndex) {
        if(step != parseInt(step)) alertElec("Number of grid must be integer")
        step = (stop-start)/(step -1)
    }

    if(isNaN(start)|isNaN(step)|!step) alertElec('Invalid inputs.')
    
    if(!data[0][col.y].every((i,j,k)=> j==0 ? true:i>k[j-1])) alertElec('Monotonically increasing values required for interpolation.')

    data = fillMissingGrid(data, ddd, col, allowRegression, start, stop, step )
    endJobs({startdrag:true,minimal:false})
    showStatus('Missing values are filled...');
    analytics.send('filler')
}



function filterData() {
    let condition = $("#flSel")[0].selectedIndex;
    let thrsh = parseFloat($("#flc").val());
    let fillVal = parseFloat($("#flf").val());
    let colmn = $("#flcl").val().split(',').map(x => parseFloat(x) - 1);

    data = applyCutOFF(data, colmn, condition, thrsh, fillVal)

    endJobs({minimal:false})
    showStatus('Data filtered...');
    analytics.send('filter')
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
        if(!data[0][col.y].every((i,j,k)=> j==0 ? true:i>k[j-1])) throw {ty:'sS', msg:'Monotonically increasing values required.'}

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
        if(ind.includes(0) || ind.includes(dpsx.length-1)) throw {ty:'sS', msg: "Can't apply moving average at endpoints"}
        // for (let i of ind) dpsy[i] = (dpsy[i - 1] + dpsy[i] + dpsy[i + 1]) / 3.0
        for (let i of ind) dpsy[i] = _mv( dpsx.slice(i-1,i+2),dpsy.slice(i-1,i+2)) // for uneven grid
        data[th_in][col.z] = dpsy;
        endJobs({serVerUpdate:false})
    } catch(e){
        e.ty=='sS' ? showStatus(e.msg) : console.error(e.stack)
    }
    function _mv(xx,yy){
        // xx and yy should be a length of 3
        h = xx[1] - xx[0]
        hp= xx[2] - xx[1]
        val = ( yy[0]/h  + yy[2]/hp )/( 1.0/h + 1.0/hp)
    
        return (yy[1]+val)/2.0
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
    for (let i of index) data[th_in][col.z][i] = value;
    endJobs()
}


function removeBadData(){
    saveOldData()
    data[th_in] = data[th_in].map(x=>x.filter((_,i)=>!index.includes(i)))
    endJobs({clearIndex:true,startdrag:true,minimal:false})
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


function saveFit(){

    let dirname = path.dirname(fileNames[currentEditable]);
    let filename = path.basename(fileNames[currentEditable], path.extname(fileNames[currentEditable]));
    let extn = path.extname(fileNames[currentEditable]);
    let save_name = path.join(dirname, filename + "_fit" + extn);

    var tmp_name = dialog.showSaveDialogSync({
        title: "Save As:",
        defaultPath: save_name
    });
    if (tmp_name === undefined) return

    try {
        var txt = transpose([dpsx,dpsy,fitY]).map(i=>i.join('\t')).join('\n')
        fs.writeFileSync(tmp_name, txt);
        showStatus("Data Saved in file " + replaceWithHome(tmp_name));
        saved = true;
    } catch (error) {
        showStatus("Something went wrong! Couldn't save the data...")
        return false;
    }
}



var fitY;
function polyfit(){
    let n = parseInt($('#polyInp').val())
    if(n>=dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    let [fity, coeff] = regressionFit(dpsx, dpsy, n)
    fitY = fity
    Plotly.restyle(figurecontainer, {'x':[dpsx], 'y': [fity]}, 1)

    document.getElementById('formulaStr').innerHTML = 'y = '+coeff.map((el,i)=>{
        if(i==0) return el.toPrecision(5)
        return `${el>0?'+':''}${el.toPrecision(5)}${i>1? `x<sup>${i}</sup>` : 'x'}`
    }).join(' ')
    analytics.send('polyfit')
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
    fitY = fity
    analytics.send('lmfit')
}


// clip value to only positive ones
const clip = (val)=> val>0 ? val : 0;


function diff12(){
    if(swapped) alertElec('Operation not available in swapped mode');
    if(data[0].length != 6) alertElec('Data not in proper structure')
    data = data.map(el=>[...el, el[4].map((i,j)=> clip(i-el[3][j]))])
    col.z = 6
    fullDataCols[currentEditable].z = 6
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    updateOnServer()
}



function merge12(){
    if(swapped) alertElec('Operation not available in swapped mode');
    if(data[0].length != 7) alertElec('Data not in proper structure')
    data = data.map(el=>{
        el[4] = el[3].map((i,j)=> i+clip(el[6][j]))
        return el.slice(0,6)
    })
    col.z = 4
    fullDataCols[currentEditable].z = 4
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    updateOnServer()
}


function diff23(){
    if(swapped) alertElec('Operation not available in swapped mode');
    if(data[0].length != 6) alertElec('Data not in proper structure')
    data = data.map(el=>[...el, el[5].map((i,j)=> clip(i-el[4][j]))])
    col.z = 6
    fullDataCols[currentEditable].z = 6
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    updateOnServer()
}


function merge23(){
    if(swapped) alertElec('Operation not available in swapped mode');
    if(data[0].length != 7) alertElec('Data not in proper structure')
    data = data.map(el=>{
        el[5] = el[4].map((i,j)=> i+clip(el[6][j]))
        return el.slice(0,6)
    })
    col.z = 5
    fullDataCols[currentEditable].z = 5
    fullData[currentEditable] = data
    updatePlot(false)
    setUpColumns()
    updateOnServer()
}


class Smoother {
    constructor(){
        this.res= null;
        this.isActive = false;
        this.initialDone = false;
    }

    openSmooth(){
        // check if only one trace is plotted
        //enable/disable menus
        if(figurecontainer.data.length>1) alertElec('Supported only for one plot at a time.')
        disableMenu(['edat','fill','filter','af','arf', 'lmfit','rgft','swapen','tpl'])
        $('#smooth').show()
        setTimeout(resizePlot, 300)
        $('#extendUtils2D').slideDown()
        document.getElementById('smoothApx').onclick = this.smoothApprox
        document.getElementById('smoothApl').onclick = this.saveApprox
        document.getElementById('smoothCls').onclick = this.closeSmooth
        this.isActive = true
        analytics.send('smoother')
    }

    initalSetup=()=>{
        Plotly.addTraces(figurecontainer, {
            name:'Smooth Approximation',
            x: [],
            y: [],
            type: 'scatter',
            opacity: 1,
            mode: 'markers+lines',
            name : 'Fitted line',
            marker: {
                symbol: "circle-dot",
                color: '#b00',
                size: 3,
                opacity: 1
            },
            line: {
                width: 2,
                color: "#207104",
                dash: 0,
                // shape: 'spline'
            },
            hoverinfo: 'x+y',
        });
        fullData.push([])
        fullDataCols.push(col)
        legendNames.push('Smooth Approximation')
        this.initialDone = true
    }

    closeSmooth=()=>{
        enableMenu(['edat','fill','filter','af','arf','swapen','tpl'])
        if(!ddd) enableMenu(['rgft','lmfit'])
        setTimeout(resizePlot, 300)
        $('#extendUtils2D').slideUp()
        $('#smooth').hide()

        currentEditable = 0;
        this.isActive = false
        this.res = null
        if (this.initialDone) {
            Plotly.deleteTraces(figurecontainer, 1);
            fullData.splice(1,1)
            fullDataCols.splice(1,1)
            legendNames.splice(1,1)
            this.initialDone = false
        }
    }

    smoothApprox = () => {
        const smtFactor = parseFloat(document.getElementById('smoothInp').value)
        const notAllCol = !document.getElementById('smCheck').checked
        const notAllX    = !document.getElementById('smColCheck').checked
        const cz = col.z

        if(smtFactor>1 || smtFactor<0) alertElec("Smoothing factor must be in between 0 and 1")

        var cx = col.x,cy = col.y;
        // smooth in one direction 
        this.res  = data.map((dat,ii)=>  (notAllX && ii!=th_in) ? dat : dat.map((y,ind)=> (ind ==cx || ind == cy|| (notAllCol && ind!=cz)) ? y : this.#smoothOut(dat[cy],y,smtFactor)))
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
        if(!this.initialDone) this.initalSetup()
        fullData[1] = this.res
        updatePlot()
    }

    saveApprox = ()=>{
        // modify the data with the approximation
        if(this.res==null) return
        data = this.res
        fullData[0] = data
        updatePlot()
        if(ddd) updateOnServer()
        this.closeSmooth()
    }

    #smoothOut(x,y,smooth){
        const n = x.length;
        var v   = new Array(n).fill(0).map(_=>new Array(7).fill(0));
        var qty = new Array(n)//.fill(0);
        var qu  = new Array(n)//.fill(0);
        var u   = new Array(n)//.fill(0);
    
        // setupuq
        v[0][3] = x[1] - x[0]
        for(let i=1;i<n-1;i++){
            v[i][3] = x[i+1] - x[i]
            v[i][0] = 1/v[i-1][3]
            v[i][1] = -1/v[i][3] -1/v[i-1][3]
            v[i][2] = 1/v[i][3]
            v[i][4] = v[i][0]**2 + v[i][1]**2 + v[i][2]**2
        }
        for(let i=1;i<n-2;i++) v[i][5] = v[i][1]*v[i+1][0] + v[i][2]*v[i+1][1]
        for(let i=1;i<n-3;i++) v[i][6] = v[i][2]*v[i+2][0]
    
        var prev   = (y[1] - y[0])/v[0][3]
        var diff, ratio;
        for(let i=1;i<n-1;i++){
            diff = (y[i+1] - y[i])/v[i][3]
            qty[i] = diff - prev
            prev = diff
        }
    
        // chol1s
        var six1mp = 6.0 * ( 1.0 - smooth )
    
        for(let i=1;i<n-1;i++){
            v[i][0] = six1mp*v[i][4] + 2.0*smooth*(v[i-1][3] + v[i][3])
            v[i][1] = six1mp*v[i][5] + smooth*v[i][3]
            v[i][2] = six1mp*v[i][6]
        }
    
        if(n<4){
            u[1] = qty[1]/v[1][0]
        } else{
            for (let i = 1; i < n-2; i++) {
                ratio = v[i][1]/v[i][0]
                v[i+1][0] -= ratio*v[i][1]
                v[i+1][1] -= ratio*v[i][2]
                v[i][1] = ratio
                ratio = v[i][2]/v[i][0]
                v[i+2][0] -= ratio*v[i][2]
                v[i][2] = ratio
            }
            // Forward substitution
            u[0] = 0
            v[0][2] = 0 
            u[1] = qty[1]
            for (let i = 1; i < n-2; i++) {
                u[i+1] = qty[i+1] - v[i][1] * u[i] - v[i-1][2]*u[i-1]
            }
    
            // Back substitution.
            u[n-1] = 0 
            u[n-2] = u[n-2]/v[n-2][0]
            for (let i = n-3; i >=1; i--) {
                u[i] = u[i]/v[i][0] - u[i+1]*v[i][1]  - u[i+2]*v[i][2]
            }
        }
    
        // Construct Q * U.
        prev = 0 
        for (let i = 1; i < n; i++) {
            qu[i] = (u[i] - u[i-1])/v[i-1][3]
            qu[i-1] = qu[i] - prev
            prev = qu[i]
        }
        qu[n-1]  = - qu[n-1]
    
        for (let i = 0; i < n; i++) {
            qu[i] = y[i] - 6*(1-smooth)*qu[i]
        }
        return qu
    }
}

smooth = new Smoother()

