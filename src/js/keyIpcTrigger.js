function resizePlot() {
    window.dispatchEvent(new Event('resize'));
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
                changeEditable(ind)
            }
            break;
        case "ArrowLeft": case "ArrowRight":
            if (e.ctrlKey | e.shiftKey) moveReflect(e.keyCode-37, e.shiftKey)
            break
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
            openUtility('repeatMirror')
            break;
        case 'fill':
            openUtility('fillValues')
            break;
        case 'filter':
            openUtility('filterData')
            break;
        case 'rgft':
            if(initPolyfit()){
                openUtilityFit('rgFit')
            }
            break;
        case 'lmfit':
            if(initLMfit()) {
                // extendUtilities2d('lmfit')
                openUtilityFit('lmFit')
            }
            break;
        case 'pdash':
            settingWindow()
            break;
        case 'trigdown':
            $('#popupEx').show() 
            break
    }
}



const conMenu = Menu.buildFromTemplate([
    {
        label: 'Change Value',
        click(){ $('#popupSetVal').show() }
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
])

figurecontainer.oncontextmenu= ()=>{ if(index.length) conMenu.popup() }// trigge only when some values are selected



// make all the popups draggable
for(let elem of document.getElementsByClassName('title')){
    elem.onmousedown = function(e){
            x = e.clientX;
            y = e.clientY;
            document.onmouseup = (e)=>{
                document.onmouseup = null;
                document.onmousemove = null;
            };
            document.onmousemove = (e)=>{
                this.parentElement.style.top = `${this.parentElement.offsetTop - y + e.clientY}px`
                this.parentElement.style.left = `${this.parentElement.offsetLeft - x + e.clientX}px`
                x = e.clientX;
                y = e.clientY;
            };
        }
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

ipcRenderer.on("rf", (_, d)=> fileReader(d))

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


figurecontainer.on("plotly_legendclick", function(){ // to catch the name if changed from legend
    var tmpLeg=[]
    for (let i of figurecontainer.data) tmpLeg.push(i.name)
    legendNames = tmpLeg;
});


ipcRenderer.on("plotsetting", (_,d)=>{ // incoming info from the plotsetting window
    Plotly.update(figurecontainer,...d)
})


// load file if droped inside the window
document.ondragover = document.ondrop = (ev) => ev.preventDefault()
document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}


// attach change with mouse scroll functionality with the column selector
function selectWheel(ev){
    let add = ev.deltaY >0 ? 1 : -1
    let cur = ev.toElement.selectedIndex
    let max = ev.toElement.length-1
    if((max==cur && add==1) || (cur==0 && add==-1) ) return
    ev.toElement.selectedIndex = cur + add
}


// attach change X/Y with mouse scroll functionality to the figurecontainer and slider
function slideWheel(ev){
    let change = ev.deltaY <0 ? 1 : -1
    if((change==-1 && th_in==0) || (change==+1 && th_in==data.length-1)) return
    th_in += change
    sliderChanged()
}

slider.onmousewheel= slideWheel
figurecontainer.onmousewheel= slideWheel



function openUtility(name){ // name is passed as id name
    $('#filler').show()
    $('.extendUtils').slideUp()
    $(`#${name}`).slideDown()
}

function closeUtility(e){
    $(e.parentElement).slideUp(300, ()=>{ $('#filler').hide() })
}


function openUtilityFit(name){
    $(`#${name}`).show()
    $('#extendUtils2D').slideDown()
}

function closeUtilityFit(e){
    $('#extendUtils2D').slideUp()
    $(e.parentElement).hide()
}