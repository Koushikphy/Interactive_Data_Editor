const fs = require("fs");        
const { remote, ipcRenderer } = require('electron');
const path = require('path');
const {dialog, BrowserWindow,Menu} = remote;
const url = require('url');
var editorWindow;
var viewer=[,,]
const falseMenuTemplate =  [
        {
        label: 'File',
        submenu:[
            {
                label : "Save",
                enabled:false,
                accelerator:process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","save");
                }
            },
            {
                label : "Save As",
                enabled:false,
                accelerator:process.platform =='darwin' ? 'Command+Ctrl+S' : 'Shift+Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","saveas");
                }
            },
            {type:'separator'},
            {
                label:'Go Home',
                accelerator:process.platform == 'darwin' ? 'Command+H' : 'Ctrl+H',
                click(){
                    mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file:',
                    slashes:true
                    }));
                }
            },
            {
                role: "reload"
            },
            {type:'separator'},
            {
                role:"close",
            }
        ]
    },
    {
        label: "Edit",
        submenu:[
        {
            label: "CS somoothing",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'D' : 'D',
            click(){
                mainWindow.webContents.send("data","cs");
            }
        },
        {
            label: "MA Smoothing",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'M' : 'M',
            click(){
                mainWindow.webContents.send("data","ma");
            }
        },
        {
            label: "Change Sign",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'C' : 'C',
            click(){
                mainWindow.webContents.send("data","csign");
            }
        },
        {
            label: "Undo/Redo",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'Command+Z' : 'Ctrl+Z',
            click(){
                mainWindow.webContents.send("data","undo");
            }
        }
        ]
    },
    {
        label : "Help",
        submenu:[
        {
            label: "Help",
            click(){
                var childWindow = new BrowserWindow({icon: path.join(__dirname, 'icons/charts.ico')});
                childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'help.html'),
                protocol: 'file:',
                slashes:true
                }));
                childWindow.setMenu(null);
                }
        },
        {
            label: "About",
            click(){
                var childWindow = new BrowserWindow({width:500,height:500});
                childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'about.html'),
                protocol: 'file:',
                slashes:true
                }));
                childWindow.setMenu(null);
                }
        },
        {
            label: "Check for updates",
            click(){
                shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor/releases");
            }
        }
        ]
    }
];


function fileLoader(){
    const fname = dialog.showOpenDialog({properties: ['openFile']})[0];
    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname))
    var extn = path.extname(fname)
    save_name =path.join(dirname, filename + "_new" +extn);

    data = fs.readFileSync(fname,"utf8");
    data = parseData(data);
    thisJobs();
    myDiv.innerHTML ='Data loaded ...';

    var disp_name = filename+extn;
    if (filename.length>17){
        disp_name = filename.slice(0,13)+"..."+filename.slice(-3)+extn;
    };

    $("#file_name1").html(disp_name);
    document.title = "Interactive Data Editor - "+disp_name;
}




function compfileLoader(){
    const fname = dialog.showOpenDialog({properties: ['openFile']})[0];
    var filename = path.basename(fname)

    compdata = fs.readFileSync(fname,"utf8");
    compdata = parseData(compdata);
    myDiv.innerHTML='Data for comparison loaded ...';
    $("#isMark, #dummy").toggle();
    updatePlot(1);
    $("#file_name2").html(filename);

}

function parseData(strDps) {
    var newdat=[], blocks=[];  
    strDps = strDps.trim().split(/\t\t\t|\n\n/);
    for(let i of strDps) {
        blocks = i.trim().split("\n");
        for (var j = 0; j < blocks.length; j++) {
            blocks[j] = blocks[j].trim().split(/[\s\t]+/);
            blocks[j] = blocks[j].map( x => parseFloat(x));
        };
        newdat.push(blocks);
    };
    if (swapped) newdat = transpose(newdat);
    newdat = newdat.map(x => transpose(x));
    return newdat;
};


function saveAs(){
    if(!data.length) {alert("Nothing to save!"); return}
    save_name = dialog.showSaveDialog({title:"Save As:",defaultPath:save_name});
    saveData();
}


