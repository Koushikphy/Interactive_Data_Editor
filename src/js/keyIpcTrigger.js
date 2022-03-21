const {iniPointsF} = require('../js/plotUtils')
const {downloadImage } = require('../js/download')


function resizePlot() {
    window.dispatchEvent(new Event('resize'));
}


var fired=false
function keyDownfired(){
    if(!fired){
        fired = true
        saveOldData()
    }
}

window.onkeyup = function hotDKeys(e) {
    if((document.activeElement.type != "text") && (e.key == 'm' || e.key == 'M' || e.key == 'ArrowDown' || e.key == 'ArrowUp') ){
        fired=false
        fullData[currentEditable] = data;
        updateOnServer()
    }
}


window.onkeydown = function hotKeys(e) {
    if (document.activeElement.type == "text") return
    // console.log(e)
    if(e.key==' '){
        if(cRangeY.every(i=>isNaN(i))){
            Plotly.relayout(figurecontainer, {
                "xaxis.autorange": true,
                "yaxis.autorange": true
            })
        }else{
            cRange = true
            setCutRange()
        }

    }else if(e.key==","){ 
        sliderChanged(-1)

    }else if(e.key=="."){ 
        sliderChanged(+1)

    }else if((e.key=="s" || e.key=="S") && !e.ctrlKey ){
        Plotly.relayout(figurecontainer, {dragmode: "select"})
        
    }else if((e.key=="z" || e.key=="Z") && !e.ctrlKey && !e.shiftKey){
        Plotly.relayout(figurecontainer, {dragmode: "zoom"})
    
    }else if((e.key=="z" || e.key=="Z") && e.ctrlKey && !e.shiftKey){
        unDo()
    
    }else if((e.key=="z" || e.key=="Z") && e.ctrlKey && e.shiftKey){
        reDo()

    }else if((e.key=="d" || e.key=="D") && index.length){
        deleteInterpolate()

    }else if((e.key=="e" || e.key=="E") && index.length){
        deleteExtrapolate()

    }else if((e.key=="k" || e.key=="K") && index.length){
        dataSupStart()

    }else if((e.key=="l" || e.key=="L") && index.length){
        dataSupEnd()

    }else if((e.key=="m" || e.key=="M") && index.length){
        keyDownfired();autoSmooth()

    }else if((e.key=="c" || e.key=="C") && e.ctrlKey){
        copyThis()

    }else if((e.key=="c" || e.key=="C") && index.length && !e.ctrlKey){
        changeSign()

    }else if((e.key=="p" || e.key=="P") && index.length && swapperIsOn){
        swapData()

    }else if((e.key=="v" || e.key=="V") && e.ctrlKey){
        pasteThis()

    }else if((e.key=="x" || e.key=="X") && index.length){
        removeBadData()
    
    }else if(e.key=="ArrowDown" && index.length){
        keyDownfired(); keyBoardDrag(0)

    }else if(e.key=="ArrowUp" && index.length){
        keyDownfired(); keyBoardDrag(1)

    }else if(e.key=="Tab" && e.ctrlKey && figurecontainer.data.length!=1){
        let ind = currentEditable == figurecontainer.data.length-1 ? 0 : currentEditable+1
        changeEditable(ind)

    }else if(e.key=="ArrowLeft" && e.ctrlKey && !e.shiftKey){
        moveReflect(false, false)

    }else if(e.key=="ArrowRight" && e.ctrlKey && !e.shiftKey){
        moveReflect(true, false)

    }else if(e.key=="ArrowLeft" && !e.ctrlKey && e.shiftKey){
        moveReflect(false, true)

    }else if(e.key=="ArrowRight" && !e.ctrlKey && e.shiftKey){
        moveReflect(true, true)

    }else if ((e.key=="a" || e.key=="A") && e.ctrlKey) {
        index = Plotly.d3.range(index[0], index[index.length-1]+1,1)
        Plotly.restyle(figurecontainer, {selectedpoints : [index]})

    }else if(e.key=="1" && e.ctrlKey){
        diff12()

    }else if(e.key=="2" && e.ctrlKey){
        merge12()

    }else if(e.key=="3" && e.ctrlKey){
        diff23()

    }else if(e.key=="4" && e.ctrlKey){
        merge23()

        // }else{
    //     console.log('No available trigger',e.key)
    }
};


function ipcTrigger(_,d){
    if(d=='open'){
        fileLoader()

    }else if(d=='add'){
        addNewFileDialog()

    }else if((d=='save' && firstSave) || (d=='saveas')){
        saveAs()

    }else if(d=='save' && !firstSave){
        saveData()

    }else if(d=='3dview'){
        openViewer()
        analytics.add('3Dviewer')

    }else if(d=='tax' && ddd){
        isswap()
        analytics.add('swapAxis')

    }else if(d=='spread'){
        spreadsheet()
        analytics.add('spreadsheet')

    }else if(d=='pamh'){
        lockXc = menu.getMenuItemById("pamh").checked ? 0 : 1
        analytics.add('moveX')

    }else if(d=='fullscreen'){
        resizePlot()

    }else if(d=='tswap' && !swapperIsOn){
        openSwapper()
        analytics.add('swapper')

    }else if(d=='tswap' && swapperIsOn){
        exitSwapper()

    // }else if(d=='smt'){
    //     smooth.openSmooth()
    //     analytics.add('autoSmooth')

    }else if(d=='tplots' && !$('#sidebar').width()){
        openNav()
        analytics.add('plotList')

    }else if(d=='tplots' && $('#sidebar').width()){
        closeNav()

    }else if(toolbarutil.availableTools.includes(d)){
        toolbarutil.openToolBar(d)
    

    }else if(d=='pdash'){
        settingWindow()
        analytics.add('settingWindow')
    }else if(d=='trigdown'){
        $('#popupEx').show()
        analytics.add('exportImage')
        
    }else if(d.substring(0,8)=='autosave'){
        autoSave = parseInt(d.substring(8))
        autoSaveMenuItems.forEach(e=>{e.checked=false})
        autoSaveMenuItems[{0:0,1:1,5:2,10:3}[autoSave]].checked = true
        saveRemminder()
        // localStorage.setItem( "autosave", JSON.stringify(autoSave))
        store.set('autosave',autoSave)
    }
}


