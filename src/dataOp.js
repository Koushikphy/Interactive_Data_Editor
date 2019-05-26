var copyVar;

function spline(xs,ys){
    var n=xs.length
    var diff = new Array(n).fill(0) 
    var u = new Array(n).fill(0)
    for(let i=1; i<n-1;i++){
        sig=(xs[i]-xs[i-1])/(xs[i+1]-xs[i-1])
        p=sig*diff[i-1]+2.0
        diff[i]=(sig-1.0)/p
        u[i]=(6.0*((ys[i+1]-ys[i])/(xs[i+1]-xs[i])-(ys[i]-ys[i-1])/(xs[i]-xs[i-1]))/(xs[i+1]-xs[i-1])-sig*u[i-1])/p
    }
    for (let i=n-2;i>-1;i=i-1){
        diff[i]=diff[i]*diff[i+1]+u[i]
    }

    return function(x){
        let i=0;
        while(x>xs[i]) i++; i--;
        h=xs[i+1]-xs[i]
        a=(xs[i+1]-x)/h
        b=(x-xs[i])/h
        return a*ys[i]+b*ys[i+1]+ ((a**3-a)*diff[i]+(b**3-b)*diff[i+1])*(h**2)/6.0
    }
}


function determinant(a,b,c,d,e,f,g,h,i){
    return a*e*i - a*f*h - b*d*i + b*g*f + c*d*h - c*e*g
}


function regression(xs ,ys){
    // fit with a quadratic polynomial
    var a = b = c = d = e = m = n = p = 0
    a = xs.length
    for (let i=0; i<a; i++){
        b += xs[i]
        c += xs[i]**2
        d += xs[i]**3
        e += xs[i]**4
        m += ys[i]
        n += ys[i]*xs[i]
        p += ys[i]*xs[i]**2
    }

    det = determinant(a,b,c,b,c,d,c,d,e)
    c0 = determinant(m,b,c,n,c,d,p,d,e)/det
    c1 = determinant(a,m,c,b,n,d,c,p,e)/det
    c2 = determinant(a,b,m,b,c,n,c,d,p)/det
    return function(x){ return c0 + c1*x + c2*x**2 }
}


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
    updatePlot(1);
    updateOnServer();
    saved = false;
    startDragBehavior();
}


function swapData() {
    if (!index.length) return;
    saveOldData();
    for (let ind of index) {
        [data[th_in][col.z][ind], data[th_in][col.s][ind]] = [data[th_in][col.s][ind], data[th_in][col.z][ind]]
    }
    updatePlot();
    updateOnServer();
}




function repeatMirror() {
    var last = parseFloat($("#einp").val());
    var times = parseFloat($("#etime").val());
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
    $("#extend").slideUp();
    resizePlot()
    updatePlot();
    var tmp = mirror ? 'mirrored' : 'repeated'
    showStatus(`Data ${tmp} ${times} times...`);
    startDragBehavior();
    updateOnServer();
    saved = false;
    fullData[0] = data
}








function dataFiller() {
    var start = parseFloat($("#fstart").val());
    var stop = parseFloat($("#fend").val());
    var step = parseFloat($("#fstep").val());
    var cols_wo_y = []
    var tmp = data[0].length
    // variable regressionIsOn
    var regressionIsOn = $("#expSel")[0].selectedIndex ? true : false;
    for (let i = 0; i < tmp; i++) {
        if (i != col.y) cols_wo_y.push(i)
    }

    var fullArr = []
    for (let i = start; i <= stop; i = i + step) {
        fullArr.push(i)
    }

    data = data.map(dat => {
        if (fullArr.length == dat[0].length) return dat; // no interpolation required
        var xs = dat[col.y].slice()
        var lInd = dat[col.y].length - 1;
        // check if regression is required by cheking the starting of the array
        let backRegRequired = false, frontRegRequired = false;
        if(regressionIsOn){
            if(fullArr[0]<xs[0]) frontRegRequired = true 
            if(fullArr[fullArr.length-1]>xs[xs.length-1]) backRegRequired = true
        }

        for (let tc of cols_wo_y) {
            newArr = [];
            var ys = dat[tc].slice();
            spl = spline(xs, ys)
            if(frontRegRequired){
                frontReg = regression(xs.slice(0,3), ys.slice(0,3))
            }
            if(backRegRequired){
                backReg = regression(
                    xs.slice(Math.max(xs.length-3,1)),
                    ys.slice(Math.max(ys.length-3,1))
                )
            }

            for (let val of fullArr) {
                ind = dat[col.y].indexOf(val)
                if (ind != -1) {
                    newArr.push(dat[tc][ind])
                } else {
                    if (val <= dat[col.y][0]) {  // front extrapolation
                        if (regressionIsOn){
                            newArr.push(frontReg(val))
                        }else{
                            newArr.push(dat[tc][0])
                        }
                    } else if (val >= dat[col.y][lInd]) { //back extrapolation
                        if (regressionIsOn){
                            newArr.push(backReg(val))
                        }else{
                            newArr.push(dat[tc][lInd])
                        }
                    } else {                            //spline interpolation
                        newArr.push(spl(val))
                    }
                }
            }

            dat[tc] = newArr;
        }
        dat[col.y] = fullArr;
        return dat;
    })

    $("#filler").slideUp();
    resizePlot()
    updatePlot();
    showStatus('Missing values are filled...');
    startDragBehavior();
    updateOnServer();
    saved = false;
    fullData[0] = data

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
    $("#filter").slideUp();
    resizePlot()
    updatePlot();
    showStatus('Data filtered...');
    startDragBehavior();
    updateOnServer();
    saved = false;
    fullData[0] = data
}




function deleteExtrapolate(){
    if (!index.length) return;

    first  = index[0]
    last = index[index.length - 1]
    // take 3 elements from both sides
    xs = dpsx.slice(Math.max(first-3,0),first).concat(dpsx.slice(last+1,last+4))
    ys = dpsy.slice(Math.max(first-3,0),first).concat(dpsy.slice(last+1,last+4))


    exterp = regression(xs,ys)
    saveOldData();
    for (let ind of index) {
        data[th_in][col.z][ind] = exterp(data[th_in][col.y][ind]);
    };

    updatePlot();
    updateOnServer();
    saved = false;
    fullData[0] = data
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


    spl = spline(xs,ys)
    saveOldData();
    for (let ind of index) {
        data[th_in][col.z][ind] = spl(data[th_in][col.y][ind]);
    };
    updatePlot();
    updateOnServer();
    // index = [];
    // Plotly.restyle(figurecontainer, {
    //     selectedpoints: [null]
    // });
    saved = false;
    fullData[0] = data

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
    fullData[0] = data
    saved = false;
};



function changeSign() {
    if (!index.length) return;
    saveOldData();
    for (let ind of index) {
        data[th_in][col.z][ind] *= -1;
    };
    updatePlot();
    updateOnServer();
    index = [];
    Plotly.restyle(figurecontainer, {
        selectedpoints: [null]
    });
    saved = false;
};