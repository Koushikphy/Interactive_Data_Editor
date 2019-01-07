var data=[], compdata=[], olddata="",
    dpsx = [], dpsy1=[],dpsy2=[], index=[], del_dat=[],
    th_in = 0, refdat=1, ma =1,
    file, points, pointscontainer,
    serve = 0,
    lockXc = 1,
    swapped = 0,
    xName = "X",
    myDiv           =document.getElementById("status"),
    slider          =document.getElementById("x_input"),
    xCol            =document.getElementById("xCol"),
    yCol            =document.getElementById("yCol"),
    z1Col            =document.getElementById("z1Col"),
    z2Col            =document.getElementById("z2Col"),
    xVal            =document.getElementById("x_val"),
    figurecontainer =document.getElementById("figurecontainer");



$(window).keydown(hotKeys);

var layout = {
    height: window.innerHeight - 100,
    width: window.innerWidth - 17,
    plot_bgcolor: "#e8ebef",
    showlegend: false,
    selectdirection: 'h',
    hovermode: "closest",
    margin: {
        t: 25,
        r: 0,
        b: 20,
        l: 65,
        pad: 0
    },
    xaxis: {
        zeroline: false,
        showline: true,
    },
    yaxis: {
        automargin: true,
        zeroline: false,
        showline: true,
        tickformat: " ,.5g",
        hoverformat: " ,.6g",
    },
    font: { size: 14 },
};


var iniPointsD = {
    x: [1],
    y: [1],
    type: 'scatter',
    mode: 'markers+lines',
    marker: {
        symbol: "circle-dot",
        color: '#b00'
    },
    line: {
        width: 2,
        color: "#1e77b4",
    },
    hoverinfo: 'x+y',
};


var iniPointsC = {
    x: [1],
    y: [1],
    type: 'scatter',
    mode: 'markers+lines',
    marker: {
        symbol: "x",
        color: '#f17010'
    },
    line: {
        width: 2,
        color: "#3c6d2b",
    },
    hoverinfo: 'x+y',
};


Plotly.newPlot(figurecontainer, [iniPointsD, iniPointsC], layout, {displaylogo: false, modeBarButtonsToRemove: ['sendDataToCloud']});
figurecontainer.on("plotly_selected",selectEvent);