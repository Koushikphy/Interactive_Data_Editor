var figurecontainer = document.getElementById("figurecontainer"),
    data = [],
    cols = [0, 1, 2],
    ldata = [],
    lIniData = [],
    ranges = [],
    swapped = false,
    newCol = [0, 0, 0],
    curCol = false;
const {ipcRenderer} = require('electron');
const Plotly = require('plotly.js-gl3d-dist');



ipcRenderer.on("sdata", function (e, d) {
    [data, swapped, newCol] = d;
    updatePlot();
    if (!curCol) curCol = newCol;
    if (newCol[0] !== curCol[0]) {
        curCol[0] = newCol[0];
        setXYRange($("#xInp").val(),0);
    } else if (newCol[1] !== curCol[1]) {
        curCol[1] = newCol[1];
        setXYRange($("#yInp").val(),1);
    } else if (newCol[2] !== curCol[2]) {
        curCol[2] = newCol[2];
        setZRange($("#zInp").val());
    }
})


function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
};



function getRange(lim, coln) {
    var min, max;

    lim = lim.split(",").map(x => parseFloat(x));
    if( !isNaN(lim[0]) & !isNaN(lim[1])) return lim

    var flat_dat = data[coln].flat();
    max = Math.max(...flat_dat);
    min = Math.min(...flat_dat);


    if (isNaN(lim[0])) {
        lim[0] = min;
    };
    if (isNaN(lim[1])) {
        lim[1] = max;
    };
    cmin = Math.max(lim[0], min);
    cmax = Math.min(lim[1], max);
    return [lim, [cmin, cmax]];
};

// assusme x=0, y=1
function setXYRange(lim, axis){
    // if(swapped) axis=+!axis
    ax = axis ? "yaxis" : "xaxis"
    if (lim == "") {
        var tmp = `scene.${ax}.autorange`
        Plotly.relayout(figurecontainer, {
            [tmp] : true // json key set from variable
        })
    }else {
        [lim, _] = getRange(lim, cols[axis]);
        var tmp = `scene.${ax}.range`
        Plotly.relayout(figurecontainer, {
            [tmp] : lim
        })
    }
}


function setZRange(lim) {
    if (lim == "") {
        Plotly.relayout(figurecontainer, {
            "scene.zaxis.autorange": true
        });
        return;
    };
    [lim, [cmin, cmax]] = getRange(lim, cols[2]);

    Plotly.relayout(figurecontainer, {
        'scene.zaxis.range': lim,
    })
    Plotly.restyle(figurecontainer, {
        "cmin": cmin,
        "cmax": cmax
    })
};


function makeRotation() {
    var issame = true,
        b = data[0][0].length;
    for (let a of data[0]) {
        if (a.length != b) {
            issame = false;
            break;
        };
    };

    if (issame) {
        xxx = transpose(data[0]);
        yyy = transpose(data[1]);
        zzz = transpose(data[2]);
        return;
    };

    var tmpData0 = [].concat(...data[0]).filter(x => x !== undefined),
        tmpData1 = [].concat(...data[1]).filter(x => x !== undefined),
        tmpData2 = [].concat(...data[2]).filter(x => x !== undefined);

    var tmp = [...new Set(tmpData1)].sort((a, b) => a - b);

    xxx = [], yyy = [], zzz = [];
    for (let x of tmp) {
        var tmp0 = [],
            tmp1 = [],
            tmp2 = [];
        for (let i = 0; i < tmpData0.length; i++) {
            if (tmpData1[i] == x) {
                tmp0.push(tmpData0[i]);
                tmp1.push(tmpData1[i]);
                tmp2.push(tmpData2[i]);
            };
        };
        xxx.push(tmp0);
        yyy.push(tmp1);
        zzz.push(tmp2);
    };
};



function initData(length) {
    var pl_data = [];
    for (var i = 0; i < length; i++) {
        pl_data.push({
            type: 'scatter3d',
            mode: "lines",
            x: [1, 2],
            y: [1, 2],
            z: [1, 2],
            marker: {
                size: 1.7,
                color: "#1f77b4"
            },
            line: {
                color: '#ff7f0e'
            },
            hoverinfo: "x+y+z",
            hoverlabel: {
                bgcolor: "#2ca02c"
            },
        })
    };
    return pl_data
};

var sIniData = [{
    type: 'surface',
    hoverinfo: "x+y+z",
    colorscale: "Portland",
    showscale: false,
    hoverlabel: {
        bgcolor: "#2ca02c"
    },
    z: [
        [1]
    ],
    x: [
        [1]
    ],
    y: [
        [1]
    ]
}];


var layout = {
    height: window.innerHeight + 68,
    width: window.innerWidth - 17,
    margin: {
        t: 0,
        r: 50,
        b: 0,
        l: 25,
        pad: 0
    },
    showlegend: false,
    scene: {
        aspectmode: "cube",
        zaxis: {
            autorange: true,
            spikesides: false,
        },
        yaxis: {
            spikesides: false,
        },
        xaxis: {
            spikesides: false,
        }
    },
};