function saveData() { 
    if(!data.length) {alert("Nothing to save!"); return}
    var tmpData = data.map(x => transpose(x));
    if (swapped) tmpData = transpose(tmpData);
    var txt = "";

    for (let i of tmpData) {
        for (let j of i) {
            txt += j.map(n => parseFloat(n).toFixed(8)).join("\t") +"\n";
        };
    txt += "\n";
    };
    fs.writeFileSync(save_name,txt);
    myDiv.innerHTML="Data Saved as " + path.basename(save_name)+" on "+new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric',second:'numeric', hour12: true });
};


ipcRenderer.on("data",function(e,d){
    switch(d){
        case "save":
            saveData();
            break;

        case "saveas" :
            saveAs();
            break;
            
        case "cs":
            deleteInterpolate()
            break;

        case "ma" :
            autoSmooth();
            break;

        case "csign":
            changeSign();
            break;

        case "undo":
            unDo();
            break;
    }
});


ipcRenderer.on("back",function(e,d){
    data = d.map(x=>transpose(x))
    updatePlot(1);
    updateOnServer();
})



function editor(){
    if(!data.length)  {alert("Nothing to show!"); return}
    var sl = $(".slidecontainer").find("input")[0] 
    var tex = $(".slidecontainer").find("p")[1].innerHTML
     editorWindow = new BrowserWindow({minWidth:1200,show:false});
    editorWindow.maximize();
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, "handtable.html"),
        protocol: 'file:',
        slashes:true
    }));   
    editorWindow.setMenu(null);
    // editorWindow.webContents.send("slider","efwu");
    // // var tmpdata = [...data.map(x=>transpose(x))]
    // editorWindow.once("ready-to-show",function(){
    //     editorWindow.webContents.send("slider","ufgew");
    // });
    //     editorWindow.once("did-finish-load",function(){
    //     editorWindow.webContents.send("slider","uffwefegew");
    // })
    editorWindow.show();
    editorWindow.webContents.once("dom-ready",function(){
        editorWindow.webContents.send("slider",[sl.min,sl.max,sl.step,tex,col.x,data]);
    })

    // editorWindow.once("ready-to-show",function(){
    //     editorWindow.webContents.send("slider","ufgew");
    // });
}




function openViewer(x){
    serve=1;
    var target = "3D_Viewer_Lines.html"
    if(x) target = "3D_Viewer_Surface.html"

    viewerWindow = new BrowserWindow({show:false,minWidth:1200});
    viewerWindow.maximize();
    viewerWindow.loadURL(url.format({
        pathname: path.join(__dirname, target),
        protocol: 'file:',
        slashes:true
    }));
    viewerWindow.on("closed",function(){delete viewer[target]})
    // const falseMenu = Menu.buildFromTemplate(falseMenuTemplate);
    viewerWindow.setMenu(null);
    viewerWindow.show();
    viewer[target] = viewerWindow;
    viewerWindow.webContents.once("dom-ready",function(){
        updateOnServer()
    })
};


function expRotate(tmpData){
    tmpData = tmpData.map(x => transpose(x));
    var issame=true, b=tmpData[0].length;
    for (let a of tmpData){
        if(a.length!=b){
            issame = false; break;
        };
    }; 
    
    tmpData = transpose(tmpData);

    if(issame){
        tmpData = tmpData.map(x => transpose(x));
        return tmpData;
    };


    tmpData = [].concat(...tmpData).filter(Boolean);

    var tmp = new Set();
    for(let a of tmpData){
        tmp.add(a[col.x]);
    };
    tmp = [...tmp].sort((a, b) => a - b);
    var newdat =[];
    for (let x of tmp){
        var tmpdat =[];
        for (let line of tmpData){
                if (x==line[col.x]){
                    tmpdat.push(line)
                };
        };
        tmpdat = tmpdat.sort((m,n) => m[col.y] - n[col.y]);
        newdat.push(transpose(tmpdat));
    };
    return newdat;
};



function rotateData(){
    if (!data.length) return;
    data = expRotate(data);
    if (!compdata.length) return ;
    compdata = expRotate(compdata);
};



