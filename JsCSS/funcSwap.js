const fs = require("fs");        
const { remote, ipcRenderer } = require('electron');
const path = require('path');
const {dialog, BrowserWindow,Menu} = remote;
const url = require('url');
var editorWindow;

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

    editorWindow.show();
    editorWindow.webContents.once("dom-ready",function(){
        editorWindow.webContents.send("slider",[sl.min,sl.max,sl.step,tex,col.x,data]);
    })


}






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
        case "q":
            swapData();
            break;
    };

};




function transpose(m) {
    return m[0].map((_,i) => m.map(x => x[i]));
};







function checkFst() {
    if (!data.length){
        alert("First load the data you want to edit using the first file chooser !");
        return false;
    };
    return true;
};







function sliderChanged() {
    th_in = slider.value;
    xVal.innerHTML= data[th_in][col.x][0];
    myDiv.innerHTML=xName+" value updated";
    updatePlot(1);
};











function saveOldData(){
    olddata = JSON.stringify([
        th_in, col.z1,col.z2, data[th_in][col.y],data[th_in][col.z1], data[th_in][col.z2]
        ]);
};



function unDo() {
    if(!ma) ma=1;
    var [th, y1,y2, arrX, arrY1, arrY2] = JSON.parse(olddata);
    if ((th != th_in) || (y1 != col.z1) || (y2!=col.z2)) return false;
    saveOldData();
    data[th_in][col.y] = arrX;
    data[th_in][col.z1] = arrY1;
    data[th_in][col.z2] = arrY2;
    updatePlot();
};






        function col1Changed(value){
            col.z1    = value;
            updatePlot();

        };

        function col2Changed(value){
            col.z2    = value;
            updatePlot();

        };



function selectEvent(event){
    index=[]; del_dat = [];
    if (event==undefined){
        Plotly.restyle(figurecontainer, {selectedpoints: [null]});
    } else {
        for (let pt of event.points){
            ind = dpsx.findIndex(n => n==pt.x);

            index.push(ind);
    };
    index = [... new Set(index)];
    };
};




        function updatePlot(){
            dpsy1   = data[th_in][col.z1];
            dpsy2   = data[th_in][col.z2];
            dpsx   = data[th_in][col.y];

            Plotly.restyle(figurecontainer, {"x": [dpsx, dpsx], "y": [dpsy1, dpsy2 ]});
        };



        function swapData(){
            if(!index.length) return;
            saveOldData();
            for (let ind of index){
                [data[th_in][col.z1][ind], data[th_in][col.z2][ind]]= [data[th_in][col.z2][ind], data[th_in][col.z1][ind]]
            }
            updatePlot();
        }



        function isswap(key){
            swapped = key.selectedIndex;
            var [n1,n2] = ["Y","X"];
            if (swapped) [n1,n2] =[n2,n1];
            xName = n2;
            $("header, p, #dummy2").html((_,html) => html.replace(n1,n2));
            [xCol, yCol] = [yCol, xCol];
            [col.x, col.y]= [col.y,col.x];
            rotateData();
            updateData();
        };




