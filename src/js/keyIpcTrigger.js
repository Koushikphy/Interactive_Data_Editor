const {iniPointsF} = require('../js/plotUtils')

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

    }else if((e.key=="p" || e.key=="P") && index.length){
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

    }else if(d=='pa' && ddd){
        isswap()

    }else if(d=='spread'){
        spreadsheet()

    }else if(d=='pamh'){
        lockXc = menu.getMenuItemById("pamh").checked ? 0 : 1

    }else if(d=='fullscreen'){
        resizePlot()

    }else if(d=='tswap' && !swapperIsOn){
        openSwapper()

    }else if(d=='tswap' && swapperIsOn){
        exitSwapper()

    }else if(d=='edat'){
        openUtility('repeatMirror')

    }else if(d=='fill'){
        openUtility('fillValues')

    }else if(d=='filter'){
        openUtility('filterData')


    }else if(d=='rgft' || d=='lmfit'){
        if(figurecontainer.data.length>1) {alertElec('Supported only for one plot at a time.'); return}
        Plotly.addTraces(figurecontainer, {...iniPointsF, x: [dpsx[0]], y:[dpsy[0]]});
        setTimeout(resizePlot, 300)
        disableMenu(['edat','fill','filter','af','arf',d=='rgft' ? 'lmfit':'rgft'])
        $(`#${d=='rgft' ? 'rgFit' : 'lmFit' }`).show()
        $('#extendUtils2D').slideDown()

    }else if(d=='pdash'){
        settingWindow()

    }else if(d=='trigdown'){
        $('#popupEx').show()

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
    $('#filler').width($('#container').parent().width())
    if(fullData.length && ddd) sliderChanged()
})

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
    let tmpLeg=[]
    for (let i of figurecontainer.data) tmpLeg.push(i.name)
    legendNames = tmpLeg;
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


function openUtility(name){ // name is passed as id name
    $('#filler').show()
    $('.extendUtils').slideUp()
    $(`#${name}`).slideDown()
    if(!ddd) disableMenu(['lmfit','rgft'])
}

function closeUtility(e){
    $(e.parentElement).slideUp(300, ()=>{ $('#filler').hide() })
    if(!ddd) enableMenu(['lmfit','rgft'])
}


function openUtilityFit(name){
    $(`#${name}`).show()
    $('#extendUtils2D').slideDown()
}

function closeUtilityFit(e){
    $('#extendUtils2D').slideUp()
    $(e).hide()
}


document.getElementById('imRes').value = `${window.innerWidth}x${window.innerHeight}`