function hotKeys(e){
    if (document.activeElement.type == "text"){
        return false;
    };
    switch (e.key){
        case " " :
            Plotly.relayout( figurecontainer, {
                "xaxis.autorange": true,
                "yaxis.autorange": true
            });
            break;
        case ",":
            slider.stepDown();
            sliderChanged();
            break;
        case ".":
            slider.stepUp();
            sliderChanged();
            break;
        case "s":
            if(e.ctrlKey){
                saveData();
            } else {
                Plotly.relayout(figurecontainer, {dragmode:"select"});
            }
            break;
        case "S":
            if(e.ctrlKey){
                saveAs();
            }
            break;
        case "z":
            if (e.ctrlKey) {
                e.preventDefault();
                unDo();
            } else {
                Plotly.relayout(figurecontainer, {dragmode:"zoom"});
            };
            break;
        case "c":
            changeSign();
            break;
        case "d":
            deleteInterpolate();
            break;
        case "m":
            autoSmooth();
            break;
        case "1": case "2": case "3": 
            if (e.ctrlKey){
                e.preventDefault();
                repeatData(e.keyCode);
            };
            break;
        case "ArrowLeft": case "ArrowRight":
            if (e.ctrlKey | e.shiftKey){
                moveReflect(e.keyCode-37, e.shiftKey)
            };
    };
};




function transpose(m) {

    return m[0].map((_,i) => m.map(x => x[i]));
};



function lockX(mark){

    lockXc = mark.checked ? 1 : 0;
};



function checkFst() {
    if (!data.length){
        alert("First load the data you want to edit using the first file chooser !");
        return false;
    };
    return true;
};



function incRefData(mark){
    if(mark.checked){
        refdat = 1;
        updatePlot(1);
    } else {
        refdat = 0;
        Plotly.deleteTraces(figurecontainer,1);
    };
};



function sliderChanged() {
    th_in = slider.value;
    xVal.innerHTML= data[th_in][col.x][0];
    myDiv.innerHTML=xName+" value updated";
    updatePlot(1);
};



function colChanged(value) {
    myDiv.innerHTML = "Data column Changed.";
    col.z    = value;
    updatePlot(1);
    updateOnServer();
};



function yrangeChanged() {
    var lim=this.value;
    if (lim == ""){
        Plotly.relayout(figurecontainer, {"yaxis.autorange": true});
    } else {
        lim=this.value.split(",");
        lim=lim.map( x => parseFloat(x));
        if (isNaN(lim[0])) {
            lim[0] = Math.min( ...dpsy);
        } else if (isNaN(lim[1])) {
            lim[1] = Math.max( ...dpsy);
        };
        Plotly.relayout(figurecontainer, {"yaxis.range" : lim});
    }; 
};





function saveOldData(){
    olddata = JSON.stringify([
        th_in, col.z, data[th_in][col.y],data[th_in][col.z]
        ]);
};



function unDo() {
    if(!ma) ma=1;
    var [th, dc, arrX, arrY] = JSON.parse(olddata);
    if ((th != th_in) || (dc != col.z)) return false;
    saveOldData();
    data[th_in][col.y] = arrX;
    data[th_in][col.z] = arrY;
    updatePlot();
    updateOnServer();
};



function updateOnServer() {
    if (!serve) return;
    var x_list=[], y_list=[] , z_list=[];
    for (let i of data) {
        x_list.push(i[col.x]);
        y_list.push(i[col.y]); 
        z_list.push(i[col.z]);
    };
    var s_data = [x_list, y_list, z_list];
    for (let w in viewer) viewer[w].webContents.send("sdata",s_data);
    // viewerWindow.webContents.send("sdata",s_data);
    // localStorage.setItem("datal",JSON.stringify(s_data));
};


