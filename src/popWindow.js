const popupbox = document.getElementById('popupbox')

function buildDOM(){
    var txt =''// `<label class='heading'>List of Plots</label>`
    for(let i=0; i<fileNames.length; i++){
        let fileName = fileNames[i]
        let shortName = path.basename(fileName)
        fileName = replaceWithHome(fileName)
 
        //making custom button for the currently editable
        // for simlicity lets just make the currenteditable trace undeletable
        let buttomTxt = currentEditable != i ?
            `<button class="clsBtn" onclick="tools(2,${i})" title='Remove this file'>`:
            `<button class="clsBtnD" title='Can not remove currently editing plot' disabled>`

        let checked = currentEditable==i? 'checked':''

        // col label, x,y is uneditable for simplicity just now, maybe added later
        let colLen=fullData[i][0].length
        let colLabel = `<label>${ddd ? fullDataCols[i].x+1+':' : '' }${fullDataCols[i].y+1}:</label>`
        colLabel += `<select onchange="updatePlotPop(${i},this.selectedIndex)" title='Change data column'>`
        for(let j=0; j<colLen; j++){
            let sell = fullDataCols[i].z==j ? 'selected' : ''
            colLabel += `<option ${sell}>${j+1}</option>`
        }
        colLabel+='</select>'

        txt += 
        `<div class="row">
            <label class="index">${i+1}.</label>
            <label class="filename" title='${fileName}'>${shortName}</label>

            <div class="tools">
                <input  class='radio' type="radio" onclick="tools(0,${i})" title='Select this as editable' ${checked}>
                <button class="copyBtn" onclick="tools(1,${i})" title='Use this file'>
                    <svg viewBox="0 0 1792 1792">
                        <path d="M1664 1632v-1088q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h1088q13 0 22.5-9.5t9.5-22.5zm128-1088v1088q0 66-47 113t-113 47h-1088q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113zm-384-384v160h-128v-160q0-13-9.5-22.5t-22.5-9.5h-1088q-13 0-22.5 9.5t-9.5 22.5v1088q0 13 9.5 22.5t22.5 9.5h160v128h-160q-66 0-113-47t-47-113v-1088q0-66 47-113t113-47h1088q66 0 113 47t47 113z"/>
                    </svg>
                    </button>
                ${buttomTxt}
                    <svg viewBox="0 0 1792 1792">
                        <path d="M1490 1322q0 40-28 68l-136 136q-28 28-68 28t-68-28l-294-294-294 294q-28 28-68 28t-68-28l-136-136q-28-28-28-68t28-68l294-294-294-294q-28-28-28-68t28-68l136-136q28-28 68-28t68 28l294 294 294-294q28-28 68-28t68 28l136 136q28 28 28 68t-28 68l-294 294 294 294q28 28 28 68z"/>
                    </svg>
                </button>
            </div>
            <div class="popSelector">
                ${colLabel}
            </div>
        </div><br>`
    }
    txt+='<br>'
    popMain.innerHTML = txt 
}


function tools(option,index){
    if(option==0){ //select editable
        if(currentEditable!=index) changeEditable(index)
    }else if (option==1) { // clone this
        fullData.push(fullData[index]); //not cloning same file
        fullDataCols.push(clone(fullDataCols[index]))
        fileNames.push(fileNames[index])
        saveNames.push(saveNames[index])
        legendNames.push(clone(legendNames[index]))
        addTrace()
    }else if(option==2) { // close this
        if(fileNames.length==1) return // nothing to delete here
        // console.log(currentEditable, index )
        if(index <=currentEditable) {
            changeEditable(currentEditable-1, false) // currentEditable is changed within the function
        }
        Plotly.deleteTraces(figurecontainer,index)
        fullData.splice(index,1)
        fullDataCols.splice(index,1)
        fileNames.splice(index,1)
        saveNames.splice(index,1)
        legendNames.splice(index,1)
    }
    buildDOM()
}


function updatePlotPop(index, cl){
    fullDataCols[index].z = cl
    legendNames[index] =path.basename(fileNames[index]) + ` ${fullDataCols[index].y+1}:${fullDataCols[index].z+1}`
    Plotly.restyle(figurecontainer, {
        y:[fullData[index][th_in][fullDataCols[index].z]],
        name : [legendNames[index]]
    }, index)

    if(index==currentEditable){
        col.z = cl
        dpsy = data[th_in][col.z];
    }
    zCol.selectedIndex = col.z 
}



