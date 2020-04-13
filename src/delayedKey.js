var extendUtils = {
'filter': `
    Condition:<select id="flSel">
        <option>&lt;</option>
        <option>></option>
        <option>=</option>
    </select>
    <input type="text" id="flc"> <br>
    Fill with: <input type="text" id="flf">
    <input type="submit" value="OK" onclick="filterData();closeThis()" style="width: 5pc;height: 1.9pc">
    <input type="submit" value="Cancel" onclick="closeThis()" style="width: 5pc;height: 1.9pc">
     &#9432;<span style="font-size:.9pc"> This operation is not reversible. You may want to save before proceeding.</span> <br>
    Columns : <input type="text" id="flcl">`,

'filler': `Start : <input type="text" id="fstart">
Extrapolate <select  id="expSel">
    <option>Closest</option>
    <option>Regression</option>
</select> <br>
End : <input type="text" id="fend">
<input type="submit" value="OK" onclick="dataFiller();closeThis()" style="width: 5.15pc;height: 1.7pc;margin: 2px">
<input type="submit" value="Cancel" onclick="closeThis()" style="width: 5.15pc;height: 1.7pc">
 &#9432;<span style="font-size:.9pc"> This operation is not reversible. You may want to save before proceeding.</span><br>
Step : <input type="text" id="fstep">
<input id='setAsGrid' type="checkbox"> Set as grid`,

'extend': `Extend from : 0 to <input type="text" id="einp"> <br>
Extend times: <input type="text" id="etime">
<input type="submit" value="OK" onclick="repeatMirror();closeThis()" style="width: 5pc;height: 1.9pc">
<input type="submit" value="Cancel" onclick="closeThis()" style="width: 5pc;height: 1.9pc"> <br>
Extend by: <select id="repSel" >
    <option>Repeat</option>
    <option>Mirror</option>
</select><br>`,

'rgfit': `<span style="display: inline-block; margin-bottom: .4pc"> 
Order of polynomial: </span> 
<input style="height: 1.5pc" id="polyInp" type="number" value="1" min="1" oninput="polyfit(this.value)">  
<input type="submit" value="Close" onclick="closeThis2d();revertPloyFit()" style="width: 5pc;height: 1.5pc"> <br>
Fitted Equation: <span id='formulaStr'></span>`,

'lmfit':`<div style="margin-bottom: 7px;">
<span> Function: <input id='funcStr' style=" margin-left:1.7%;width: 40.3%; height: 1.5pc;" type="text" value="a+b*x"></span>
<span style="margin-left: 7px;"> Parameters List: <input style=" height: 1.5pc; width: 7.7pc;" id='paramList'type="text" value="a,b"></span>
<button style=" height: 1.7pc; float: right;margin-right: 2.1%;"onclick="closeThis2d();closeLMfit()" >Close</button>
<button style=" height: 1.7pc;margin-right: 3pc; width: 10%;border: 2px solid #000000; float: right;" onclick="lmfit()">Solve</button>
</div>
<div class="grid-container">
   Max Iterations: <input id='iterationVal' type="text" value='1000'>
   <span>Initial Values: </span> <input id='intVal' type="text">
   <span>Max Values:</span> <input id='maxVal' type="text">
   <span>Min Values: </span><input id='minVal' type="text">
   Damping factor: <input id='dampVal' type="text" value="1.5">
  <span>Step Size:</span> <input id='stepVal' type="text" value='1e-2'>
  <span>Error Tolerance: </span><input id='etVal' type="text" value='1e-5'>
  <span>Error gradient:</span> <input id='egVal' type="text" value='1e-8'>  
</div>`
}


function extendUtilities(name){
    document.getElementById('extendutils').innerHTML = extendUtils[name]
    $('#filler').width($('#container').parent().width())
    $('#filler').show();
    $("#extendutils").slideDown();
}

function closeThis(){
    $("#extendutils").slideUp(200, ()=>$('#filler').hide())
}

function extendUtilities2d(name){
    closeThis()
    document.getElementById('extendUtils2d').innerHTML = extendUtils[name]
    $("#extendUtils2d").slideDown(300, resizePlot);
    // resizePlot()
}

function closeThis2d(){
    $("#extendUtils2d").slideUp(300, resizePlot);
    // resizePlot()
}


function hotDKeys(e) {
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


function hotKeys(e) {
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


slider.onmousewheel= (ev)=>{
    let change = ev.deltaY <0 ? 1 : -1
    if((change==-1 && th_in==0) || (change==+1 && th_in==data.length-1)) return
    th_in += change
    sliderChanged()
}


window.onkeydown = hotKeys;
window.onkeyup = hotDKeys;
figurecontainer.oncontextmenu= ()=>{ if(index.length) conMenu.popup() }

figurecontainer.onclick= (e)=>{
    if (e.target.tagName == "rect") {
            Plotly.restyle(figurecontainer, {selectedpoints: [null]});
            index = [];
}}

ipcRenderer.on("back", (e, d) =>{
    data = d.map(x => transpose(x))
    updatePlot(1);
    selUpdate()
    startDragBehavior();
    updateOnServer();
})

ipcRenderer.on("menuTrigger", ipcTrigger)
ipcRenderer.on("adrf", (_, d)=> addNewFile(d))