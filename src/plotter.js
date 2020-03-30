// Not mainteained project

require('v8-compile-cache');
var figurecontainer = document.getElementById("figurecontainer"),
    data = [],
    ranges = [],
    zCols = [],
    fname, recentLocation='';
const Plotly = require('plotly.js-gl3d-dist');
const fs = require("fs");
const {ipcRenderer, remote,shell ,Menu} = require('electron');
const path = require('path');
const { dialog } = remote;

ipcRenderer.on('checkClose', function (e, d) { ipcRenderer.send('checkClose', 'closeIt')})

//Problems:
//1. openning the settinggs winsow is pushing the mode bar out



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
    height: window.innerHeight,
    width: window.innerWidth ,
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



function triggerDownload(){
    var div = document.createElement('div');
    div.id = 'download'
    div.innerHTML = `<div class='jjjj'><b> Save the image</b><br></div>
                    &ensp; File Name: <input type="text" id= "dfileName"><br>
                    &ensp; File Type:<select id="fileFormat">
                    <option>PDF</option>
                    <option>JPEG</option>
                            <option>PNG</option>
                            <option>SVG</option>
                            <option>WEBP</option>
                        </select><br>
                    &ensp; Image Resolution: <input type="text" id="imRes" value="1920x1080" list="resl" >
                    <datalist id="resl">
                    <option value="640×480">
                    <option value="800×600">
                    <option value="960×720">
                    <option value="1280×720">
                    <option value="1600×900">
                    <option value="1280×960">
                    <option value="1920×1080">
                    <option value="1440×1080">
                    <option value="1600×1200">
                    <option value="1856×1392">
                    <option value="1920×1440">
                    <option value="2560×1440">
                    <option value="2048×1536">
                    <option value="3840×2160">
                  </datalist>
                    <br>
                    <div  class='jjjj'>
                        <input type="button" value="OK" onclick="downloadImage();$('#download').remove();">
                        <input type="button" value="Cancel" onclick="$('#download').remove();">
                    </div>`.trim()
    document.body.appendChild(div)
}


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



//plotting a dummy surface plot and adding the updateJSON funtion to it
Plotly.newPlot(figurecontainer, [trace], layout, mode);





function fileLoader(){
    fname = dialog.showOpenDialogSync({ properties: ['openFile'], defaultPath: recentLocation });
    if (fname === undefined) return
    fname = fname[0]
    recentLocation = path.dirname(fname)
    fileReader(fname);
    

    $("#trace")[0].innerHTML =  '<option>1</option>'
    $("#trace")[0].selectedIndex = 0
    zCols.push(2);
    updateThisPlot();
    updateJSON();
}

function transpose(m) {
    return m[0].map((_, i) => m.map(x => x[i]));
};

function removeExtraTraces(){
    var ex = figurecontainer.data.length -1;
    if(ex){
        var tmp = []
        for(let i =1; i<=ex;i++){ //keep the first and delete every thing
            tmp.push(i)
        }
        Plotly.deleteTraces(figurecontainer, tmp);
    }
}

// loads file from the dialog box
function fileReader(fname) {
    removeExtraTraces()
    var strDps = fs.readFileSync(fname, "utf8");
    strDps = strDps.trim().split(/\r?\n\s*\r?\n/);
    col = strDps[0].trim().split("\n")[0].trim().split(/[\s\t]+/).length;
    data = [...Array(col)].map(_ => Array());
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

    for (var i = 0; i < col; ++i) {
        let flat_dat = [].concat(...data[i]);
        ranges.push([Math.min(...flat_dat), Math.max(...flat_dat)]);
    };

    //update the select boxes
    var op = "";
    for (var i = 1; i <= col; i++) {
        op += '<option>' + i + '</option>';
    };
    var tmp = $("#colSel select");
    for (var i = 0; i < tmp.length; i++) {
        tmp[i].innerHTML = op;
        tmp[i].selectedIndex = i;
    };

    $("#file_name1").html(path.basename(fname));

}


//adds new plot with colz as new z column
function addNewPlot(){
    var thisInd = figurecontainer.data.length
    var op = "";
    for(let i=1;i<=thisInd+1;i++){
        op += '<option>' + i + '</option>';
    }
    document.getElementById('trace').innerHTML = op
    document.getElementById('trace').selectedIndex = thisInd
    Plotly.addTraces(figurecontainer,trace)
    updateThisPlot()
    updateJSON()
}



