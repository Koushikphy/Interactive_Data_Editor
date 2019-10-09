ipcRenderer.on("rf", function (e, d) {
    fileReader(d);
})

ipcRenderer.on("adrf", function (e, d) {
    addNewFile(d);
})

ipcRenderer.on("back", function (e, d) {
    data = d.map(x => transpose(x))
    updatePlot(1);
    selUpdate()
    startDragBehavior();
    updateOnServer();
})


ipcRenderer.on('checkClose', function (e, d) {
    if (!saved) var res = dialog.showMessageBox({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "There are some modified data, that you haven't saved yet.\n Are you sure to quit without saving?",
        buttons: ['Yes', "No"]
    });
    if (!res) ipcRenderer.send('checkClose', 'closeIt');
})



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
Step : <input type="text" id="fstep">`,
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
Fitted Equation: <span id='formulaStr'></span>`
}


function closeThis(m){
    $(m).parent().slideUp();
    resizePlot();
}


ipcRenderer.on("menuTrigger", function (e, d) {
    if (show) console.log(e, d);
    switch (d) {
        case "open":
            fileLoader();
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

        case "wire":
            openViewer(0);
            break;
        case "surface":
            openViewer(1);
            break;
        case "spread":
            spreadsheet();
            break;

        case "pa":
            isswap();
            break;
        case "pamh":
            lockXc = menu.getMenuItemById("pamh").checked ? 0 : 1;
            break;
        case "rsch":
            rangedSelector = menu.getMenuItemById("rsch").checked ? 1 : 0;
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
            document.getElementById('extendutils').innerHTML = extendUtils['extend']
            $("#einp").val(last)
            $("#etime").val(times)
            $("#extendutils").slideDown();
            resizePlot();
            break;
        case 'fill':
            document.getElementById('extendutils').innerHTML = extendUtils['filler']
            $("#fstart").val(start)
            $("#fend").val(stop)
            $("#fstep").val(step)
            $("#extendutils").slideDown();
            resizePlot()
            break;
        case 'filter':
            document.getElementById('extendutils').innerHTML = extendUtils['filter']
            $('#extendutils').slideDown();
            resizePlot()
            break;
        case 'rgft':
            document.getElementById('extendutils').innerHTML = extendUtils['rgfit']
            if(polyfit(1)){
                $('#extendutils').slideDown();
                resizePlot()
                for (let i of ['edat','fill','filter','af','arf']) menu.getMenuItemById(i).enabled = false;
            }
            break;
        case 'pdash':
            if ($('#sidebar2').width()) {
                closeNav2();
            } else {
                openNav2();
            }
            break;
        case 'fdash':
            if ($('#sidebar').width()) {
                closeNav();
            } else {
                openNav();
            }
            break;
    }
});



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
            if (!app.isPackaged) sSwapper();
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


var cm = $('.custom-cm');
var sub = $(".submen")
var subm = $(".submenu")


function contextMenuFuncs(e) {
    if(!index.length) return
    e.preventDefault();
    
    ttt  = e.clientY + cm.height()+50 > window.innerHeight ? window.innerHeight - cm.height() -50: e.clientY;
    lll = e.clientX + cm.width() > window.innerWidth-5 ? window.innerWidth - cm.width()-5 : e.clientX;
    cm.css({ top: ttt, left: lll })

    lll += 147
    // ttt += 65
    ttt = ttt+84+65 > window.innerHeight ? ttt : ttt+65 
    lll = lll+175> window.innerWidth  ? lll-172-147 : lll;
    $(".submenu").css({top:ttt, left:lll})
    cm.show();
};
// $('#figurecontainer').contextmenu(contextMenuFuncs)


function resetClicks(e) {
    cm.hide();
    if (e.target.tagName == "rect") {
        Plotly.restyle(figurecontainer, {selectedpoints: [null]});
        index = [];
        del_dat = [];
    }

}

function exectuteContext() {
    cm.hide();
    //setValue function available in dataOp.js
    var div = document.createElement('div');
    div.id = 'setval'
    div.innerHTML = `Set a value for the selected points <br>
        <input type="text" id="valinput" onchange="setValue();"><br>
        <input type="button" value="OK" onclick="setValue();">
        <input type="button" value="Cancel" onclick="$('#setval').remove();">`.trim()
    document.body.appendChild(div)
}


$(window).keydown(hotKeys);
$(window).keyup(hotDKeys);
$('#figurecontainer').contextmenu(contextMenuFuncs)
$('#figurecontainer').click(resetClicks)



sub.mouseover(function () {
    subm.show()
});


subm.mouseover(function () {
    subm.show()
});


sub.mouseleave(function () {
    if (!$('.submen:hover').length & !$('.submenu:hover').length) {
        setTimeout(function(){subm.hide()} , 200) 
    }
});

subm.mouseleave(function () {
    if (!$('.submen:hover').length & !$('.submenu:hover').length) {
        setTimeout(function(){subm.hide()} , 200) 
    }
});



