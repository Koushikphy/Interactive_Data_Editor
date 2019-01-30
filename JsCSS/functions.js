const fs = require("fs");
const path = require('path');
const req = require("request");
const url = require('url');        
const {remote, ipcRenderer, shell } = require('electron');
const {dialog, BrowserWindow, Menu, MenuItem} = remote;

var editorWindow,viewer=[,,],recentLocation = '',recentFiles = [];
var home = process.env.HOME || process.env.USERPROFILE;



function versionCheck(){
    var today = new Date()
    var today = today.getDate() +''+ today.getMonth()
    if(today == JSON.parse(localStorage.getItem("today"))) return
    localStorage.setItem("today",JSON.stringify(today))
    req({
        'url':"https://api.github.com/repos/Koushikphy/Interactive-Data-Editor/tags",
        'headers':{'User-Agent' : 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36});'}}, 
        function (err, resp, body) {
            var new_ver =JSON.parse(body)[0].name
            console.log(new_ver)
            if(new_ver!="v2.1.0"){
                var txt = `A new version of the software ${new_ver} is available.\n Do you wnat to downlod it now?`
                var res = dialog.showMessageBox({type:"question",title:"Update available!!!", message:txt,buttons:['OK', "Cancel"]})
                if(!res){shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor/releases")}
            }
    })
};


function showStatus(msg){
    $("#status").html(msg);
    $("#status").delay("medium").fadeIn()
    $("#status").delay(3000).fadeOut()

}


function recentMenu(){
    var rrf = menu.getMenuItemById("rf").submenu;
    rrf.clear()
    for(let i=recentFiles.length-1; i>=0; i-- ){
        var fln = recentFiles[i].slice();
        if(fln.includes(home)){fln =  fln.replace(home,"~")}
        var item = {
            label : fln,
            click(){
                ipcRenderer.send("rf",recentFiles[i]);
            }
        };
        rrf.append(new MenuItem(item));
    }
    localStorage.setItem("files",JSON.stringify(recentFiles));
};



function updateData() {
    col.x = xCol.selectedIndex;
    col.y = yCol.selectedIndex;
    col.z = zCol.selectedIndex;
    th_in= 0;
    if (ddd){ //3D
        $slider.slider({max:  data.length-1, value:0  })
        $ch.text(xName+'='+ data[0][col.x][0])

    } else {    //2D
        col.z = col.y;
        col.y = col.x;
        col.x =0
    };
    updatePlot(1);
    startDragBehavior();
    updateOnServer();
    if(!swapped){
        if(ddd){
            localStorage.setItem("cols3d",JSON.stringify(col));
        } else {
            var tmp={x:col.y,y:col.z,z:0,s:0}
            localStorage.setItem("cols2d",JSON.stringify(tmp));
        }
    }
    var tmpl = []
    for (let i of data) {
        tmpl.push(i[col.x][0].toString().length);
    }
    $ch.width(Math.floor((Math.max(...tmpl)/2)+2)*em2px);
};




function thisJobs() {
    $("#particle").remove()
    $("#full").show()
    xCol            =document.getElementById("xCol");
    yCol            =document.getElementById("yCol");
    if(ddd){//3
        $(".3D").show()
        var fl = JSON.parse(localStorage.getItem("cols3d"));
        if (fl!==null){
            col = fl;
        }

        var mn = ["pa",'wire','surf']
        for (let i of mn){
            menu.getMenuItemById(i).enabled = true;
        }

    }else{             //2d
        serve = 0;
        $(".3D").hide()
        var fl = JSON.parse(localStorage.getItem("cols2d"));
        if (fl!==null){
            col = fl;
        }
        var mn = ["pa",'wire','surf']
        for (let i of mn){
            menu.getMenuItemById(i).enabled = false;
        }
    }

    var op = "";
    for (var i = 1; i <= data[0].length; i++) {
        op += '<option>' + i + '</option>';
    };
    var tmp = $("#xCol, #yCol, #zCol, #sCol");
    for (var i = 0; i < tmp.length; i++) {
        tmp[i].innerHTML = op;
    };
    resizePlot();
    xCol.selectedIndex=col.x;
    yCol.selectedIndex=col.y;
    zCol.selectedIndex=col.z;
    sCol.selectedIndex=col.s;
    updateData();
};



function fileLoader(){
    const fname = dialog.showOpenDialog({defaultPath:recentLocation, properties: ['openFile']})[0];
    fileReader(fname);
}



function fileReader(fname){
    swapped = 0;refdat = 0;xName = "X";
    var dirname = path.dirname(fname);
    var filename = path.basename(fname, path.extname(fname))
    var extn = path.extname(fname)
    save_name =path.join(dirname, filename + "_new" +extn);
    recentLocation = dirname;
    localStorage.setItem("recent",JSON.stringify(recentLocation));
    data = fs.readFileSync(fname,"utf8");
    data = parseData(data);
    ddd = data.length!=1;
    thisJobs();
    showStatus('Data loaded ...')

    document.title = "Interactive Data Editor - "+fname;



    recentFiles = recentFiles.filter(x=>x!=fname);
    recentFiles.push(fname);
    if(recentFiles.length>10){
        recentFiles.splice(0,1);
    }
    recentMenu();


    menu.getMenuItemById("pax").checked = false;
    menu.getMenuItemById("pay").checked = true;
    menu.getMenuItemById("compf").visible = false;
    menu.getMenuItemById("swapen").visible = true;
    menu.getMenuItemById("swapex").visible = false;
    $("#sCol").hide();
    swapper = false;
    if(figurecontainer.data.length==2) Plotly.deleteTraces(figurecontainer,1);
    Plotly.relayout(figurecontainer, {selectdirection: 'any'});

    var mn = ['save', 'saveas', 'cs', 'ma', 'cg', 'un', "spr",'openc','pamh', 'swapen',"edat","fill","filter"]
    if(ddd) mn.push("pa",'wire','surf')
    for (let i of mn){
        menu.getMenuItemById(i).enabled = true;
    }

}



function compfileLoader(){
    refdat = 1;
    const fname = dialog.showOpenDialog({defaultPath:recentLocation,properties: ['openFile']})[0];
    var filename = path.basename(fname);

    compdata = fs.readFileSync(fname,"utf8");
    compdata = parseData(compdata);
    showStatus('Data for comparison loaded ...');
    updatePlot(1);
    menu.getMenuItemById("compf").visible = true;
}


function transpose(m) {

    return m[0].map((_,i) => m.map(x => x[i]));
};


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



function expRotate(tmpData){
    tmpData = tmpData.map(x => transpose(x));
    var issame=true, b=tmpData[0].length;
    for (let a of tmpData){
        if(a.length!=b){
            issame = false; break;
        };
    }; 
    
    

    if(issame){
        tmpData = transpose(tmpData);
        tmpData = tmpData.map(x => transpose(x));
        return tmpData;
    };


    tmpData = [].concat(...tmpData).filter(x=>x!==undefined);

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
    showStatus("Data Saved as " + path.basename(save_name)+" on "+new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric',second:'numeric', hour12: true }))
};


ipcRenderer.on("rf",function(e,d){
    fileReader(d);
})


ipcRenderer.on("back",function(e,d){
    data = d.map(x=>transpose(x))
    updatePlot(1);
    startDragBehavior();
    updateOnServer();
})


ipcRenderer.on("menuTrigger",function(e,d){
    switch(d){
        case "open":
            fileLoader();
            break;
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
        case "wire":
            openViewer(0);
            break;
        case "surface":
            openViewer(1);
            break;
        case "spread":
            editor();
            break;

        case "openc":
            compfileLoader();
            break;

        case "compf":
            incRefData();
            break;

        case "pa":
            isswap();
            break;
        case "pamh":
            lockXc = menu.getMenuItemById("pamh").checked ? 1 : 0;
            break;
        case "fullscreen":
            resizePlot();
            break;

        case 'swapen':
            initSwapper();
            break;

        case 'swapex':
            delSwapper();
            break;

        case "edat":
            $("#extend").slideDown();
            $("#einp").val(dpsx[dpsx.length-1]);
            break;
        case 'fill':
            $("#filler").slideDown();
            break;
        case 'filter':
            $('#filter').slideDown();
            break;
    }
});






function hotKeys(e){
    if (document.activeElement.type == "text"){
        return;
    };
    switch (e.key){
        case " " :
            Plotly.relayout( figurecontainer, {
                "xaxis.autorange": true,
                "yaxis.autorange": true
            });
            break;
        case ",":
            if(th_in==0) break;
            th_in = th_in-1
            $slider.slider("value",th_in)
            sliderChanged();
            break;
        case ".":
            if(th_in==data.length-1) break;
            th_in = th_in+1
            $slider.slider("value",th_in)
            sliderChanged();
            break;
        case "s":
            if(!e.ctrlKey){
                Plotly.relayout(figurecontainer, {dragmode:"select"});
            }
            break;

        case "z":
            if (!e.ctrlKey) {
                Plotly.relayout(figurecontainer, {dragmode:"zoom"});
            };
            break;
        case "p":
            swapData();
            break;
    };
};



function editor(){
    var min = $slider.slider("option","min"),
        max = $slider.slider("option","max"),
        step= $slider.slider("option","step");

    editorWindow = new BrowserWindow({minWidth:1200,show:false});
    editorWindow.maximize();
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, "handtable.html"),
        protocol: 'file:',
        slashes:true
    }));   
    editorWindow.setMenu(null);

    editorWindow.show();
    editorWindow.webContents.once("dom-ready",function(){
        editorWindow.webContents.send("slider",[min,max,step,xName,col.x,data]);
    })
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


    viewerWindow.show();
    viewerWindow.setMenu(null);
    viewer[target] = viewerWindow;
    // viewerWindow.webContents.openDevTools();
    viewerWindow.webContents.once("dom-ready",function(){
        updateOnServer()
    })
};



