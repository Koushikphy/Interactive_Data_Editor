const { Regression, Spline, stepAhed, detectBadData } = require('../js/numeric');
const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper));
const transpose = (m) => m[0].map((_, i) => m.map(x => x[i]));


function showStatus(msg) {
    let toast = document.createElement('div')
    toast.className = 'toast'
    toast.innerHTML = `<p style="margin: 0;">${msg}</p>
    <div class="toastTail" onclick=this.parentElement.remove()>
        <div class="toastCross">X</div>
    </div>`
    document.getElementById('toastContainer').appendChild(toast)
    setTimeout(function () { toast.classList.add('toastIn') }, 50) //slight flicker animation
    setTimeout(function () { toast.remove() }, 4321) // 4321 miliseconds to fade
}


function replaceWithHome(name) { // replaces full path name with the short one
    // var home = process.env.HOME || process.env.USERPROFILE;
    var home = os.userInfo().homedir;
    return name.includes(home) ? name.replace(home, "~") : name
};


function alertElec(msg, type = 1, title = "Failed to execute.") {
    dialog.showMessageBoxSync(getCurrentWindow(), {
        type: type == 1 ? "error" : 'warning',
        title: title,
        message: msg,
        buttons: ['OK']
    });
    throw 'Halted from alert'
}


function showInfo(title, msg, detail) {
    dialog.showMessageBox(getCurrentWindow(), {
        type: 'info',
        title: title,
        message: msg,
        detail: detail,
        buttons: ['OK']
    });
}


function parseData(strDps) {
    return strDps.trim().split(/\r?\n\s*\r?\n/).map(dat =>
        transpose(dat.trim().split("\n").map(line =>
            line.trim().split(/[\s\t]+/).map(val => {
                y = parseFloat(val)
                if (isNaN(y)) alertElec("Bad data found !!!\nCheck the file before opening.")
                return y
            })
        ))
    )
};


function expRotate(inp, i, j) { //Bunch up on i-th column and sort along j-th column
    var tmpData = inp.map(transpose);
    let issame = tmpData.every(v => v.length == tmpData[0].length)

    if (issame) return transpose(tmpData).map(transpose)

    tmpData = [].concat(...tmpData)//.filter(x => x !== undefined) // or - tmpData.flat()  // flat is slow
    var tmp = [...new Set(tmpData.map(x => x[i]))].sort((a, b) => a - b);

    var res = new Array(tmp.length).fill(0).map(_ => new Array())

    tmpData.forEach(el => {
        let ind = tmp.indexOf(el[i])
        res[ind].push(el)
    })
    // res = res.map(x=>x.sort((m, n) => m[j] - n[j])) // ignoring secondary sort
    return res.map(transpose)
};


function repeatMirrorData(data, ycol, last, times, mirror) {

    return data.map(dat => {
        var ind = dat[ycol].indexOf(last) + 1
        var newy = dat[ycol].slice(0, ind)
        var tmp = newy.slice(1)

        for (let time = 1; time < times; time++) {
            for (let el of tmp) newy.push(el + last * time)
        }

        return dat.map((i, j) => {
            if (j == ycol) return newy
            var new_dat = i.slice(0, ind)
            var tmp = new_dat.slice(0)
            for (let time = 1; time < times; time++) {
                ptmp = mirror ? tmp.reverse().slice(0) : tmp.slice(0)
                ptmp.splice(0, 1)
                new_dat.push(...ptmp)
            }
            return new_dat
        })
    })
}