function getNaturalKs (xs, ys) {
    var ks = new Array(xs.length).fill(0);
    var n = xs.length-1;
    var A=[];
    for(var i=0; i<n+1; i++){
        A.push(new Array(n+2).fill(0));
    };

    for(var i=1; i<n; i++) {
        A[i][i-1] = 1/(xs[i] - xs[i-1]);
        A[i][i] = 2 * (1/(xs[i] - xs[i-1]) + 1/(xs[i+1] - xs[i])) ;
        A[i][i+1] = 1/(xs[i+1] - xs[i]);
        A[i][n+1] = 3*( (ys[i]-ys[i-1])/((xs[i]-xs[i-1])*(xs[i]-xs[i-1])) + (ys[i+1]-ys[i])/((xs[i+1]-xs[i])*(xs[i+1]-xs[i])));
    };

    A[0][0] = 2/(xs[1] - xs[0]);
    A[0][1] = 1/(xs[1] - xs[0]);
    A[0][n+1] = 3 * (ys[1] - ys[0]) / ((xs[1]-xs[0])*(xs[1]-xs[0]));

    A[n][n-1] = 1/(xs[n] - xs[n-1]);
    A[n][n] = 2/(xs[n] - xs[n-1]);
    A[n][n+1] = 3 * (ys[n] - ys[n-1]) / ((xs[n]-xs[n-1])*(xs[n]-xs[n-1]));
  
    return solve(A, ks);
};



function solve (A, ks) {
    var m = A.length;
    for(var k=0; k<m; k++) {
        // pivot for column
        var i_max = 0;
        var vali = Number.NEGATIVE_INFINITY;
        for(var i=k; i<m; i++) {
            if(A[i][k]>vali) {
                i_max = i;
                vali = A[i][k];
            };
        };
        //swap rows
        var p   = A[k];
        A[k]    = A[i_max];
        A[i_max]= p;

        // for all rows below pivot
        for(var i=k+1; i<m; i++) {
            for(var j=k+1; j<m+1; j++) {
                A[i][j] = A[i][j] - A[k][j] * (A[i][k] / A[k][k]);
                A[i][k] = 0;
            };
        };
    };
    for(var i=m-1; i>=0; i--) {
        var v = A[i][m]/A[i][i];
        ks[i] = v;
        for(var j=i-1; j>=0; j--) {
            A[j][m] -= A[j][i] * v;
            A[j][i] = 0;
        };
    };
    return ks;
};


function autoSmooth() {
    if(ma){saveOldData();ma=0;}
    if(!index.length)return;
    for(let i of index)
        { 
            dpsy[i] = (dpsy[i-1]+dpsy[i]+dpsy[i+1])/3.0
        };
    data[th_in][col.z] = dpsy;
    Plotly.restyle(figurecontainer,{"y":[dpsy]});
}


function selectEvent(event){
    index=[]; del_dat = [];
    if (event==undefined){
        Plotly.restyle(figurecontainer, {selectedpoints: [null]});
        ma=1;
    } else {
        for (let pt of event.points){
            ind = dpsx.findIndex(n => n==pt.x);
            if (dpsy[ind]==pt.y){
                index.push(ind);
                del_dat.push(pt.x);
        };
    };
    del_dat = [... new Set(del_dat)];
    index = [... new Set(index)];
    };
};



function moveReflect(key, mod){
    saveOldData();
    var ind = index[index.length-1]+1;
    var tmp = dpsy.slice(index[0], ind);
    if(!key) ind=index[0]-index.length;
    if(mod) tmp.reverse();
    dpsy.splice(ind, tmp.length, ...tmp);
    updatePlot();
    updateOnServer();
    index=[]; del_dat = [];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
};


function repeatData(p) {
    saveOldData();
    var bar = (dpsx.length-1)/3;
    if(index.length){
        for (let i of index){
            dpsy[(i+bar)%360] = dpsy[(bar*2+i)%360] = dpsy[i];
        };
    } else {
        p =p-49;
        var tmp = dpsy.slice(bar*p,bar*(p+1)+1);
        for (let i of [0,bar,bar*2]){
            dpsy.splice(i, tmp.length, ...tmp);
        };   
    };
    updatePlot();
    updateOnServer();
    index=[]; del_dat = [];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
};



