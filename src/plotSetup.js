var points;
const figurecontainer = document.getElementById("figurecontainer"),
        Plotly = require('plotly.js-gl3d-dist');



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
        automargin: true,
        zeroline: false,
        showline: true,
        showgrid: true,
        tickformat: " ,.5g",
        dtick:'',
        hoverformat: " ,.6g",
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
        showgrid: true,
        tickformat: " ,.5g",
        dtick:'',
        hoverformat: " ,.6g",
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


const clone = (x) => JSON.parse(JSON.stringify(x));
const clamp = (x, lower, upper) => Math.max(lower, Math.min(x, upper));
const transpose = (m)=>m[0].map((_, i) => m.map(x => x[i]));



function triggerDownload() {
    popMain.innerHTML = `&ensp; File Name:<input type="text" id= "dfileName"><br>
            &ensp; File Type: <select id="fileFormat">
            <option>PDF</option>
            <option>JPEG</option>
                    <option>PNG</option>
                    <option>SVG</option>
                    <option>WEBP</option>
                </select><br>
            &ensp; Image Resolution: <input type="text" id="imRes" value="1920x1080">
            <br>
            <div style='text-align:center;margin-top:10px'>
                <input type="submit" value="OK" onclick="downloadImage();closePop();">
            </div>`
        pop.style.width = 'fit-content'
        titletxt.innerHTML = 'Save Image'
        popMain.style.textAlign = 'left'
        openPop()
}

var mode={
    displaylogo:false,
    editable: true,
    responsive: true,
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

Plotly.newPlot(figurecontainer, [clone(iniPointsD)], layout, mode);
points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");




// ipcRenderer.on("rf",  (e, d)=> fileReader(d))

// ipcRenderer.on('checkClose', function (e, d) {
//     if (!saved) var res = dialog.showMessageBoxSync({
//         type: "warning",
//         title: "Unsaved data found!!!",
//         message: "Do you want to quit without saving the changes ?",
//         buttons: ['Yes', "No"]
//     });
//     if (!res) ipcRenderer.send('checkClose', 'closeIt');
// })


// // ipcRenderer.on("menuTrigger", (e, d) =>{
// //     if (show) console.log(e, d);
// //     if(d=="open") fileLoader()
// // });

// window.addEventListener("resize", function(){
//     $('#filler').width($('#container').parent().width())
//     if(fullData.length && ddd) sliderChanged()
// }) //needed to position the thumb div

// $('#filler').width($('#container').parent().width())
