const {Regression, Spline, stepAhed} = require('../js/numeric')
 
const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper));
const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));


function alertElec(msg, type=1, title="Failed to execute."){
    dialog.showMessageBox(parentWindow,{
        type: type==1? "error": 'warning',
        title: title,
        message: msg,
        buttons: ['OK']
    });
}


function parseData(strDps) {
    var newdat = [],
        blocks = [];
    strDps = strDps.trim().split(/\r?\n\s*\r?\n/);
    try{
        for (let i of strDps) {
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
        if(err='badData'){
            alertElec("Bad data found !!!\nCheck the file before openning.")
        }
        return
    }
    return newdat;
};



function expRotate(tmpData, i, j) {
    //Bunch up on i-th column and sort along j-th column
    tmpData = tmpData.map(x => transpose(x));
    if (!issame) {
        issame = true;
        var b = tmpData[0].length;
        for (let a of tmpData) {
            if (a.length != b) {
                issame = false;
                break;
            };
        };
    }
    if (issame) {
        tmpData = transpose(tmpData);
        tmpData = tmpData.map(x => transpose(x));
        return tmpData;
    };

    tmpData = [].concat(...tmpData).filter(x => x !== undefined);

    var tmp = new Set();
    for (let a of tmpData) {
        tmp.add(a[i]);
    };
    tmp = [...tmp].sort((a, b) => a - b);
    var newdat = [];
    for (let x of tmp) {
        var tmpdat = [];
        for (let line of tmpData) {
            if (x == line[i]) {
                tmpdat.push(line)
            };
        };
        tmpdat = tmpdat.sort((m, n) => m[j] - n[j]);
        newdat.push(transpose(tmpdat));
    };
    return newdat;
};



function repeatMirrorData(data, ycol, last, times){
    var cols_wo_y = []
    var tmp = data[0].length

    for (let i = 0; i < tmp; i++) {
        if (i != ycol) cols_wo_y.push(i)
    }

    data = data.map(dat => {
        var ind = dat[ycol].indexOf(last) + 1
        var newy = dat[ycol].slice(0, ind)
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
    return data
}



function fillMissingGrid(data, ddd, col, allowRegression, start, stop, step ){

    var cols_wo_y = []   // on which columns to fill the data

    let noCol = ddd? [col.x,col.y] : [col.y]

    for (let i = 0; i < data[0].length; i++){
        if(!noCol.includes(i)) cols_wo_y.push(i)
    }

    var fullArr = []
    var ttt = Plotly.d3.range(start, stop+step, step)

    for (let xx of data[0][col.y]){ // array before the newgrid 
        if(xx>=start) break
        fullArr.push(xx)
    }
    fullArr = fullArr.concat(ttt)
    for (let xx of data[0][col.y]){ // array after the new grid
        if(xx<=stop) continue
        fullArr.push(xx)
    }


    data = data.map(dat => {
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
    return data

}


function applyCutOFF(data, colmn,condition, thrsh, fillVal){
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
    return data
}



function useRegression(xx, yy, index, condition=1){
    // if (!index.length) return yy;
    let xs = xx.slice(); //shallow copy
    let ys = yy.slice();
    let ind= index.slice()

    first = ind[0]
    last = ind[ind.length - 1]

    if(condition==1){ // normal regression
        // take 3 numbers from both sides
        let xxs = xs.slice(Math.max(first-3,0),first).concat(xs.slice(last+1,last+4))
        let yys = ys.slice(Math.max(first-3,0),first).concat(ys.slice(last+1,last+4))
        if(xxs.length<3) return ys;
        exterp = new Regression(xxs,yys, 2)
        for (let i of ind) ys[i] = exterp.val(xs[i]);

    } else if(condition==2){ // data dataSupEnd
        let xxs= xs.slice(Math.max(first-3,0),first)
        let yys= ys.slice(Math.max(first-3,0),first)
        if(xxs.length<3) return ys;
        exterp = new Regression(xxs,yys, 2)
        let tmpVal = exterp.val(xs[first]) - ys[first]
        for (let i of ind) ys[i] += tmpVal;

    } else if(condition==3){// dataSup start
        let xxs= xs.slice(last+1,last+4)
        let yys= ys.slice(last+1,last+4)
        if(xxs.length<3) return ys;
        exterp = new Regression(xxs,yys, 2)
        let tmpVal = exterp.val(xs[last]) - ys[last]
        for (let i of ind) ys[i] += tmpVal;
    }
    return ys
}



function useSpline(xx, yy, index){
    // if (!index.length) return yy;
    let xs = xx.slice();
    let ys = yy.slice();
    let ind= index.slice()
    // console.log(xs,ys,ind)
    //check for endpoints
    if (ind[0] == 0) ind.splice(0, 1)
    if (ind[ind.length - 1] == xs.length - 1) ind.splice(-1, 1)
    let xxs = xs.slice()
    let yys = ys.slice()
    for (let i = ind.length - 1; i >= 0; i--) {
        xxs.splice(ind[i], 1);
        yys.splice(ind[i], 1);
    }
    spl = new Spline(xxs,yys)
    for (let i of ind) ys[i] = spl.getVal(xs[i]);
    // console.log(ys)
    return ys
}

function regressionFit(xx,yy,n){
    var xs = xx.slice(), ys = yy.slice(), fity=[];
    var poly = new Regression(xs,ys,n)
    for(let x of xs) fity.push(poly.val(x))
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
    useRegression,
    useSpline,
    levenMarFit,
    regressionFit
}
