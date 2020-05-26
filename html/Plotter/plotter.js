//NOTE: This part of the project is not maintained for a long time


var data   = [],
    ranges = [],
    zCols  = [],
    fname, recentLocation='',optionList='';

const Plotly                            = require('plotly.js-gl3d-dist');
      fs                                = require("fs"),
      {ipcRenderer, remote} = require('electron'),
      path                              = require('path'),
      { dialog, BrowserWindow, app }                        = remote,
      url    = require('url'),
      xcol                              = document.getElementById('xcol'),
      ycol                              = document.getElementById('ycol'),
      zcol                              = document.getElementById('zcol');


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

const pop = document.getElementById('popup')
const popMain = document.getElementById('popmain')
const titletxt = document.getElementById('titletxt')
// remove the poopup box as it is only one
function closePop(){
    pop.style.opacity = 0
    setTimeout(()=>{pop.style.visibility='hidden'},250)
}

function openPop(){
    pop.style.visibility='visible'
    pop.style.opacity = 1
}

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

Plotly.newPlot(figurecontainer, [trace], layout, mode);

function resetEverything(){
    var tmp = Plotly.d3.range(1,figurecontainer.data.length)
    Plotly.deleteTraces(figurecontainer, tmp);
    currentIndex = 0
}


function fileLoader(){
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
    if(figurecontainer.data.length==1) return
    Plotly.deleteTraces(figurecontainer, currentIndex)
    fullData.splice(currentIndex,1)
    fullDataCols.splice(currentIndex, 1)
    fileNames.splice(currentIndex,1)
    buildPlotList()
}



// include a column retainer
// loads file from the dialog box
function fileReader(fname) {
    var strDps = fs.readFileSync(fname, "utf8");
    strDps = strDps.trim().split(/\r?\n\s*\r?\n/);
    col = strDps[0].trim().split("\n")[0].trim().split(/[\s\t]+/).length;
    data = [... Array(col)].map(_ => Array());
    for (var i = 0; i < strDps.length; i++) {
        blocks = strDps[i].trim().split("\n");
        for (var j = 0; j < blocks.length; j++) {
            blocks[j] = blocks[j].trim().split(/[\s\t]+/);
        };
        blocks = transpose(blocks);
        for (var k = 0; k < col; k++) {
            data[k].push(blocks[k]);
        };
    };
    fullData.push(data)
    fullDataCols.push({
        x : 1,
        y : 2,
        z : 3
    })
    fileNames.push(fname)

    // for (var i = 0; i < col; ++i) {
    //     let flat_dat = [].concat(...data[i]);
    //     ranges.push([Math.min(...flat_dat), Math.max(...flat_dat)]);
    // };
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

    for(let i=0; i<=fileNames.length-1; i++){
        let fname = path.basename(fileNames[i], path.extname(fileNames[i]));
        let a = fullDataCols[i].x +1
        let b = fullDataCols[i].y +1
        let c = fullDataCols[i].z +1

        opTxt += `<option>${i+1}. ${fname}    ${a}:${b}:${c}</option>`
    }
    document.getElementById('plotList').innerHTML = opTxt
}



function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
};


function updatePlot(){
    a = xcol.selectedIndex;
    b = ycol.selectedIndex;
    c = zcol.selectedIndex;
    fullDataCols[currentIndex] = {
        x : a, y : b, z:c
    }
    Plotly.restyle(figurecontainer, { 
        "x": [fullData[currentIndex][a]], "y": [fullData[currentIndex][b]], "z": [fullData[currentIndex][c]] 
    }, currentIndex);
}



function getRange(lim, range) {
    var min, max;
    lim = lim.split(",").map(x => parseFloat(x));
    [min, max] = range;

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


//assuming x and y column of all the traces will be the same
function setXRange(lim) {
    var xInd = $('#xcol')[0].selectedIndex+1
    var range = ranges[xInd]
    var [lim, [t1,t2]] = getRange(lim, range);
    console.log(lim)
    Plotly.relayout(figurecontainer, {
        "scene.xaxis.range": lim
    });
    updateJSON()
};


function setYRange(lim) {
    var yInd = $('#xcol')[0].selectedIndex+1
    var range = ranges[yInd]
    var [lim, [t1,t2]] = getRange(lim, range);
    Plotly.relayout(figurecontainer, {
        "scene.yaxis.range": lim
    });
    updateJSON()
};

// assuming zCols has  the list of all the current z axis cols
function setZRange(lim) {

    var tmpMin=[], tmpMax=[]
    for(let cc of zCols){
        tmpMin.push(ranges[cc][0])
        tmpMax.push(ranges[cc][1])
    }
    var range = [ Math.min(...tmpMin), Math.max(...tmpMax) ]
    var [lim, [cmin, cmax]] = getRange(lim,range)

    Plotly.update(figurecontainer, {
        "cmin": cmin,"cmax": cmax
    },{
        'scene.zaxis.range': lim
    })
    updateJSON()
};


function showHideToolBox(){
    console.log('here')
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
            nodeIntegration: true
        }
    });
    settingEditWindow.loadURL(url.format({
        pathname: path.join(__dirname, "./plotterpop.html"),
        protocol: 'file:',
        slashes: true
    }));
    settingEditWindow.setMenuBarVisibility(false);

    let layout  = figurecontainer.layout
    let trace  = []
    for(let t of figurecontainer.data){
        trace.push({
            type : t.type,
            hoverinfo : t.hoverinfo,
            colorscale : t.colorscale,
            opacity : t.opacity,
            showscale : t.showscale,
            cmin : t.cmin,
            cmax : t.cmax,
            cauto : t.cauto,
            colorbar : t.colorbar,
            contours : t.contours,
            hidesurface : t.hidesurface,
        })
    }

    settingEditWindow.webContents.once("dom-ready", function () {
        if (!app.isPackaged) settingEditWindow.webContents.openDevTools();
        settingEditWindow.webContents.send("plotsetting", [layout, trace]);
    })
}




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
    }else if(d=='plotsetting'){
        openPlotSetting();
    }

})