function incRefData(){
    var mark = menu.getMenuItemById("compf").checked;
    if(mark){
        refdat = 1;
        updatePlot(1);
    } else {
        refdat = 0;
        Plotly.deleteTraces(figurecontainer,1);
    };
};



function isswap(){
    swapped = menu.getMenuItemById("pax").checked;
    var [n1,n2] = ["Y","X"];
    if (swapped) [n1,n2] =[n2,n1];
    xName = n2;
    [xCol, yCol] = [yCol, xCol];
    [col.x, col.y]= [col.y,col.x];
    rotateData();
    updateData();
    th_in = 0;
    $slider.slider("value",0);
    $ch.text(xName+': '+ data[th_in][col.x][0]);
    $("#drag").html((_,html) => html.replace(n1,n2));
};


function sliderChanged() {
    $ch.text(xName+'='+ data[th_in][col.x][0])
    updatePlot(1);
    startDragBehavior();
};



function colsChanged(value){
    col.s    = value;
    updatePlot();
};



function colChanged(value) {
    col.z    = value;
    updatePlot(1);
    updateOnServer();
    startDragBehavior();
    if(!swapped) localStorage.setItem("cols3d",JSON.stringify(col));
};



function resizePlot(){
    var height = window.innerHeight -document.getElementById("header").offsetTop-document.getElementById("figurecontainer").offsetTop ;
    $("#figurecontainer").height(height-2);

    Plotly.relayout(figurecontainer, {autosize:true});
}