function deleteInterpolate(){
    if(!index.length) return;
    var xs=dpsx.slice();
    var ys=dpsy.slice();
    for (let dat of del_dat) {
        ind = xs.findIndex(n => n==dat);
        xs.splice(ind,1);
        ys.splice(ind,1);
    };
    ks = getNaturalKs(xs, ys);
    function spline(x) {
        var i = 1;
        while(xs[i]<x) i++;
        var t = (x - xs[i-1]) / (xs[i] - xs[i-1]);
        var a =  ks[i-1]*(xs[i]-xs[i-1]) - (ys[i]-ys[i-1]);
        var b = -ks[i]*(xs[i]-xs[i-1]) + (ys[i]-ys[i-1]);
        var q = (1-t)*ys[i-1] + t*ys[i] + t*(1-t)*(a*(1-t)+b*t);
        return q;
    };
    saveOldData();
    for (let ind of index){
        data[th_in][col.z][ind] = spline(data[th_in][col.y][ind]);
    };
    updatePlot();
    updateOnServer();
    index=[]; del_dat = [];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
    myDiv.innerHTML="Selected data points interpolated."
};



function changeSign(){
    saveOldData();
    for (let ind of index){
        data[th_in][col.z][ind] *= -1;
    };
    updatePlot();
    updateOnServer();
    index=[]; del_dat = [];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
    myDiv.innerHTML= "Sign changed for selected data points.";
};



function updateFigure() {
    var y = [], x = [];
    if (lockXc){
        for (let i of points) {
            y.push(i.handle.y);
        };
        Plotly.restyle(figurecontainer, {"y": [y]}, 0);
        dpsy = data[th_in][col.z] = y;
    } else {
        for (let i of points) {
            x.push(i.handle.x);
            y.push(i.handle.y);
        };
        Plotly.restyle(figurecontainer, {"x": [x], "y": [y]}, 0);
        dpsy = data[th_in][col.z] = y;
        dpsx = data[th_in][col.y] = x;
    };
};



function clamp(x, lower, upper) {

    return Math.max(lower, Math.min(x, upper));
};


var oldX,oldCord,innd;
function startDragBehavior() {
    var d3 = Plotly.d3;
    var drag = d3.behavior.drag();
    drag.origin(function() {
        saveOldData();
        var transform = d3.select(this).attr("transform");
        var translate = transform.substring(10, transform.length-1).split(/,| /);
        if(index.length){
            [_,_,oldX,oldCord] = JSON.parse(olddata);
            indd = oldX.indexOf(this.handle.x);  
        };
        return {x: translate[0], y: translate[1]};
    });
    drag.on("drag", function() {
        var xmouse = d3.event.x, ymouse = d3.event.y;
        d3.select(this).attr("transform", "translate(" + [xmouse, ymouse] + ")");
        var handle = this.handle;
        var yaxis = figurecontainer._fullLayout.yaxis;
        handle.y = clamp(yaxis.p2l(ymouse), yaxis.range[0], yaxis.range[1]);
        if(index.length){
            var moved = handle.y - oldCord[indd];
            for (let ind of index){
                points[ind].handle.y =moved+oldCord[ind];
            };
        };
        if (!lockXc){
            var xaxis = figurecontainer._fullLayout.xaxis;
            handle.x = clamp(xaxis.p2l(xmouse), xaxis.range[0], xaxis.range[1]);
                if(index.length){
                    var moved = handle.x - oldX[indd];
                    for (let ind of index){
                        points[ind].handle.x =moved+oldX[ind];
                    };
                };
        };
        updateFigure();
    });
    drag.on("dragend", function() {
        updateFigure();
        updateOnServer();
        d3.select(".scatterlayer .trace:first-of-type .points path:first-of-type").call(drag);
    });
    d3.selectAll(".scatterlayer .trace:first-of-type .points path").call(drag);
};



function updatePlot(both=0) {
    dpsy   = data[th_in][col.z];
    dpsx   = data[th_in][col.y];

    if (both && refdat && compdata.length){
        if (figurecontainer.data.length==1){
            Plotly.addTraces(figurecontainer, iniPointsC);
        };
        Plotly.restyle(figurecontainer, {"x": [dpsx, compdata[th_in][col.y]],
            "y": [dpsy, compdata[th_in][col.z]]});
    } else {
        Plotly.restyle(figurecontainer, {"x": [dpsx], "y": [dpsy]}, 0);
    };
    for (var i=0; i<dpsx.length; i++) {
        points[i].handle = {x:dpsx[i], y:dpsy[i] };
    };
};
