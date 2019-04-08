var data = [], compdata = [], olddata = "",
    dpsx = [], dpsy = [], dpsy2 = [], index = [], del_dat = [],
    th_in = 0, refdat = 1, ma = 1,
    file, points, pointscontainer,
    serve = 0,
    lockXc = 1,
    swapped = 0, swapper = false,
    ddd = false, col = { x: 0, y: 0, z: 0, s: 0 },
    xName = "X",
    $slider = $("#slider"),
    xCol = document.getElementById("xCol"),
    yCol = document.getElementById("yCol"),
    zCol = document.getElementById("zCol"),
    sCol = document.getElementById("sCol"),
    xVal = document.getElementById("x_val"),
    figurecontainer = document.getElementById("figurecontainer");
$ch = $("#custom-handle")




var layout = {
    autosize: true,
    plot_bgcolor: "#e8ebef",
    paper_bgcolor: '#fff',
    showlegend: false,
    hovermode: "closest",
    title: '',
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
        automargin: true
    },
    yaxis: {
        title: '',
        automargin: true,
        zeroline: false,
        showline: true,
        tickformat: " ,.5g",
        hoverformat: " ,.6g",
        showgrid: true,
    },
    font: { size: 14 },
    showlegend: true,
    legend: {
        x: 0,
        y: 1
    }
};

// make a color list here
var iniPointsD = {
    x: [1],
    y: [1],
    type: 'scatter',
    opacity: 1,
    mode: 'markers+lines',
    marker: {
        symbol: 200,
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
        symbol: 200,
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


const Plotly = require('plotly.js-gl3d-dist');
Plotly.newPlot(figurecontainer, [iniPointsD], layout, {
    displaylogo: false,
    modeBarButtonsToRemove: ['sendDataToCloud'], editable: true
});
pointscontainer = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points");
points = pointscontainer.getElementsByTagName("path");
figurecontainer.on("plotly_selected", selectEvent);
resizePlot();


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