function initSwapper(){
    $("#sCol").show()
    refdat = 0; swapper = true;
    if(figurecontainer.data.length==2) Plotly.deleteTraces(figurecontainer,1);
    Plotly.addTraces(figurecontainer, iniPointsC);
    col.s = sCol.selectedIndex;
    Plotly.relayout(figurecontainer, {selectdirection: 'h'});
    updatePlot();
    menu.getMenuItemById("swapen").visible = false;
    menu.getMenuItemById("swapex").visible = true;
}



function delSwapper(){
    $("#sCol").hide();
    swapper = false;
    if(figurecontainer.data.length==2) Plotly.deleteTraces(figurecontainer,1);
    Plotly.relayout(figurecontainer, {selectdirection: 'any'});
    updatePlot();
    menu.getMenuItemById("swapen").visible = true;
    menu.getMenuItemById("swapex").visible = false;
}



function swapData(){
    if(!index.length) return;
    saveOldData();
    for (let ind of index){
        [data[th_in][col.z][ind], data[th_in][col.s][ind]]= [data[th_in][col.s][ind], data[th_in][col.z][ind]]
    }
    updatePlot();
}




function repeatMirror(){
    var last   = parseFloat($("#einp").val());
    var times  = parseFloat($("#etime").val());
    var mirror = $("#repSel")[0].selectedIndex;


    var cols_wo_y = []
    var tmp = data[0].length

    for (let i=0; i<tmp; i++){
        if(i!=col.y) cols_wo_y.push(i)
    }
    data = data.map(dat=>{

        var ind  = dat[col.y].indexOf(last)+1
        if(!ind) alert("Endpoint must exist !!!")
        var newy = dat[col.y].slice(0,ind)
        var tmp  = newy.slice()
        tmp.splice(0,1)

        for(let time=0; time<times-1; time++){
            for(let i=0; i<tmp.length;i++){
                newy.push(tmp[i]+last*(1+time));
            }
        }

        for(let i of cols_wo_y){
            var new_dat = dat[i].slice(0,ind)
            var tmp = new_dat.slice()
            for(let time=0; time<times-1; time++){
                if(mirror){
                    ptmp = tmp.reverse().slice()
                } else{
                    ptmp = tmp.slice()
                }
                ptmp.splice(0,1)
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
    showStatus(`Data ${tmp} ${times} times...`)
    updateOnServer();
}



function dataFiller(){
    var start = parseFloat($("#fstart").val());
    var stop  = parseFloat($("#fend").val());
    var step  = parseFloat($("#fstep").val());
    var cols_wo_y = []
    var tmp = data[0].length

    for (let i=0; i<tmp; i++){
        if(i!=col.y) cols_wo_y.push(i)
    }

    var fullArr = []
    for (let i=start; i<=stop; i=i+step){
        fullArr.push(i)
    }

    data = data.map(dat=>{
        if(fullArr.length==dat[0].length) return dat;
        var xs = dat[col.y].slice()
        var lInd = dat[col.y].length - 1;
        for(let tc of cols_wo_y){
            newArr = [];
            var ys = dat[tc].slice()
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

            for(let val of fullArr){
                ind = dat[col.y].indexOf(val)
                if(ind!=-1){
                    newArr.push(dat[tc][ind])
                } else{
                    if(val<=dat[col.y][0]){
                        newArr.push(dat[tc][0])
                    } else if(val>=dat[col.y][lInd]){
                        newArr.push(dat[tc][lInd])
                    }else{
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
    showStatus('Missing values are filled...')
    updateOnServer();
}



function filterData(){
    var condition = $("#flSel")[0].selectedIndex;
    var thrsh =  parseFloat($("#flc").val());
    var fillVal = parseFloat($("#flf").val());
    var colmn = $("#flcl").val().split(',').map(x=>parseFloat(x)-1);

    if(condition==0){
        data = data.map(dat =>{
            for (let tc of colmn){
                dat[tc] = dat[tc].map(x=>{
                    if(x<thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })
    }else if(condition==1){
        data = data.map(dat =>{
            for (let tc of colmn){
                dat[tc] = dat[tc].map(x=>{
                    if(x>thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })
    } else if(condition==2){
        data = data.map(dat =>{
            for (let tc of colmn){
                dat[tc] = dat[tc].map(x=>{
                    if(x==thrsh) return fillVal;
                    return x;
                })
            }
            return dat;
        })

    }
    $("#filter").slideUp();
    updatePlot();
    showStatus('Data filtered...')
    updateOnServer();
}



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



function deleteInterpolate(){
    if(!index.length) return;
    var xs=dpsx.slice();
    var ys=dpsy.slice();
    //check for endpoints
    if(index[0]==0) index.splice(0,1)
    if(index[index.length-1] == dpsx.length-1) index.splice(-1,1)
    for (var i = index.length - 1; i >= 0; i--) {
        xs.splice(index[i],1);
        ys.splice(index[i],1);
    }
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
    index=[];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
};



function autoSmooth() {
    if(ma){saveOldData();ma=0;}
    if(!index.length)return;
    for(let i of index)
        { 
            dpsy[i] = (dpsy[i-1]+dpsy[i]+dpsy[i+1])/3.0
        };
    data[th_in][col.z] = dpsy;
    updatePlot();
};



function changeSign(){
    console.log("chaning");
    saveOldData();
    for (let ind of index){
        data[th_in][col.z][ind] *= -1;
    };
    updatePlot();
    updateOnServer();
    index=[];
    Plotly.restyle(figurecontainer, {selectedpoints: [null]});
};



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
        };
    };
    index = [... new Set(index)];
    };
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



function saveOldData(){
    if(!data.length) return;
    if(swapper){
        olddata = JSON.stringify([th_in, col.z,col.s, data[th_in][col.y],data[th_in][col.z], data[th_in][col.s]]);
        return;
    }
    olddata = JSON.stringify([ th_in, col.z, data[th_in][col.y],data[th_in][col.z]]);
};



function unDo() {
    if(!ma) ma=1;
    if(swapper){
        var [th, y1,y2, arrX, arrY1, arrY2] = JSON.parse(olddata);
        if ((th != th_in) || (y1 != col.z) || (y2!=col.s)) return false;
        saveOldData();
        data[th_in][col.y] = arrX;
        data[th_in][col.z] = arrY1;
        data[th_in][col.s] = arrY2;
        updatePlot();
        updateOnServer();
        return
    }
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


function updatePlot(both=0) {
    dpsy   = data[th_in][col.z];
    dpsx   = data[th_in][col.y];

    if(swapper){
        dpsy2   = data[th_in][col.s];
        Plotly.restyle(figurecontainer, {"x": [dpsx, dpsx], "y": [dpsy, dpsy2 ]});
    } else if (both && refdat && compdata.length){
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