function plotListPop(){
     buildDOM()
    titletxt.innerHTML = 'List of Plots'
    pop.style.width = '50%'
    popMain.style.textAlign = 'center'
    openPop()
}



function settingWindow(){
    let settingEditWindow = new BrowserWindow({
        minHeight: 700,
        minWidth:600,
        title: "Interactive Data Editor - Plot Settings",
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    settingEditWindow.loadURL(url.format({
        pathname: path.join(__dirname, "pop.html"),
        protocol: 'file:',
        slashes: true
    }));
    settingEditWindow.setMenuBarVisibility(false);

    // if (!app.isPackaged) settingEditWindow.webContents.openDevTools();
    settingEditWindow.webContents.once("dom-ready", function () {
        let lay = figurecontainer.layout
        let plot = []
        for(let i=0; i<figurecontainer.data.length; i++){
            let dat = {}
            dat.Title = figurecontainer.data[i].name
            dat.Style = figurecontainer.data[i].mode
            dat.Marker = figurecontainer.data[i].marker
            dat.Line = figurecontainer.data[i].line
            // color is removed as colorway is used for easy iteration, get it from full
            dat.Line.color = figurecontainer._fullData[i].line.color
            dat.Marker.color = figurecontainer._fullData[i].marker.color
            plot.push(dat)
        }
        if (!app.isPackaged) settingEditWindow.webContents.openDevTools();
        settingEditWindow.webContents.send("plotsetting", [lay, plot]);
    })
}



function spreadsheet() {
    let editorWindow = new BrowserWindow({
        minWidth: 1200,
        title: "Interactive Data Editor",
        show: false,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    editorWindow.maximize();
    editorWindow.loadURL(url.format({
        pathname: path.join(__dirname, "spreadsheet.html"),
        protocol: 'file:',
        slashes: true
    }));
    editorWindow.setMenuBarVisibility(false);

    editorWindow.show();
    // if (!app.isPackaged) editorWindow.webContents.openDevTools();
    editorWindow.webContents.once("dom-ready", function () {
        editorWindow.webContents.send("slider", [xName, col.x, data]);
    })
}


var viewerWindow;
function openViewer() {
    viewerWindow = new BrowserWindow({
        show: false,
        title: "Interactive Data Editor",
        minWidth: 1200,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true
        }
    });
    viewerWindow.maximize();
    viewerWindow.loadURL(url.format({
        pathname: path.join(__dirname, '3D_Viewer.html'),
        protocol: 'file:',
        slashes: true
    }));
    viewerWindow.on("closed", function () {
        viewerWindow = null
        serve=0
    })
    viewerWindow.show();
    viewerWindow.setMenuBarVisibility(false);
    if (!app.isPackaged) viewerWindow.webContents.openDevTools();
    viewerWindow.webContents.once("dom-ready", updateOnServer)
    serve = 1;
};



function alertElec(msg, type=1, title="Failed to execute."){
    dialog.showMessageBox(parentWindow,{
        type: type==1? "error": 'warning',
        title: title,
        message: msg,
        buttons: ['OK']
    });
}


const pop = document.getElementById('popup')
const popMain = document.getElementById('popmain')
const titletxt = document.getElementById('titletxt')

function closePop(){
    pop.style.opacity = 0
    setTimeout(()=>{pop.style.visibility='hidden'},250)
}

function openPop(){
    pop.style.visibility='visible'
    pop.style.opacity = 1
}

// openPop('Hello', 'Hi there')

document.getElementById('title').onmousedown = (e)=>{
    x = e.clientX;
    y = e.clientY;
    document.onmouseup = (e)=>{
        document.onmouseup = null;
        document.onmousemove = null;
    };
    document.onmousemove = (e)=>{
        pop.style.top = `${pop.offsetTop - y + e.clientY}px`
        pop.style.left = `${pop.offsetLeft - x + e.clientX}px`
        x = e.clientX;
        y = e.clientY;
    };
}