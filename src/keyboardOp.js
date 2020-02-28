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
    if (!saved) var res = dialog.showMessageBoxSync({
        type: "warning",
        title: "Unsaved data found!!!",
        message: "Do you want to quit without saving the changes ?",
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
        // case "rsch":
        //     rangedSelector = menu.getMenuItemById("rsch").checked ? 1 : 0;
        //     break;
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
            document.getElementById('repSel').selectedIndex = mirror
            $("#extendutils").slideDown();
            resizePlot();
            break;
        case 'fill':
            document.getElementById('extendutils').innerHTML = extendUtils['filler']
            $("#extendutils").slideDown();
            resizePlot()
            break;
        case 'filter':
            document.getElementById('extendutils').innerHTML = extendUtils['filter']
            $('#extendutils').slideDown();
            resizePlot()
            break;
        case 'rgft':
            if(initPolyfit()){
                document.getElementById('extendutils').innerHTML = extendUtils['rgfit']
                $('#extendutils').slideDown();
                resizePlot()
                polyfit(1)
            }
            break;
        case 'lmfit':
            if(initLMfit()) {
                document.getElementById('extendutils').innerHTML = extendUtils['lmfit']; 
                $('#extendutils').slideDown();
                resizePlot()
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
                makeRows();
            }
            break;
        case 'trigdown':
            triggerDownload();
            break
    }
});

