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
            $("#extend").slideDown();
            if($("#einp").val()==""){
                $("#einp").val(data[th_in][col.y].slice(-1)[0])
            }
            resizePlot();
            break;
        case 'fill':
            $("#filler").slideDown();
            resizePlot()
            break;
        case 'filter':
            $('#filter').slideDown();
            resizePlot()
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
    if (document.activeElement.type == "text") {
        return;
    };
    switch (e.key) {
        case 'm':
        case 'ArrowDown':
        case 'ArrowUp':
            ma = 1;
            updateOnServer();
    }
}


keepTrackIndex = 0

function hotKeys(e) {
    if (document.activeElement.type == "text") {
        return;
    };
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
    
    };
};

function moveReflect(key, mod){
    saveOldData();
    var ind = index[index.length-1]+1;
    var tmp = dpsy.slice(index[0], ind);
    if(!key) ind=index[0]-index.length;
    if(mod) tmp.reverse();
    tmp.shift();
    dpsy.splice(ind, tmp.length, ...tmp);
    updatePlot();
    updateOnServer();
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

function exectuteContext(x) {
    cm.hide();
    $('#setval').show();
    // $('#setval').css({top:x.clientY,left:x.clientY})
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

