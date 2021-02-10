const Plotly= require('plotly.js-gl3d-dist')
const fs = require("fs")
const {ipcRenderer, remote} = require('electron')
const path= require('path')
const { dialog, BrowserWindow, app } = remote
const url = require('url')
const xcol = document.getElementById('xcol')
const ycol = document.getElementById('ycol')
const zcol = document.getElementById('zcol')
const {downloadImage } = require('../js/download')
const {transpose}= require('../js/utils')
const $ = require('../lib/jquery.min')
const {alertElec}= require('../js/utils')

var data = [],ranges = [],zCols  = [],fname, recentLocation='',optionList='';



figurecontainer = document.getElementById("figurecontainer"),
ipcRenderer.on('checkClose', function (_,_) { ipcRenderer.send('checkClose', 'closeIt')});

var fullData = [], fullDataCols = [], fileNames=[], currentIndex =0;


var trace={
    type: 'surface',
    hoverinfo: "x+y+z",
    colorscale: "Portland",
    opacity: 1,
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
    ],
    showscale: false,
    cmin: 0,
    cmax: 0,
    cauto:true,
    colorbar:{
        thickness:30,
        dtick:1,
        len: 1,
        x:1.02,
        xpad:10,
        y:0.5,
        ypad:10,
        tickfont:{
            family:"Times New Roman",
            size : 20
        },
    },
    contours:{
        x:{
            show: false,
            highlight:true,
            start: 0,
            end : 0,
            size: 1,
            color: '#000',
            usecolormap: false,
            width : 1
        },
        y:{
            show: false,
            highlight:true,
            start: 0,
            end : 0,
            size: 1,
            color: '#000',
            usecolormap: false,
            width : 1
        },
        z:{
            show: false,
            highlight:true,
            start: 0,
            end : 0,
            size: 1,
            color: '#000',
            usecolormap: false,
            width : 1
        }
    },
    hidesurface:false
}

var layout = {
    margin: {
        t: 0,
        r: 0,
        b: 0,
        l: 0,
        pad: 0
    },
    autorange: true,
    spikesides: false,
    showlegend: true,
    autosize:true,
    scene: {
        aspectmode:"manual",
        aspectratio:{
            x: 1,
            y: 1,
            z: 1
        },
        zaxis: {
            title: "",
            titlefont:{
                family:"Times New Roman",
                size : 10
            },
            showticklabels:true,
            tickfont:{
                family:"Times New Roman",
                size : 15
            },
            tickmode: "auto",
            dtick:10,
            tickvals: '',
            ticktext:'',
            ticks:"outside",
            range:['',''],
            autorange: true,
            spikesides: false,
            showgrid: true,
            zeroline: false,
            showline: true,
        },
        yaxis: {
            title: "",
            titlefont:{
                family:"Times New Roman",
                size : 10
            },
            showticklabels:true,
            tickfont:{
                family:"Times New Roman",
                size : 15
            },
            tickmode: "auto",
            dtick:10,
            tickvals: '',
            ticktext:'',
            ticks:"outside",
            range:['',''],
            autorange: true,
            spikesides: false,
            showgrid: true,
            zeroline: false,
            showline: true,
        },
        xaxis: {
            title: "",
            titlefont:{
                family:"Times New Roman",
                size : 10
            },
            showticklabels:true,
            tickfont:{
                family:"Times New Roman",
                size : 15
            },
            tickmode: "auto",
            dtick:10,
            tickvals: '',
            ticktext:'',
            ticks:"outside",
            range:['',''],
            autorange: true,
            spikesides: false,
            showgrid: true,
            zeroline: false,
            showline: true,
        }
    },
}

Plotly.newPlot(figurecontainer, [trace], layout, {
    displaylogo:false,
    editable: true,
    responsive: true,
    modeBarButtonsToRemove : ["toImage","sendDataToCloud"],
    modeBarButtonsToAdd    : [
        [
            {
                name: 'Save the image',
                icon: Plotly.Icons.camera,
                click(){ $('#popupEx').show() }
            }
        ]
    ]
});


function resetEverything(){
    var tmp = Plotly.d3.range(1,figurecontainer.data.length)
    Plotly.deleteTraces(figurecontainer, tmp);
    currentIndex = 0
    fullData=[]
    fullDataCols=[]
    fileNames = []
}


function fileLoader(){
    resetEverything()
    fname = dialog.showOpenDialogSync({ properties: ['openFile'], defaultPath: recentLocation });
    if (fname === undefined) return
    fname = fname[0]
    recentLocation = path.dirname(fname)
    fileReader(fname);
    selUpdate()
    updatePlot();
    buildPlotList()
}


function addNewFile(){
    Plotly.addTraces(figurecontainer,trace)
    currentIndex = figurecontainer.data.length -1
    fileLoader()
}

function addNewPlot(){
    fullData.push(fullData[currentIndex])
    fullDataCols.push(fullDataCols[currentIndex])
    fileNames.push(fileNames[currentIndex])
    Plotly.addTraces(figurecontainer,trace)
    currentIndex = figurecontainer.data.length - 1
    updatePlot()
    buildPlotList()
}

function deleteThisPlot(){
    if (currentIndex=figurecontainer.data.length-1) currentIndex-=1
    if(figurecontainer.data.length==1) return
    Plotly.deleteTraces(figurecontainer, currentIndex)
    fullData.splice(currentIndex,1)
    fullDataCols.splice(currentIndex, 1)
    fileNames.splice(currentIndex,1)
    buildPlotList()
}



