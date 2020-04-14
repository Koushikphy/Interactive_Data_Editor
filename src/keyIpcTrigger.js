function resizePlot() {
    // this triggers the responsiveness on plotly
    window.dispatchEvent(new Event('resize'));
    // setTimeout(function () {
    //     var height = window.innerHeight - document.getElementById("figurecontainer").offsetTop;
    //     $("#figurecontainer").height(height - 2);
    //     Plotly.relayout(figurecontainer, {
    //         autosize: true
    //     });
    // }, 330)
}




window.onkeyup = function hotDKeys(e) {
    if (document.activeElement.type == "text") return
    switch (e.key) {
        case 'm':
        case 'ArrowDown':
        case 'ArrowUp':
            ma = 1;
            fullData[0] = data;
            updateOnServer();
    }
}


window.onkeydown = function hotKeys(e) {
    if (document.activeElement.type == "text") return
    // console.log(e)
    switch (e.key) {
        case " ":
            Plotly.relayout(figurecontainer, {
                "xaxis.autorange": true,
                "yaxis.autorange": true
            });
            break;
        case ",":
            if (th_in == 0) break;
            th_in = th_in - 1
            sliderChanged();
            break;
        case ".":
            if (th_in == data.length - 1) break;
            th_in = th_in + 1
            sliderChanged();
            break;
        case "s":
        case "S":
            if (!e.ctrlKey) Plotly.relayout(figurecontainer, {dragmode: "select"});
            break;
        case "z":
        case "Z":
            if (e.ctrlKey & !e.shiftKey) {
                unDo();
            } else if (e.ctrlKey & e.shiftKey) {
                reDo();
            } else {
                Plotly.relayout(figurecontainer, {dragmode: "zoom"});
            };
            break;
        case "p":
        case "P":
            swapData();
            break;

        case "d":
        case "D":
            deleteInterpolate()
            break;
        case "e":
        case "E":
            deleteExtrapolate()
            break;
        case "m":
        case "M":
            autoSmooth();
            break;
        case "c":
        case "C":
            if (e.ctrlKey) {
                copyThis();
            } else {
                changeSign();
            }
            break;
        case 'v':
        case "V":
            if (e.ctrlKey)pasteThis();
            break;
        case 'ArrowDown':
            keyBoardDrag(0);
            break;
        case 'ArrowUp':
            keyBoardDrag(1);
            break
        case 'o':
        case 'O':
            if (!app.isPackaged && ddd) sSwapper();
            break
        case 'x':
        case 'X':
            removeBadData()
        case 'Tab':
            if (e.ctrlKey) {
                if(figurecontainer.data.length==1) return
                let ind = currentEditable == figurecontainer.data.length-1 ? 0 : currentEditable+1
                // console.log(currentEditable,ind)
                changeEditable(ind)
            }
            break;
        case "ArrowLeft": case "ArrowRight":
            if (e.ctrlKey | e.shiftKey) moveReflect(e.keyCode-37, e.shiftKey)
        case 'k':
        case 'K':
            dataSupStart()
            break;
        case 'l':
        case 'L':
            dataSupEnd();
    };
};


function ipcTrigger(e,d){
    if (show) console.log(e, d);
    switch (d) {
        case "open":
            fileLoader()
            break;
        case 'add':
            addNewFileDialog();
            break;
        case "save":
            if (firstSave) {
                saveAs()
            } else {
                saveData()
            }
            break;
        case "saveas":
            saveAs();
            break;
        case '3dview':
            openViewer()
            break;
        case "spread":
            spreadsheet();
            break;
        case "pa":
            if(ddd) isswap();
            break;
        case "pamh":
            lockXc = menu.getMenuItemById("pamh").checked ? 0 : 1;
            break;

        case "fullscreen":
            resizePlot();
            break;
        case 'tswap':
            if (!swapperIsOn) {
                openSwapper()
            } else {
                exitSwapper()
            }
            break;
        case "edat":
            extendUtilities('extend')
            document.getElementById('repSel').selectedIndex = mirror
            break;
        case 'fill':
            extendUtilities('filler')
            break;
        case 'filter':
            extendUtilities('filter')
            break;
        case 'rgft':
            if(initPolyfit()){
                extendUtilities2d('rgfit')
                polyfit(1)
            }
            break;
        case 'lmfit':
            if(initLMfit()) {
                extendUtilities2d('lmfit')
            }
            break;
        case 'pdash':
            settingWindow()
            break;
        case 'trigdown':
            triggerDownload();
            break
    }
}



const conMenu = Menu.buildFromTemplate([
    {
        label: 'Change Value',
        click(){
            popupbox.innerHTML = `&ensp;Set value: &nbsp;<input type="text" style="width:6pc" id='valinput' ><br><br>
                    <input type="submit" value="OK" onclick="setValue(this);closePopUp();">
                    <input type="submit" value="Cancel" onclick="closePopUp();">`
            popupbox.style.width = 'fit-content'
            popupbox.style.textAlign = 'center'
            openPopUp()
        }
    },{
        label: 'Change Sign',
        accelerator : 'C',
        click : changeSign
    },{
        label: 'Remove Data',
        accelerator: 'X',
        click : removeBadData
    },{
        label: 'Smooth Data',
        submenu:[
            {
                label : 'Cubic Spline',
                accelerator : 'D',
                click : deleteInterpolate
            },{
                label : 'Mooving Average',
                accelerator : 'M',
                click : autoSmooth
            },{
                label : 'Regression Fitting',
                accelerator : 'E',
                click : deleteExtrapolate
            },
        ]
    }
]
)

figurecontainer.oncontextmenu= ()=>{ if(index.length) conMenu.popup() }



slider.onmousewheel= (ev)=>{
    let change = ev.deltaY <0 ? 1 : -1
    if((change==-1 && th_in==0) || (change==+1 && th_in==data.length-1)) return
    th_in += change
    sliderChanged()
}


figurecontainer.onclick= (e)=>{
    if (e.target.tagName == "rect") {
            Plotly.restyle(figurecontainer, {selectedpoints: [null]});
            index = [];
}}


ipcRenderer.on("back", (_, d) =>{
    data = d.map(x => transpose(x))
    updatePlot(1);
    setUpColumns()
    startDragBehavior();
    updateOnServer();
})


ipcRenderer.on("menuTrigger", ipcTrigger)

ipcRenderer.on("adrf", (_, d)=> addNewFile(d))

ipcRenderer.on("rf",  (_, d)=> fileReader(d))

ipcRenderer.on('checkClose', function (_,_) {
    if (!saved) var res = dialog.showMessageBoxSync({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to quit without saving the changes ?",
        buttons: ['Yes', "No"]
    });
    if (!res) ipcRenderer.send('checkClose', 'closeIt');
})


window.addEventListener("resize", function(){
    $('#filler').width($('#container').parent().width())
    if(fullData.length && ddd) sliderChanged()
}) //needed to position the thumb div

$('#filler').width($('#container').parent().width())



figurecontainer.on("plotly_selected", (ev)=>{
    if (ev != undefined) {
        index = [];
        for (let pt of ev.points) {
            if(pt.curveNumber == currentEditable) index.push(pt.pointIndex);
        }
    };
});


figurecontainer.on("plotly_legendclick", function(){
    var tmpLeg=[]
    for (let i of figurecontainer.data) tmpLeg.push(i.name)
    legendNames = tmpLeg;
});


ipcRenderer.on("plotsetting", (_,d)=>{
    Plotly.update(figurecontainer,...d)
})


document.ondragover = document.ondrop = (ev) => ev.preventDefault()

document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}