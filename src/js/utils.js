const {Regression, Spline, stepAhed} = require('../js/numeric');
const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper));
const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));


function alertElec(msg, type=1, title="Failed to execute."){
    dialog.showMessageBox(remote.getCurrentWindow(),{
        type: type==1? "error": 'warning',
        title: title,
        message: msg,
        buttons: ['OK']
    });
}


function parseData(strDps) {
    var newdat = [],blocks = [];
    var strps = strDps.trim().split(/\r?\n\s*\r?\n/);
    try{
        for (let i of strps) {
            blocks = i.trim().split("\n");
            for (var j = 0; j < blocks.length; j++) {
                blocks[j] = blocks[j].trim().split(/[\s\t]+/);
                blocks[j] = blocks[j].map(x => {
                    y = parseFloat(x)
                    if(isNaN(y)){
                        throw "badData"
                    } else{
                        return y
                    }
                });
            };
            newdat.push(transpose(blocks));
        }
    } catch(err){
        if(err='badData') alertElec("Bad data found !!!\nCheck the file before openning.")
        return
    }
    return newdat;
};



function expRotate(inp, i, j) { // this function is not good
    //Bunch up on i-th column and sort along j-th column
    tmpData = inp.map(x => transpose(x));
    if(!issame) issame = tmpData.every(v=>v.length==tmpData[0].length)

    if (issame) return transpose(tmpData).map(x => transpose(x))

    tmpData = [].concat(...tmpData).filter(x => x !== undefined);

    var tmp = [...new Set(tmpData.map(x=>x[i]))].sort((a, b) => a - b);

    return tmp.map(x=>{
        var tmpdat = tmpData.filter(l=>x==l[i])
        tmpdat = tmpdat.sort((m, n) => m[j] - n[j])
        return transpose(tmpdat)
    });

};



function repeatMirrorData(data, ycol, last, times){

    var cols_wo_y = [...Array(data[0].length).keys()].filter(i=>i!=ycol)

    res = data.map(dat => {
        var ind = dat[ycol].indexOf(last) + 1
        var newy= dat[ycol].slice(0, ind)
        var tmp = newy.slice()
        tmp.splice(0, 1)

        for (let time = 0; time < times - 1; time++) {
            for (let i = 0; i < tmp.length; i++) newy.push(tmp[i] + last * (1 + time));
        }

        for (let i of cols_wo_y) {
            var new_dat = dat[i].slice(0, ind)
            var tmp = new_dat.slice()
            for (let time = 0; time < times - 1; time++) {
                ptmp = mirror ? tmp.reverse().slice() : tmp.slice()
                ptmp.splice(0, 1)
                new_dat.push(...ptmp)
            }
            dat[i] = new_dat;
        }
        dat[ycol] = newy;
        return dat
    })
    return res
}