function fillMissingGrid(data, is3D, col, allowRegression, start, stop, step) {

    var fullArr = [].concat(
        data[0][col.y].filter(x => x < start),
        Plotly.d3.range(start, stop + step, step),
        data[0][col.y].filter(x => x > stop)
    )


    return data.map(dat => {
        if (fullArr.length == dat[0].length) return dat; // no interpolation required
        var xs = dat[col.y].slice(0)
        var lInd = dat[col.y].length - 1;
        // check if regression is required by checking the starting of the array
        var backRegRequired = false, frontRegRequired = false;
        if (allowRegression && xs.length >= 3) { // dont try to extrapolate if datalength is less than 3
            frontRegRequired = fullArr[0] < xs[0]
            backRegRequired = fullArr[fullArr.length - 1] > xs[xs.length - 1]
        }

        return dat.map((ys, j) => {
            if (j == col.y) return fullArr;
            if (is3D && j == col.x) return new Array(fullArr.length).fill(dat[col.x][0])
            var newArr = [];
            spl = new Spline(xs, ys)

            if (frontRegRequired) frontReg = new Regression(xs.slice(0, 3), ys.slice(0, 3), 2)

            if (backRegRequired) backReg = new Regression(xs.slice(Math.max(xs.length - 3, 1)), ys.slice(Math.max(ys.length - 3, 1)), 2)

            for (let val of fullArr) {
                ind = dat[col.y].indexOf(val)
                if (ind != -1) {  // value already available, no filling required
                    newArr.push(ys[ind])
                } else {
                    if (val <= dat[col.y][0]) {  // front extrapolation
                        if (frontRegRequired) {
                            newArr.push(frontReg.val(val))
                        } else {  // else just use the 1st value
                            newArr.push(ys[0])
                        }
                    } else if (val >= dat[col.y][lInd]) { //back extrapolation
                        if (backRegRequired) {
                            newArr.push(backReg.val(val))
                        } else {
                            newArr.push(ys[lInd])
                        }
                    } else {                            //spline interpolation
                        newArr.push(spl.getVal(val))
                    }
                }
            }
            return newArr;
        })
    })
}


function applyCutOFF(data, colmn, condition, thrsh, fillVal) {
    return data.map(dat => {
        for (let tc of colmn) {
            dat[tc] = dat[tc].map(x => {
                if ((condition == 0 && x > thrsh) || (condition == 1 && x < thrsh) || (condition == 0 && x == thrsh)) return fillVal
                return x;
            })
        }
        return dat;
    })
}



function useRegression(xx, yy, ind, condition = 1) {
    let xs = xx.slice(0); //shallow copy
    let ys = yy.slice(0);

    first = ind[0]
    last = ind[ind.length - 1]

    if (condition == 1) { // normal regression
        // take 3 numbers from both sides
        let xxs = xs.slice(Math.max(first - 3, 0), first).concat(xs.slice(last + 1, last + 4))
        let yys = ys.slice(Math.max(first - 3, 0), first).concat(ys.slice(last + 1, last + 4))
        if (xxs.length < 3) throw { ty: 'sS', msg: "Not enough data points available" };
        exterp = new Regression(xxs, yys, 2)
        for (let i of ind) ys[i] = exterp.val(xs[i]);

    } else if (condition == 2) { // data dataSupEnd
        let xxs = xs.slice(Math.max(first - 3, 0), first)
        let yys = ys.slice(Math.max(first - 3, 0), first)
        if (xxs.length < 3) throw { ty: 'sS', msg: "Not enough data points available" };
        exterp = new Regression(xxs, yys, 2)
        let tmpVal = exterp.val(xs[first]) - ys[first]
        for (let i of ind) ys[i] += tmpVal;

    } else if (condition == 3) {// dataSup start
        let xxs = xs.slice(last + 1, last + 4)
        let yys = ys.slice(last + 1, last + 4)
        if (xxs.length < 3) throw { ty: 'sS', msg: "Not enough data points available" };
        exterp = new Regression(xxs, yys, 2)
        let tmpVal = exterp.val(xs[last]) - ys[last]
        for (let i of ind) ys[i] += tmpVal;
    }
    return ys
}




function useSpline(xx, yy, ind) {
    // modifies the input arrays in place
    let xxs = xx.filter((_, i) => !ind.includes(i))
    let yys = yy.filter((_, i) => !ind.includes(i))

    spl = new Spline(xxs, yys)
    for (let i of ind) yy[i] = spl.getVal(xx[i]);
    return yy
}

function regressionFit(xx, yy, n) {
    var xs = xx.slice(0), ys = yy.slice(0);
    var poly = new Regression(xs, ys, n)
    var fity = xs.map((i) => poly.val(i))
    return [fity, poly.cf]
}


function levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal, stepVal, etVal, egVal) {
    if (!funcStr) throw 'Function is required.'
    if (!paramList) throw 'Parameters list is required'
    if (!maxIter) throw 'Maximum iteration number is required'
    // set an predefined damping, error tol, error convergence, step size
    var parLen = paramList.length
    if (!isNaN(parameters[0])) {
        // console.log(parameters)
        if (parameters.length != parLen) throw 'Wrong number of initial values'
    } else {
        parameters = new Array(parLen).fill(0)
    }
    if (!isNaN(minVal[0])) {
        if (!minVal.length != parLen) throw 'Wrong number of minimum values'
    } else {
        minVal = new Array(parLen).fill(Number.MIN_SAFE_INTEGER)
    }
    if (!isNaN(maxVal[0])) {
        if (!maxVal.length != parLen) throw 'Wrong number of maximum values'
    } else {
        maxVal = new Array(parLen).fill(Number.MAX_SAFE_INTEGER)
    }
    if (dampVal) {
        if (dampVal < 0) throw 'Damping factor must be positive'
    } else {
        dampVal = 1.5
    }
    if (!stepVal) stepVal = 1e-2
    if (!etVal) etVal = 1e-5
    if (!egVal) egVal = 1e-8

    try {// parse the formula
        funcList = ['sin', 'asin', 'sinh', 'cos', 'acos', 'cosh', 'tan', 'tanh', 'atan', 'exp', 'sqrt', 'log']
        for (let func of funcList) {
            funcStr = funcStr.split(func).join('Math.' + func)//  .replace(func, 'Math.'+func)
        }
        func = eval(`(function([${paramList}]){return (x)=> ${funcStr}})`)
    } catch (error) {
        throw "Can't parse the formula."
    }

    let xs = dpsx.slice(0); ys = dpsy.slice(0)

    try {
        func(parameters)(xs[0])  // check if the function is usable
    } catch (error) {
        throw "Something wrong, can't use the formula"
    }

    var olderror = Number.MIN_SAFE_INTEGER
    var converged = false
    for (let iteration = 0; iteration < maxIter && !converged; iteration++) {
        parameters = stepAhed(xs, ys, parameters, dampVal, stepVal, func);
        for (let k = 0; k < parameters.length; k++) {
            parameters[k] = Math.min(Math.max(minVal[k], parameters[k]), maxVal[k]);
        }

        var error = 0, fity = [], chiError = 0;;
        const tfunc = func(parameters);
        for (var i = 0; i < xs.length; i++) {
            tmp = tfunc(xs[i])
            error += Math.abs(ys[i] - tmp);
        }
        converged = Math.abs(error - olderror) <= egVal || error <= etVal;
        olderror = error
    }

    var tfunc = func(parameters);
    for (var i = 0; i < xs.length; i++) {
        tmp = tfunc(xs[i])
        fity.push(tmp)
        yy = ys[i]
        if (yy > Number.EPSILON) chiError += (yy - tmp) ** 2 / tmp
    }
    return [fity, parameters, chiError]
}


function fixBadData(xArr, yArr, smVal, cutVal) {
    return new Promise((resolve, reject) => {

        var ind = detectBadData(xArr, yArr, smVal, cutVal)
        var tmpArr = [...yArr]
        // check how much start values it contains-------------------------------------------
        var indNew = []
        for (let i = 0; i < xArr.length; i++) {
            if (ind.includes(i)) {
                indNew.push(i)
            } else {
                break
            }
        }

        if (indNew.length) {
            tmpArr = useRegression(xArr, tmpArr, indNew)
            ind = ind.filter(i => !indNew.includes(i))
        }


        // check how much end values it contans----------------------------------------------------
        var indNew = []
        for (let i = xArr.length - 1; i > 0; i--) {
            if (ind.includes(i)) {
                indNew.unshift(i)
            } else {
                break
            }
        }

        if (indNew.length) {
            tmpArr = useRegression(xArr, tmpArr, indNew)
            ind = ind.filter(i => !indNew.includes(i))
        }

        // NOTE: Spline is not always is the correct choice for the intermidiate 
        // bad valus, can we decide, what to run spline or moving average ???
        // spline interpolation for intermidieate points

        let xxs = xArr.filter((_, i) => !ind.includes(i))
        let yys = tmpArr.filter((_, i) => !ind.includes(i))

        let spl = new Spline(xxs, yys)
        for (let i of ind) tmpArr[i] = spl.getVal(xArr[i]);
        resolve(tmpArr);

    });


}

module.exports = {
    showInfo,
    showStatus,
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
    regressionFit,
    replaceWithHome,
    fixBadData
}