function updateThisPlot(){
    var ind = $('#trace')[0].selectedIndex;
    a = $("#zcol")[0].selectedIndex;
    b = $("#ycol")[0].selectedIndex;
    c = $("#xcol")[0].selectedIndex;
    zCols[ind] = a
    Plotly.restyle(figurecontainer, { "x": [data[c]], "y": [data[b]], "z": [data[a]] },ind);
}


function traceUpdate(){
    var ind = $('#trace')[0].selectedIndex;
    $("#zcol")[0].selectedIndex = zCols[ind]
}


function deleteTrace(){
    var ind = $('#trace')[0].selectedIndex;
    zCols.splice(ind,1)
    if (!zCols.length){ //everything is gone reload
        return;
    }
    Plotly.deleteTraces(figurecontainer, ind);
    $('#trace')[0].selectedIndex = 0
    $("#zcol")[0].selectedIndex = zCols[0]
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
    // Plotly.relayout(figurecontainer, {
    //     'scene.zaxis.range': lim,
    // })
    // Plotly.restyle(figurecontainer, {
    //     "cmin": cmin,
    //     "cmax": cmax
    // })
    Plotly.update(figurecontainer, {
        "cmin": cmin,"cmax": cmax
    },{
        'scene.zaxis.range': lim
    })
    updateJSON()
};



var minWidth = window.innerWidth / 2.5
$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > minWidth / 5.0 && x < window.innerWidth / 2.5) {
            $('#sidebar').css("width", x - 2);
            $('#full').css("margin-left", x);
            minWidth = x;
            // resizePlot()
        }
    })
});


$('#split-bar2').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar2').offset().left;
        if (x > minWidth / 5.0 && x < window.innerWidth / 2.5) {
            $('#sidebar2').css("width", x - 2);
            $('#full').css("margin-left", x);
            $('#jsoneditor').css("width", x - 7);
            minWidth = x;
            // resizePlot()
        }
    })
});


var minWidth = window.innerWidth / 4
function openNav() {
    $('#split-bar2').css("width", 5);
    $('#sidebar2').css("width", minWidth);
    $('#jsoneditor').css("width", minWidth - 5);
    $('.floatdiv').css("margin-left", minWidth + 15);
    $('#figurecontainer').css("margin-left", minWidth + 15);
    $('.basediv').css("margin-left", minWidth + 6);
// resizePlot()
}


function closeNav() {
    $('#split-bar2').css("width", 0);
    $('#sidebar2').css("width", 0);
    $('.floatdiv').css("margin-left", 10);
    $('.basediv').css("margin-left", 0);
    $('#jsoneditor').css("width", 195);
    $('.ham').toggle()
// resizePlot()
}



$('#split-bar2').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar2').offset().left;
        if (x > minWidth / 5.0 && x < window.innerWidth / 2.5) {
            $('#sidebar2').css("width", x - 2);
            // $('#full').css("margin-left", x);
            $('.floatdiv').css("margin-left", x+10);
            $('.basediv').css("margin-left", x);
            $('#jsoneditor').css("width", x - 7);
            minWidth = x;
            // resizePlot()
        }
    })
});

$(document).mouseup(function (e) {$(document).unbind('mousemove')});



var typeList = ["Arial", "Balto", "Courier New", "Droid Sans", "Droid Serif", "Droid Sans Mono", "Gravitas One", "Old Standard TT", "Open Sans", "Overpass", "PT Sans Narrow", "Raleway", "Times New Roman"]
var colorPallete = ['Greys','YlGnBu','Greens','YlOrRd','Bluered','RdBu','Reds','Blues','Picnic','Rainbow','Portland','Jet','Hot','Blackbody','Earth','Electric','Viridis','Cividis']



var schema ={
    "properties":{
        "Surfaces":{
            "properties":{
                "colorscale":{
                    "type": "array",
                    "items": {
                        "type": "string",
                        "enum": colorPallete
                    }
                }
            }
        },
        "Layout":{
            "properties":{
                "Zaxis":{
                    "properties":{
                        "title":{
                            "properties":{
                                "font":{
                                    "properties":{
                                        "family":{
                                            "enum": typeList
                                        }
                                    }
                                }
                            }
                        },
                        "tickfont":{
                            "properties":{
                                "family":{
                                    "enum": typeList
                                }
                            }
                        },
                        "tickmode": {
                                "enum":["auto","linear", "array"]

                        },
                        "ticks":{
                            "enum":["outside","inside", ""]
                        }
                    }
                },
                "Yaxis":{
                    "properties":{
                        "title":{
                            "properties":{
                                "font":{
                                    "properties":{
                                        "family":{
                                            "enum": typeList
                                        }
                                    }
                                }
                            }
                        },
                        "tickfont":{
                            "properties":{
                                "family":{
                                    "enum": typeList
                                }
                            }
                        },
                        "tickmode": {
                                "enum":["auto","linear", "array"]

                        },
                        "ticks":{
                            "enum":["outside","inside", ""]
                        }
                    }
                },
                "Xaxis":{
                    "properties":{
                        "title":{
                            "properties":{
                                "font":{
                                    "properties":{
                                        "family":{
                                            "enum": typeList
                                        }
                                    }
                                }
                            }
                        },
                        "tickfont":{
                            "properties":{
                                "family":{
                                    "enum": typeList
                                }
                            }
                        },
                        "tickmode": {
                                "enum":["auto","linear", "array"]

                        },
                        "ticks":{
                            "enum":["outside","inside", ""]
                        }
                    }
                }
            }
        }
    }
}


