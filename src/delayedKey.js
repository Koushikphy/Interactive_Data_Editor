

var extendUtils = {
    'filter': ` Condition:<select id="flSel">
    <option>&lt;</option>
    <option>></option>
    <option>=</option>
</select>
<input type="text" id="flc"> <br>
Fill with &nbsp;: <input type="text" id="flf">
<input type="submit" value="OK" onclick="filterData();closeThis(this)" style="width: 5pc;height: 1.9pc">
<input type="submit" value="Cancel" onclick="closeThis(this)" style="width: 5pc;height: 1.9pc">
&ensp; &#9432;<span style="font-size:.9pc"> This operation is not reversible. You may want to save before proceeding.</span> <br>
Columns : <input type="text" id="flcl">`,
'filler': `            Start : <input type="text" id="fstart">
Extrapolate: <select  id="expSel">
    <option>Closest</option>
    <option>Regression</option>
</select> <br>
End &nbsp;: <input type="text" id="fend">
<input type="submit" value="OK" onclick="dataFiller();closeThis(this)" style="width: 5pc;height: 1.7pc;margin-right: 2px">
<input type="submit" value="Cancel" onclick="closeThis(this)" style="width: 5pc;height: 1.7pc">
&ensp; &#9432;<span style="font-size:.9pc"> This operation is not reversible. You may want to save before proceeding.</span><br>
Step : <input type="text" id="fstep">
<input id='setAsGrid' type="checkbox"> Set as grid`

,
'extend': `Extend from : 0 to <input type="text" id="einp"> <br>
Extend times: <input type="text" id="etime">
<input type="submit" value="OK" onclick="repeatMirror();closeThis(this)" style="width: 5pc;height: 1.9pc">
<input type="submit" value="Cancel" onclick="closeThis(this)" style="width: 5pc;height: 1.9pc"> <br>
Extend by: <select style="margin-left: 18px;" id="repSel" >
    <option>Repeat</option>
    <option>Mirror</option>
</select><br>`,
'rgfit': `<span style="display: inline-block; margin-bottom: .4pc"> 
Order of polynomial: &ensp;</span> 
<input style="height: 1.4pc" id="polyInp" type="number" value="1" min="1" oninput="polyfit(this.value)"> &ensp; 
<input type="submit" value="Close" onclick="closeThis(this);revertPloyFit()" style="width: 5pc;height: 1.5pc"> <br>
Fitted Equation: <span id='formulaStr'></span>`,
'lmfit':`<div style="margin-bottom: 7px;">
<span> Function: <input id='funcStr' style=" margin-left:1.7%;width: 40.3%; height: 1.5pc;" type="text" value="a+b*x"></span>
<span style="margin-left: 3%;"> Parameters List: <input style=" height: 1.5pc; width: 10%;" id='paramList'type="text" value="a,b"></span>
<button style=" height: 1.7pc; float: right;margin-right: 2.1%;"onclick="closeThis();closeLMfit()" >Close</button>
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


function closeThis(m){
    $('#extendutils').slideUp();
    resizePlot();
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


keepTrackIndex = 0

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
            if (!e.ctrlKey) {
                Plotly.relayout(figurecontainer, {
                    dragmode: "select"
                });
            }
            break;

        case "z":
        case "Z":
            if (e.ctrlKey & !e.shiftKey) {
                unDo();
            } else if (e.ctrlKey & e.shiftKey) {
                reDo();
            } else {
                Plotly.relayout(figurecontainer, {
                    dragmode: "zoom"
                });
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
            if (e.ctrlKey) {
                pasteThis();
            }
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
                keepTrackIndex += 1
                if (keepTrackIndex == fullData.length) {
                    keepTrackIndex = 1
                }
                selectEditable(keepTrackIndex)
            }
            break;
        case "ArrowLeft": case "ArrowRight":
            if (e.ctrlKey | e.shiftKey){
                moveReflect(e.keyCode-37, e.shiftKey)
            };
        case 'k':
        case 'K':
            dataSupStart()
            break;
        case 'l':
        case 'L':
            dataSupEnd();
    
    };
};


// can lazy load the following

//for rendering the contextmenu
const conMenu = Menu.buildFromTemplate([
    {
        label: 'Change Value',
        click(){
            // console.log('Change Value')
            var div = document.createElement('div');
            div.id = 'setval' //function setval is available in dataOp.js
            div.innerHTML = `Set a value for the selected points <br>
                <input type="text" id="valinput" onchange="setValue();"><br>
                <input type="button" value="OK" onclick="setValue();">
                <input type="button" value="Cancel" onclick="$('#setval').remove();">`.trim()
            document.body.appendChild(div)
        }
    },{
        label: 'Change Sign',
        accelerator : 'C',
        click : changeSign
        // click(){
        //     changeSign()
        // document.dispatchEvent( new KeyboardEvent('keydown', {bubbles: true,key: "C"}))
        // } 
    },{
        label: 'Remove Data',
        accelerator: 'X',
        click : removeBadData
        // click(){
        //     document.dispatchEvent( new KeyboardEvent('keydown', {bubbles: true,key: "X"}))
        // } 
    },{
        label: 'Smooth Data',
        submenu:[
            {
                label : 'Cubic Spline',
                accelerator : 'D',
                click : deleteInterpolate
                // click(){
                //     document.dispatchEvent( new KeyboardEvent('keydown', {bubbles: true,key: "D"}))
                // }
            },{
                label : 'Mooving Average',
                accelerator : 'M',
                click : autoSmooth
                // click(){
                //     document.dispatchEvent( new KeyboardEvent('keydown', {bubbles: true,key: "M"}))
                // }
            },{
                label : 'Regression Fitting',
                accelerator : 'E',
                click : deleteExtrapolate
                // click(){
                //     document.dispatchEvent( new KeyboardEvent('keydown', {bubbles: true,key: "E"}))
                // }
            },
        ]
    }
]
)

window.onkeydown = hotKeys;
window.onkeyup = hotDKeys;
figurecontainer.oncontextmenu= ()=>{
    if(index.length) conMenu.popup()
}

figurecontainer.onclick= (e)=>{
    if (e.target.tagName == "rect") {
            Plotly.restyle(figurecontainer, {selectedpoints: [null]});
            index = [];
            del_dat = [];
}}