function fileReader(fname) {
    var tmpDat = fs.readFileSync(fname, "utf8").trim().split(/\r?\n\s*\r?\n/).map(dat=>{
        let res = dat.trim().split("\n").map( block=>block.trim().split(/[\s\t]+/).map(x=>{
            y = parseFloat(x)
            if(isNaN(y)) alertElec("Bad data found !!!\nCheck the file before openning.")
                // throw "badData"
            // }
            return y
        }))
        return transpose(res)
    })
    data = new Array(tmpDat[0].length).fill(0).map(_=> new Array())
    tmpDat.forEach(dat=>{
        dat.forEach((el,i)=>{
            data[i].push(el)
        })
    })
    fullData.push(data)
    fullDataCols.push({
        x : 0,
        y : 1,
        z : 2
    })
    fileNames.push(fname)
}


function selUpdate(){
    var optionList = ''
    for (var i = 1; i <= fullData[currentIndex].length; i++) optionList += '<option>' + i + '</option>';
    xcol.innerHTML = optionList 
    ycol.innerHTML = optionList 
    zcol.innerHTML = optionList 
    
    xcol.selectedIndex = fullDataCols[currentIndex].x
    ycol.selectedIndex = fullDataCols[currentIndex].y
    zcol.selectedIndex = fullDataCols[currentIndex].z
}



function buildPlotList(){
    var opTxt = ''

    for(let i=0; i<fileNames.length; i++){
        let fname = path.basename(fileNames[i], path.extname(fileNames[i]));
        let a = fullDataCols[i].x +1
        let b = fullDataCols[i].y +1
        let c = fullDataCols[i].z +1

        opTxt += `<option>${i+1}. ${fname}    ${a}:${b}:${c}</option>`
    }
    document.getElementById('plotList').innerHTML = opTxt
}



function updatePlot(){
    let a = xcol.selectedIndex;
    let b = ycol.selectedIndex;
    let c = zcol.selectedIndex;
    fullDataCols[currentIndex] = {x:a, y:b, z:c}
    Plotly.restyle(figurecontainer, { 
        "x": [fullData[currentIndex][a]], "y": [fullData[currentIndex][b]], "z": [fullData[currentIndex][c]] 
    }, currentIndex);
}


function getMinMax(col){
    var [min, max] = [Infinity, -Infinity]
    fullData[currentIndex][col].forEach(el=>{
        el.forEach(x=>{
            min = x<min ? x:min
            max = x>max ? x:max
        })
    })
    return [min,max]
}


function getRange(lim,col) {
    lim = lim.split(",").map(x => parseFloat(x));
    let [min, max] = getMinMax(col)
    if (isNaN(lim[0])) lim[0] = min
    if (isNaN(lim[1])) lim[1] = max
    cmin = Math.max(lim[0], min);
    cmax = Math.min(lim[1], max);
    return [lim, [cmin, cmax]];
};


function setXRange(lim) {
    var [lim, _] = getRange(lim, fullDataCols[currentIndex].x);
    Plotly.relayout(figurecontainer, {"scene.xaxis.range": lim});
};


function setYRange(lim) {
    var [lim, _] = getRange(lim, fullDataCols[currentIndex].y);
    Plotly.relayout(figurecontainer, {"scene.yaxis.range": lim});
};

function setZRange(lim) {
    var [lim, [t1,t2]] = getRange(lim, fullDataCols[currentIndex].z);
    Plotly.update(figurecontainer, {
        "cmin": t1,"cmax": t2
    },{
        'scene.zaxis.range': lim
    })
};



function showHideToolBox(){
    let tl = document.getElementById('toolbox')
    let ds = tl.style.display
    if(ds=='' || ds=='block') tl.style.display = 'none'
    if(ds=='none') tl.style.display = 'block'
}



function openPlotSetting(){
    let settingEditWindow = new BrowserWindow({
        minHeight: 700,
        minWidth:600,
        title: "Interactive Data Editor - Plot Settings",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        }
    });
    settingEditWindow.loadURL(url.format({
        pathname: path.join(__dirname, "./plotterpop.html"),
        protocol: 'file:',
        slashes: true
    }));
    settingEditWindow.setMenuBarVisibility(false);

    let layout  = figurecontainer.layout
    let trace = figurecontainer.data.map((el,i)=>{
        let fname = path.basename(fileNames[i], path.extname(fileNames[i]));
        let a = fullDataCols[i].x +1
        let b = fullDataCols[i].y +1
        let c = fullDataCols[i].z +1
        return {
            Title : `${i+1}. ${fname}    ${a}:${b}:${c}`,
            hoverinfo : el.hoverinfo,
            colorscale : el.colorscale,
            opacity : el.opacity,
            showscale : el.showscale,
            cmin : el.cmin,
            cmax : el.cmax,
            cauto : el.cauto,
            colorbar : el.colorbar,
            contours : el.contours,
            hidesurface : el.hidesurface,
        }
    })


    settingEditWindow.webContents.once("dom-ready", () => {
        // if (!app.isPackaged) settingEditWindow.webContents.openDevTools();
        settingEditWindow.webContents.send("plotsetting", [layout, trace]);
    })
    // fs.writeFileSync('tmp_name', JSON.stringify({layout, trace}, null, '\t'), 'utf8')
}


ipcRenderer.on("plotsetting", (_,d)=>{
    Plotly.update(figurecontainer,...d)
})



ipcRenderer.on("menuTrigger", function (e, d) {
    if(d=="open"){
        fileLoader()
    }else if(d=="add"){
        addNewFile()
    }else if(d=='lcon'){
        loadConfig()
    }else if(d=="scon"){
        saveConfig()
    }else if(d=='trigdown'){
        triggerDownload();
    }else if(d=='topbar'){
        showHideToolBox();
    }else if(d=='pdash'){
        openPlotSetting();
    }

})