var options = {
    onChangeJSON: function (json) {
        var layout = figurecontainer.layout;
        layout.scene.aspectmode = "manual"
        layout.scene.aspectratio = json.Layout.aspectratio
        layout.scene.xaxis = json.Layout.Xaxis
        layout.scene.yaxis = json.Layout.Yaxis
        layout.scene.zaxis = json.Layout.Zaxis
        layout.scene.zaxis.tickvals = json.Layout.Zaxis.tickvals.split(",")
        layout.scene.zaxis.ticktext = json.Layout.Zaxis.ticktext.split(",")
        layout.scene.xaxis.tickvals = json.Layout.Xaxis.tickvals.split(",")
        layout.scene.xaxis.ticktext = json.Layout.Xaxis.ticktext.split(",")
        layout.scene.yaxis.tickvals = json.Layout.Yaxis.tickvals.split(",")
        layout.scene.yaxis.ticktext = json.Layout.Yaxis.ticktext.split(",")

        Plotly.update(figurecontainer, json.Surfaces, layout);
    },
    onColorPicker: function (parent, color, onChange) {
        new JSONEditor.VanillaPicker({
            parent: parent,
            color: color,
            popup: 'bottom',
            onChange: function (color) {
                var alpha = color.rgba[3]
                var hex = (alpha === 1) ?
                    color.hex.substr(0, 7) :
                    color.hex
                onChange(hex)
            },
        }).show();
    },
    mode: 'form',
    schema: schema
};

var jsoneditor = document.getElementById('jsoneditor')
var editor = new JSONEditor( jsoneditor, options, {"Surfaces": '', "Layout": '' });
$('#jsoneditor').height(window.innerHeight - jsoneditor.offsetTop)



function updateJSON() {
    var Surfaces = {
        hoverinfo: [],
        colorscale: [],
        opacity: [],
        name : [],
        hoverlabel:[],
        showscale: [],
        cmin: [],
        cmax: [],
        cauto:[],
        colorbar:[],
        contours:[],
        hidesurface:[]
    }

    for (let trace of figurecontainer.data) {
            for (let key of Object.keys(Surfaces)){
                Surfaces[key].push(trace[key])
        }
    }
    let lay = JSON.parse(JSON.stringify(figurecontainer.layout.scene))
    var Layout = {
        "aspectratio" :lay.aspectratio,
        "Xaxis" :lay.xaxis,
        "Yaxis" :lay.yaxis,
        "Zaxis" :lay.zaxis,
    }
    try {
        Layout.Xaxis.ticktext = lay.xaxis.ticktext.join(',')
        Layout.Xaxis.tickvals = lay.xaxis.tickvals.join(',')
    } catch (err) {};
    try {
        Layout.Yaxis.ticktext = lay.yaxis.ticktext.join(',')
        Layout.Yaxis.tickvals = lay.yaxis.tickvals.join(',')
    } catch (err) {};
    try {
        Layout.Zaxis.ticktext = lay.zaxis.ticktext.join(',')
        Layout.Zaxis.tickvals = lay.zaxis.tickvals.join(',')
    } catch (err) {}
    editor.update({
        Surfaces,
        Layout
    })
}


ipcRenderer.on("menuTrigger", function (e, d) {
    if(d=="topbar"){
        $(".floatdiv").toggle();
    }else if(d=="open"){
        fileLoader()
    }else if(d=='lcon'){
        loadConfig()
    }else if(d=="scon"){
        saveConfig()
    } else if (d == "side") {
        if ($('#sidebar2').width()) {
            closeNav();
        } else {
            openNav();
        }
    }else if(d=='trigdown'){
        triggerDownload();
    }
})



