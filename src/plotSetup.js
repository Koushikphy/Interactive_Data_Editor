var data = [],
    compdata = [],
    olddata = "",
    dpsx = [],
    dpsy = [],
    dpsy2 = [],
    index = [],
    del_dat = [],
    th_in = 0,
    refdat = 1,
    ma = 1,
    file, points, pointscontainer,
    serve = 0,
    lockXc = 1,
    swapped = 0,
    swapper = false,
    ddd = false,
    col = {
        x: 0,
        y: 0,
        z: 0,
        s: 0
    },
    xName = "X",
    $slider = $("#slider"),
    xCol = document.getElementById("xCol"),
    yCol = document.getElementById("yCol"),
    zCol = document.getElementById("zCol"),
    sCol = document.getElementById("sCol"),
    xVal = document.getElementById("x_val"),
    figurecontainer = document.getElementById("figurecontainer"),
    $ch = $("#custom-handle")

const Plotly = require('plotly.js-gl3d-dist');


var layout = {
    autosize: true,
    plot_bgcolor: "#fafafa",
    paper_bgcolor: '#fff',
    showlegend: false,
    hovermode: "closest",
    title: '',
    titlefont:{
        family:"Droid Sans",
        size:20,
        color:'#000000'
    },
    margin: {
        t: 25,
        r: 0,
        b: 19,
        l: 10,
        pad: 0
    },
    xaxis: {
        title: '',
        zeroline: false,
        showline: true,
        showgrid: true,
        automargin: true,
        // tick0:'',
        dtick:'',
        titlefont:{
            family:"Droid Sans",
            size:20,
            color:'#000000'
        }
        
    },
    yaxis: {
        title: '',
        automargin: true,
        zeroline: false,
        showline: true,
        tickformat: " ,.5g",
        // tick0:'',
        dtick:'',
        hoverformat: " ,.6g",
        showgrid: true,
        titlefont:{
            family:"Droid Sans",
            size:20,
            color:'#000000'
        }
    },
    font: {
        size: 14
    },
    showlegend: true,
    legend: {
        x: 0,
        y: 1
    }
};

var colorList = ["#1f77b4", "#ff7f0e", "#2ca02c", "#d62728", "#9467bd", "#8c564b", "#e377c2", "#7f7f7f", "#bcbd22", "#17becf"]

var iniPointsD = {
    x: [1],
    y: [1],
    type: 'scatter',
    opacity: 1,
    mode: 'markers+lines',
    marker: {
        symbol: "circle-dot",
        color: '#b00',
        size: 6,
        opacity: 1
    },
    line: {
        width: 2,
        color: "#1e77b4",
        dash: 0,
        shape: 'linear'
    },
    hoverinfo: 'x+y',
};


var iniPointsC = {
    x: [1],
    y: [1],
    type: 'scatter',
    opacity: 1,
    mode: 'markers+lines',
    marker: {
        symbol: "circle-dot",
        color: '#b00',
        size: 6,
        opacity: 1
    },
    line: {
        width: 2,
        color: "#1e77b4",
        dash: 0,
        shape: 'linear'
    },
    hoverinfo: 'x+y',
};




var mode={
    displaylogo:false,
    editable: true,
    modeBarButtonsToRemove : ["toImage","sendDataToCloud"],
    modeBarButtonsToAdd    : [
        [
            {
                name: 'Save the image',
                icon: Plotly.Icons.camera,
                click: triggerDownload
            }
        ]
    ]
}
Plotly.newPlot(figurecontainer, [iniPointsD], layout, mode);

pointscontainer = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points");
points = pointscontainer.getElementsByTagName("path");
figurecontainer.on("plotly_selected", selectEvent);
figurecontainer.on("plotly_relayout", updateJSON);
resizePlot();
figurecontainer.on("plotly_legendclick", function(){
    var tmpLeg=[]
    for (let trace of figurecontainer.data) {
        tmpLeg.push(trace.name)
    }
    legendNames = tmpLeg;
    updateJSON()
});


$(function () {
    $slider.slider({
        min: 0,
        max: 0,
        step: 1,
        slide: function (event, ui) {
            th_in = ui.value;
            sliderChanged();
        }
    });
});
var em2px = $ch.width() / 3