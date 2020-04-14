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
    