function saveConfig(){
    var tmp_name = dialog.showSaveDialogSync({
        title: "Save Configuration",
        filters: [{
            name: 'JSON',
            extensions: ['json']
        }],
        defaultPath :recentLocation
    });
    if (tmp_name === undefined) return
    recentLocation = path.dirname(tmp_name)


    var Layout = {
        "aspectratio" :figurecontainer.layout.scene.aspectratio,
        "Xaxis" :figurecontainer.layout.scene.xaxis,
        "Yaxis" :figurecontainer.layout.scene.yaxis,
        "Zaxis" :figurecontainer.layout.scene.zaxis,
        "View" : figurecontainer.layout.scene.camera
    }
    try {
        Layout.Xaxis.ticktext = figurecontainer.layout.scene.xaxis.ticktext.join(',')
        Layout.Xaxis.tickvals = figurecontainer.layout.scene.xaxis.tickvals.join(',')
    } catch (err) {};
    try {
        Layout.Yaxis.ticktext = figurecontainer.layout.scene.yaxis.ticktext.join(',')
        Layout.Yaxis.tickvals = figurecontainer.layout.scene.yaxis.tickvals.join(',')
    } catch (err) {};
    try {
        Layout.Zaxis.ticktext = figurecontainer.layout.scene.zaxis.ticktext.join(',')
        Layout.Zaxis.tickvals = figurecontainer.layout.scene.zaxis.tickvals.join(',')
    } catch (err) { }


    var surfaces = {
        hoverinfo: [],
        colorscale: [],
        autocolorscale:[],
        opacity: [],
        name : [],
        hoverlabel:[],
        showscale: [],
        cmin: [],
        cmax: [],
        cauto:[],
        colorbar:[],
        contours:[],
        hidesurface:[]

    }
    for (let trace of figurecontainer.data) {
            for (let key of Object.keys(surfaces)){
                surfaces[key].push(trace[key])
        }
    }
    var x = $("#xcol")[0].selectedIndex;
    var y = $("#ycol")[0].selectedIndex;
    var z = zCols;
    var file = fname

    fs.writeFileSync(tmp_name, JSON.stringify({file, x,y,z,surfaces,Layout}, null, '\t'), 'utf8');
}

function loadConfig(){
    removeExtraTraces()
    const tfname = dialog.showOpenDialogSync({
        properties: ['openFile'],
        filters: [{
            name: 'JSON',
             extensions: ['json']
        }],
        defaultPath : recentLocation
    });
    if (tfname === undefined) return 
    var out = JSON.parse(fs.readFileSync(tfname[0], "utf8"))
    fname = out.file
    recentLocation = path.dirname(tfname[0])
    fileReader(out.file)    // data loaded
    zCols = out.z          
    //set up trace index selector
    var op = "";
    for(let i=1;i<=zCols.length;i++){
        op += '<option>' + i + '</option>';
    }
    $('#trace')[0].innerHTML = op
    $('#trace')[0].selectedIndex = 0
    $("#zcol")[0].selectedIndex=zCols[0];
    $("#ycol")[0].selectedIndex=out.y;
    $("#xcol")[0].selectedIndex=out.x;


    var tmp=[];
    if(zCols.length>1){
        for(let i=1; i<zCols.length ;i++){
            tmp.push(trace)
        }
        Plotly.addTraces(figurecontainer,tmp)
    }


    out.surfaces.x = [data[out.x]]
    out.surfaces.y = [data[out.y]]
    out.surfaces.z = []
    for(let i of zCols){
        out.surfaces.z.push(data[i])
    }
    var layout = figurecontainer.layout;
    layout.scene.aspectmode = "manual"
    layout.scene.aspectratio = out.Layout.aspectratio
    layout.scene.xaxis = out.Layout.Xaxis
    layout.scene.yaxis = out.Layout.Yaxis
    layout.scene.zaxis = out.Layout.Zaxis
    layout.scene.camera = out.Layout.View
    layout.scene.zaxis.tickvals = out.Layout.Zaxis.tickvals.split(",")
    layout.scene.zaxis.ticktext = out.Layout.Zaxis.ticktext.split(",")
    layout.scene.xaxis.tickvals = out.Layout.Xaxis.tickvals.split(",")
    layout.scene.xaxis.ticktext = out.Layout.Xaxis.ticktext.split(",")
    layout.scene.yaxis.tickvals = out.Layout.Yaxis.tickvals.split(",")
    layout.scene.yaxis.ticktext = out.Layout.Yaxis.ticktext.split(",")
    Plotly.update(figurecontainer, out.surfaces, layout)
    updateJSON();
}