function fillMissingGrid(data, ddd, col, allowRegression, start, stop, step ){

    let noCol = ddd? [col.x,col.y] : [col.y]

    var cols_wo_y = [...Array(data[0].length).keys()].filter(i=>!noCol.includes(i))

    var ttt = Plotly.d3.range(start, stop+step, step)


    var fullArr = data[0][col.y].filter(x=>x<start)
    fullArr = fullArr.concat(ttt)
    fullArr = fullArr.concat(data[0][col.y].filter(x=>x>stop))



    res = data.map(dat => {
        if (fullArr.length == dat[0].length) return dat; // no interpolation required
        var xs = dat[col.y].slice()
        var lInd = dat[col.y].length - 1;
        // check if regression is required by cheking the starting of the array
        let backRegRequired = false, frontRegRequired = false;
        if(allowRegression && xs.length>=3){ // dont try to extrapolate if datalength is less than 3
            frontRegRequired = fullArr[0]<xs[0]
            backRegRequired = fullArr[fullArr.length-1]>xs[xs.length-1]
        }

        for (let tc of cols_wo_y) {
            newArr = [];
            var ys = dat[tc].slice();
            spl = new Spline(xs, ys)

            if(frontRegRequired)frontReg = new Regression(xs.slice(0,3), ys.slice(0,3),2)

            if(backRegRequired) backReg = new Regression( xs.slice(Math.max(xs.length-3,1)), ys.slice(Math.max(ys.length-3,1)),2)

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
    return res

}


function applyCutOFF(data, colmn,condition, thrsh, fillVal){
    return data.map(dat => {
        for (let tc of colmn) {
            dat[tc] = dat[tc].map(x => {
                if((condition==0 && x < thrsh) || (condition==1 && x > thrsh) || (condition==0 && x == thrsh) ) return fillVal
                return x;
            })
        }
        return dat;
    })
}



function useRegression(xx, yy, ind, condition=1){
    let xs = xx.slice(); //shallow copy
    let ys = yy.slice();

    first = ind[0]
    last = ind[ind.length - 1]

    if(condition==1){ // normal regression
        // take 3 numbers from both sides
        let xxs = xs.slice(Math.max(first-3,0),first).concat(xs.slice(last+1,last+4))
        let yys = ys.slice(Math.max(first-3,0),first).concat(ys.slice(last+1,last+4))
        if(xxs.length<3) throw {ty:'sS', msg: "Not enough data points avialable"};
        exterp = new Regression(xxs,yys, 2)
        for (let i of ind) ys[i] = exterp.val(xs[i]);

    } else if(condition==2){ // data dataSupEnd
        let xxs= xs.slice(Math.max(first-3,0),first)
        let yys= ys.slice(Math.max(first-3,0),first)
        if(xxs.length<3) throw {ty:'sS', msg: "Not enough data points avialable"};
        exterp = new Regression(xxs,yys, 2)
        let tmpVal = exterp.val(xs[first]) - ys[first]
        for (let i of ind) ys[i] += tmpVal;

    } else if(condition==3){// dataSup start
        let xxs= xs.slice(last+1,last+4)
        let yys= ys.slice(last+1,last+4)
        if(xxs.length<3) throw {ty:'sS', msg: "Not enough data points avialable"};
        exterp = new Regression(xxs,yys, 2)
        let tmpVal = exterp.val(xs[last]) - ys[last]
        for (let i of ind) ys[i] += tmpVal;
    }
    return ys
}



function useSpline(xx, yy, ind){
    let xxs = xx.filter((_,i)=>!ind.includes(i))
    let yys = yy.filter((_,i)=>!ind.includes(i))

    spl = new Spline(xxs,yys)
    for (let i of ind) yy[i] = spl.getVal(xx[i]);
    return yy
}

function regressionFit(xx,yy,n){
    var xs = xx.slice(), ys = yy.slice();
    var poly = new Regression(xs,ys,n)
    var fity = xs.map((i)=>poly.val(i))
    // for(let x of xs) fity.push(poly.val(x))
    return [fity, poly.cf]
}


function levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal,stepVal, etVal, egVal){
    if (!funcStr) throw 'Funtion is required.'
    if (!paramList) throw 'Prameters list is required'
    if (!maxIter) throw 'Maximum iteraion number is required'
    // set an predifned damping, error tol, error convergence, step size
    var parLen = paramList.length
    if(!isNaN(parameters[0])){
        // console.log(parameters)
        if(parameters.length!=parLen) throw 'Wrong number of initial values'
    } else{
        parameters = new Array(parLen).fill(0)
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
    if(!egVal) egVal = 1e-8

    try {// parse the formula
        funcList = ['sin','asin','sinh','cos','acos','cosh','tan','tanh','atan','exp','sqrt','log']
        for(let func of funcList){
            funcStr = funcStr.split(func).join('Math.'+func)//  .replace(func, 'Math.'+func)
        }
        func= eval(`(function([${paramList}]){return (x)=> ${funcStr}})`)
    } catch (error) {
        throw "Can't parse the formula."
    }


    let xs = dpsx.slice(); ys = dpsy.slice()


    try {
        func(parameters)(xs[0])  // check if the function is usable
    } catch (error) {
        throw "Something wrong, can't use the formula"
    }

    var olderror = Number.MIN_SAFE_INTEGER
    var converged = false
    for (let iteraion=0;iteraion<maxIter && !converged; iteraion++) {
        parameters = stepAhed( xs, ys, parameters, dampVal, stepVal, func);
        for (let k = 0; k < parameters.length; k++) {
            parameters[k] = Math.min( Math.max(minVal[k], parameters[k]),  maxVal[k]);
        }

        var error = 0, fity=[], chiError = 0;;
        const tfunc = func(parameters);
        for (var i = 0; i < xs.length; i++) {
            tmp  = tfunc(xs[i])
            error += Math.abs(ys[i] - tmp);
        }
        converged = Math.abs(error- olderror) <= egVal || error <=etVal;
        olderror = error
    }

    var tfunc = func(parameters);
    for (var i = 0; i < xs.length; i++) {
        tmp  = tfunc(xs[i])
        fity.push(tmp)
        yy = ys[i]
        if(yy>Number.EPSILON) chiError += (yy-tmp)**2/tmp
    }
    return [fity, parameters, chiError]
}


module.exports = {
    clone,
    clamp,
    transpose,
    expRotate,
    alertElec,
    parseData,
    repeatMirrorData,
    fillMissingGrid,
    applyCutOFF,
    useRegression,
    useSpline,
    levenMarFit,
    regressionFit
}