var saveRemminderTimer;
function saveRemminder(){
    clearInterval(saveRemminderTimer);
    if(!autoSave) return
    saveRemminderTimer=setInterval(()=>{
        if(firstSave){
            showStatus("You may want to save the file.")
        } else{ 
            // if there is noting to save dont trigger the save 
            // as it will send a analytics data
            if (!saved) saveData()
        }
    },autoSave*1000*60)
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
                label : 'Moving Average',
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

figurecontainer.oncontextmenu= ()=>{ if(index.length) conMenu.popup() }// trigger only when some values are selected



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
    fullData[currentEditable] = data
    updatePlot();
    setUpColumns()
    startDragBehavior();
    updateOnServer();
})


ipcRenderer.on("menuTrigger", ipcTrigger)

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
    // reposition the slider thumb
    let max = data.length-1;
    let xPX = th_in * (figurecontainer.offsetWidth -6 - thumb.offsetWidth) / max+3;
    thumb.style.left = `${xPX}px`
})



figurecontainer.on("plotly_selected", (ev)=>{
    if (ev != undefined) {
        index = [];
        for (let pt of ev.points) {
            if(pt.curveNumber == currentEditable) index.push(pt.pointIndex);
        }
    };
});


figurecontainer.on("plotly_legendclick", function(){ // to catch the name if changed from legend
    legendNames = figurecontainer.data.map(e=>e.name) 
});


figurecontainer.on("plotly_relayout", (lay)=>{
    let keys = Object.keys(lay)
    // console.log(keys)
    if( keys.length==2 && keys.includes("xaxis.autorange") && keys.includes("yaxis.autorange")){
        cRange = false
        cRangeY = [NaN, NaN]
    }else if( ( keys.includes("yaxis.range[0]") && keys.includes("yaxis.range[1]") ) || // zoomed view
     ( keys.includes("xaxis.range[0]") && keys.includes("xaxis.range[1]"))){
        cRange = false
    }else if( keys.length==1 && keys.includes("yaxis.range[0]")){
        cRange = true;
        cRangeY[0] = lay["yaxis.range[0]"]
        setCutRange()
    }else if( keys.length==1 && keys.includes("yaxis.range[1]") ){
        cRange = true;
        cRangeY[1] = lay["yaxis.range[1]"]
        setCutRange()
    }
});


ipcRenderer.on("plotsetting", (_,d)=>{ // incoming info from the plotsetting window
    Plotly.update(figurecontainer,...d)
})


ipcRenderer.on("colchanged", (_,d)=>{ // incoming info from the viewer window
    zCol.selectedIndex = d
    colChanged(d)
    makeRows()
})

ipcRenderer.on("exportAll", (_,d)=>{ // incoming info from the viewer window
    exportAll = d
    updateOnServer()
})

// load file if droped inside the window
document.ondragover = document.ondrop = (ev) => ev.preventDefault()
document.body.ondrop = (ev) => {
    const fname = ev.dataTransfer.files[0].path;
    if (fname !== undefined) fileReader(fname);
    ev.preventDefault()
}

// attach change with mouse scroll functionality to selectors
for(let elem of document.getElementsByClassName('sWheel')){
    elem.onwheel = function(e){
        let cur = this.selectedIndex
        let max = this.length-1
        let add = e.deltaY >0 ? 1 : -1
        if((max==cur && add==1) || (cur==0 && add==-1) ) return
        this.selectedIndex = cur + add
        this.dispatchEvent(new Event('change'))
    }
}

// attach change X/Y with mouse scroll functionality to the figurecontainer and slider
figurecontainer.onmousewheel = slider.onmousewheel = function(ev){
    ev.deltaY <0 ? sliderChanged(+1) : sliderChanged(-1)
}


function closeFit(e){
    $('#extendUtils2D').slideUp()
    $(e).hide()
}


document.getElementById('imRes').value = `${window.innerWidth}x${window.innerHeight}`

for(let el of document.getElementsByClassName('closbtn')) el.onclick = ()=>{$('.popup').hide()}

for(let el of document.getElementsByClassName('utilBtn')) el.addEventListener("click",function(){
    $(this.parentElement).slideUp(300, ()=>{ $('#filler').hide() })
    if(!ddd) enableMenu(['lmfit','rgfit'])
})

document.getElementById("dwBtn").onclick=()=>{
    downloadImage($('#dfileName').val(), $('#imRes').val(), $('#fileFormat').val())
    $('.popup').hide()
}

document.getElementById("valinput").onchange = document.getElementById('valBtn').onclick = ()=>{
    setValue($('#valinput').val())
    $('.popup').hide()
}