// function saveConfig(){
//     var tmp_name = dialog.showSaveDialogSync({
//         title: "Save Configuration",
//         filters: [{
//             name: 'JSON',
//             extensions: ['json']
//         }],
//         defaultPath :recentLocation
//     });
//     if (tmp_name === undefined) return
//     recentLocation = path.dirname(tmp_name)


//     var Layout = {
//         "aspectratio" :figurecontainer.layout.scene.aspectratio,
//         "Xaxis" :figurecontainer.layout.scene.xaxis,
//         "Yaxis" :figurecontainer.layout.scene.yaxis,
//         "Zaxis" :figurecontainer.layout.scene.zaxis,
//         "View" : figurecontainer.layout.scene.camera
//     }
//     try {
//         Layout.Xaxis.ticktext = figurecontainer.layout.scene.xaxis.ticktext.join(',')
//         Layout.Xaxis.tickvals = figurecontainer.layout.scene.xaxis.tickvals.join(',')
//     } catch (err) {};
//     try {
//         Layout.Yaxis.ticktext = figurecontainer.layout.scene.yaxis.ticktext.join(',')
//         Layout.Yaxis.tickvals = figurecontainer.layout.scene.yaxis.tickvals.join(',')
//     } catch (err) {};
//     try {
//         Layout.Zaxis.ticktext = figurecontainer.layout.scene.zaxis.ticktext.join(',')
//         Layout.Zaxis.tickvals = figurecontainer.layout.scene.zaxis.tickvals.join(',')
//     } catch (err) { }


//     var surfaces = {
//         hoverinfo: [],
//         colorscale: [],
//         autocolorscale:[],
//         opacity: [],
//         name : [],
//         hoverlabel:[],
//         showscale: [],
//         cmin: [],
//         cmax: [],
//         cauto:[],
//         colorbar:[],
//         contours:[],
//         hidesurface:[]

//     }
//     for (let trace of figurecontainer.data) {
//             for (let key of Object.keys(surfaces)){
//                 surfaces[key].push(trace[key])
//         }
//     }
//     var x = $("#xcol")[0].selectedIndex;
//     var y = $("#ycol")[0].selectedIndex;
//     var z = zCols;
//     var file = fname

//     fs.writeFileSync(tmp_name, JSON.stringify({file, x,y,z,surfaces,Layout}, null, '\t'), 'utf8');
// }

// function loadConfig(){
//     removeExtraTraces()
//     const tfname = dialog.showOpenDialogSync({
//         properties: ['openFile'],
//         filters: [{
//             name: 'JSON',
//              extensions: ['json']
//         }],
//         defaultPath : recentLocation
//     });
//     if (tfname === undefined) return 
//     var out = JSON.parse(fs.readFileSync(tfname[0], "utf8"))
//     fname = out.file
//     recentLocation = path.dirname(tfname[0])
//     fileReader(out.file)    // data loaded
//     zCols = out.z          
//     //set up trace index selector
//     var op = "";
//     for(let i=1;i<=zCols.length;i++){
//         op += '<option>' + i + '</option>';
//     }
//     $('#trace')[0].innerHTML = op
//     $('#trace')[0].selectedIndex = 0
//     $("#zcol")[0].selectedIndex=zCols[0];
//     $("#ycol")[0].selectedIndex=out.y;
//     $("#xcol")[0].selectedIndex=out.x;


//     var tmp=[];
//     if(zCols.length>1){
//         for(let i=1; i<zCols.length ;i++){
//             tmp.push(trace)
//         }
//         Plotly.addTraces(figurecontainer,tmp)
//     }


//     out.surfaces.x = [data[out.x]]
//     out.surfaces.y = [data[out.y]]
//     out.surfaces.z = []
//     for(let i of zCols){
//         out.surfaces.z.push(data[i])
//     }
//     var layout = figurecontainer.layout;
//     layout.scene.aspectmode = "manual"
//     layout.scene.aspectratio = out.Layout.aspectratio
//     layout.scene.xaxis = out.Layout.Xaxis
//     layout.scene.yaxis = out.Layout.Yaxis
//     layout.scene.zaxis = out.Layout.Zaxis
//     layout.scene.camera = out.Layout.View
//     layout.scene.zaxis.tickvals = out.Layout.Zaxis.tickvals.split(",")
//     layout.scene.zaxis.ticktext = out.Layout.Zaxis.ticktext.split(",")
//     layout.scene.xaxis.tickvals = out.Layout.Xaxis.tickvals.split(",")
//     layout.scene.xaxis.ticktext = out.Layout.Xaxis.ticktext.split(",")
//     layout.scene.yaxis.tickvals = out.Layout.Yaxis.tickvals.split(",")
//     layout.scene.yaxis.ticktext = out.Layout.Yaxis.ticktext.split(",")
//     Plotly.update(figurecontainer, out.surfaces, layout)
//     updateJSON();
// }
