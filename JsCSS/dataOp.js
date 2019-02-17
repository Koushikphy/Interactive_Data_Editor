var copyVar;

function copyThis() {
    copyVar = JSON.stringify(data[th_in]);
}

function pasteThis() {
    saveOldData();
    data[th_in] = JSON.parse(copyVar);
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
    data = data.map(dat => {

        var ind = dat[col.y].indexOf(last) + 1
        if (!ind) alert("Endpoint must exist !!!")
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
    updatePlot();
    var tmp = mirror ? 'mirrored' : 'repeated'
    showStatus(`Data ${tmp} ${times} times...`);
    startDragBehavior();
    updateOnServer();
    saved = false;
}



function dataFiller() {
    var start = parseFloat($("#fstart").val());
    var stop = parseFloat($("#fend").val());
    var step = parseFloat($("#fstep").val());
    var cols_wo_y = []
    var tmp = data[0].length

    for (let i = 0; i < tmp; i++) {
        if (i != col.y) cols_wo_y.push(i)
    }

    var fullArr = []
    for (let i = start; i <= stop; i = i + step) {
        fullArr.push(i)
    }

    data = data.map(dat => {
        if (fullArr.length == dat[0].length) return dat;
        var xs = dat[col.y].slice()
        var lInd = dat[col.y].length - 1;
        for (let tc of cols_wo_y) {
            newArr = [];
            var ys = dat[tc].slice()
            ks = getNaturalKs(xs, ys);

            function spline(x) {
                var i = 1;
                while (xs[i] < x) i++;
                var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
                var a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
                var b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
                var q = (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
                return q;
            };

            for (let val of fullArr) {
                ind = dat[col.y].indexOf(val)
                if (ind != -1) {
                    newArr.push(dat[tc][ind])
                } else {
                    if (val <= dat[col.y][0]) {
                        newArr.push(dat[tc][0])
                    } else if (val >= dat[col.y][lInd]) {
                        newArr.push(dat[tc][lInd])
                    } else {
                        newArr.push(spline(val))
                    }
                }
            }
            dat[tc] = newArr;
        }
        dat[col.y] = fullArr;
        return dat;
    })

    $("#filler").slideUp();
    updatePlot();
    showStatus('Missing values are filled...');
    startDragBehavior();
    updateOnServer();
    saved = false;
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
    updatePlot();
    showStatus('Data filtered...');
    startDragBehavior();
    updateOnServer();
    saved = false;
}



function getNaturalKs(xs, ys) {
    var ks = new Array(xs.length).fill(0);
    var n = xs.length - 1;
    var A = [];
    for (var i = 0; i < n + 1; i++) {
        A.push(new Array(n + 2).fill(0));
    };

    for (var i = 1; i < n; i++) {
        A[i][i - 1] = 1 / (xs[i] - xs[i - 1]);
        A[i][i] = 2 * (1 / (xs[i] - xs[i - 1]) + 1 / (xs[i + 1] - xs[i]));
        A[i][i + 1] = 1 / (xs[i + 1] - xs[i]);
        A[i][n + 1] = 3 * ((ys[i] - ys[i - 1]) / ((xs[i] - xs[i - 1]) * (xs[i] - xs[i - 1])) + (ys[i + 1] - ys[i]) / ((xs[i + 1] - xs[i]) * (xs[i + 1] - xs[i])));
    };

    A[0][0] = 2 / (xs[1] - xs[0]);
    A[0][1] = 1 / (xs[1] - xs[0]);
    A[0][n + 1] = 3 * (ys[1] - ys[0]) / ((xs[1] - xs[0]) * (xs[1] - xs[0]));

    A[n][n - 1] = 1 / (xs[n] - xs[n - 1]);
    A[n][n] = 2 / (xs[n] - xs[n - 1]);
    A[n][n + 1] = 3 * (ys[n] - ys[n - 1]) / ((xs[n] - xs[n - 1]) * (xs[n] - xs[n - 1]));

    return solve(A, ks);
};



function solve(A, ks) {
    var m = A.length;
    for (var k = 0; k < m; k++) {
        // pivot for column
        var i_max = 0;
        var vali = Number.NEGATIVE_INFINITY;
        for (var i = k; i < m; i++) {
            if (A[i][k] > vali) {
                i_max = i;
                vali = A[i][k];
            };
        };
        //swap rows
        var p = A[k];
        A[k] = A[i_max];
        A[i_max] = p;

        // for all rows below pivot
        for (var i = k + 1; i < m; i++) {
            for (var j = k + 1; j < m + 1; j++) {
                A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
                A[i][k] = 0;
            };
        };
    };
    for (var i = m - 1; i >= 0; i--) {
        var v = A[i][m] / A[i][i];
        ks[i] = v;
        for (var j = i - 1; j >= 0; j--) {
            A[j][m] -= A[j][i] * v;
            A[j][i] = 0;
        };
    };
    return ks;
};



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
    ks = getNaturalKs(xs, ys);

    function spline(x) {
        var i = 1;
        while (xs[i] < x) i++;
        var t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]);
        var a = ks[i - 1] * (xs[i] - xs[i - 1]) - (ys[i] - ys[i - 1]);
        var b = -ks[i] * (xs[i] - xs[i - 1]) + (ys[i] - ys[i - 1]);
        var q = (1 - t) * ys[i - 1] + t * ys[i] + t * (1 - t) * (a * (1 - t) + b * t);
        return q;
    };
    saveOldData();
    for (let ind of index) {
        data[th_in][col.z][ind] = spline(data[th_in][col.y][ind]);
    };
    updatePlot();
    updateOnServer();
    index = [];
    Plotly.restyle(figurecontainer, {
        selectedpoints: [null]
    });
    saved = false;
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
