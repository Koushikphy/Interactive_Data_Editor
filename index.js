require('v8-compile-cache');
const electron = require('electron');
const path = require('path');
// const url = require('url');
var mainWindow = null;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.env.NODE_ENV = 'production';

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell,
} = electron;

const gotTheLock = app.requestSingleInstanceLock()

if(!gotTheLock){
    app.quit()
} else{
    app.on('second-instance', (event, commandLine, workingDirectory) => {
        if (mainWindow) {
          if (mainWindow.isMinimized()) mainWindow.restore()
          mainWindow.focus()
        }
      })
}

ipcMain.on("back", function (e, d) {
    mainWindow.webContents.send("back", d);
})

ipcMain.on("plotsetting", function (e, d) {
    mainWindow.webContents.send("plotsetting", d);
})


ipcMain.on("colchanged", function (e, d) {
    mainWindow.webContents.send("colchanged", d);
})

ipcMain.on("exportAll", function (e, d) {
    mainWindow.webContents.send("exportAll", d);
})


ipcMain.on('checkClose', function (e, d) {
    mainWindow.destroy();
    app.quit();
})


const fs = require('fs')
const file = path.join(app.getPath('userData'),'ide.conf')
var info = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,"utf8")) :{}


// for capturing proxy authentication request
let reservedLoginCallback = null
let proxyPopUp = null
let loginCount = 0
ipcMain.on('authSubmitted', (_, {id, password}) => {
    proxyPopUp.close()
    reservedLoginCallback(id, password)
    reservedLoginCallback = null
    info.proxy = {"id":id, "password":password} 
    fs.writeFileSync(file,JSON.stringify(info, null, 4))
})



app.on('ready', function () {
    // capture proxy auth request
    app.on('login', (event, webContents, request, authInfo, callback) => {
        if (!authInfo.isProxy) return // not proxy related login
        if (loginCount > 5) return // try for login 5 times if fails then just ignore
        event.preventDefault()
        var aInfo = info.proxy;
        // console.log(aInfo, loginCount);
        if(aInfo && loginCount==0){ // loginCount>0 means proxy was not autheticated
            callback(aInfo.id,aInfo.password);
        }else {
            reservedLoginCallback = callback
            if(proxyPopUp) proxyPopUp.close() // discard multiple popups
            proxyPopUp = new BrowserWindow({
                width: 400, 
                height: 200, 
                show:false,
                modal:true, 
                parent:mainWindow,
                autoHideMenuBar:true,
                title:"Sign In",
                resizable:false,
                webPreferences: {
                    nodeIntegration: true,
                    enableRemoteModule: true,
                    contextIsolation:false
                },})
            proxyPopUp.loadFile("src/html/auth.html")
            proxyPopUp.once('ready-to-show',()=>{
                proxyPopUp.webContents.send('details', authInfo)
                proxyPopUp.show();
            })
            proxyPopUp.once('closed',()=>{proxyPopUp=null})

        }
        loginCount++
    }
)

    mainWindow = new BrowserWindow({
        show: false,
        minWidth: 1200,
        title: "Interactive Data Editor",
        icon: path.join(__dirname, "figs/charts.png"),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false
        },
    });
    mainWindow.maximize();
    mainWindow.loadFile('./src/html/index.html')

    mainWindow.on('close', function (e) {
        e.preventDefault();
        mainWindow.webContents.send('checkClose', 'isCloseAble');
    })
    Menu.setApplicationMenu(homeMenu);
    mainWindow.show()
});


const helpMenu = {
    label: "Help",
    submenu: [{
            label: "Documentation",
            click() {
                var childWindow = new BrowserWindow({
                    show: false,
                    minWidth: 1200,
                    minHeight: 700,
                    title: "Interactive Data Editor - Documentation",
                    icon: path.join(__dirname, 'figs/charts.png'),
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        contextIsolation:false
                    }
                });
                childWindow.loadFile('src/html/doc.html')
                childWindow.maximize();
                childWindow.setMenuBarVisibility(false);
                childWindow.once('ready-to-show',childWindow.show)
            }
        }, {
            label: "Sample Data",
            click() {
                var childWindow = new BrowserWindow({
                    icon: path.join(__dirname, 'figs/charts.png'),
                    resizable : false,
                    maxWidth : 400,
                    width:400,
                    title: "Interactive Data Editor - Sample Data",
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        contextIsolation:false
                    }
                });
                childWindow.loadFile('src/html/data.html')
                childWindow.setMenuBarVisibility(false);;
            }
        },

        {
            label: "Homepage",
            click() {
                shell.openExternal("https://koushikphy.github.io/Interactive_Data_Editor/");
            }
        },
        {
            label: "About",
            click() {
                var childWindow = new BrowserWindow({
                    icon: path.join(__dirname, 'figs/charts.png'),
                    minWidth: 500,
                    maxWidth : 700,
                    width:600,
                    show:false,
                    title: "Interactive Data Editor - About",
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        contextIsolation:false
                    },
                    height:650
                });
                childWindow.loadFile('./src/html/about.html')
                childWindow.setMenuBarVisibility(false);
                childWindow.once('ready-to-show',childWindow.show)
            }
        },
        { 
            role: 'toggledevtools',
            visible: false
        }
    ]
}





const homeMenuTemplate = [
    {
        label: 'File',
        submenu: [{
                label: "Open file",
                accelerator: 'CmdOrCtrl+O',
                click() {
                    mainWindow.webContents.send("menuTrigger", "open");
                }
            },
            {
                label: 'Recent Files',
                id: 'rf',
                submenu: [],
            },
            {
                type: 'separator'
            },
            {
                label: "Add file",
                accelerator: 'CmdOrCtrl+Shift+O',
                enabled: false,
                id: 'af',
                click() {
                    mainWindow.webContents.send("menuTrigger", "add");
                }
            },
            {
                label: 'Add Recent Files',
                enabled: false,
                id: 'arf',
                submenu: [],
            },
            {
                type: 'separator'
            },
            {
                label: "Save",
                enabled: false,
                id: 'save',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    mainWindow.webContents.send("menuTrigger", "save");
                }
            },
            {
                label: "Save As",
                enabled: false,
                id: 'saveas',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    mainWindow.webContents.send("menuTrigger", "saveas");
                }
            },
            {
                label : "Export as image",
                click() {
                    mainWindow.webContents.send("menuTrigger", "trigdown");
                }
            }
            ,{
                label : "Auto Save",
                id: 'autosave',
                submenu:[
                    {
                        label : "Off",
                        checked: false,
                        type: "checkbox",
                        click() {
                            mainWindow.webContents.send("menuTrigger", "autosave0");
                        }
                    },
                    {
                        label : "1 min",
                        checked: false,
                        type: "checkbox",
                        click() {
                            mainWindow.webContents.send("menuTrigger", "autosave1");
                        }
                    },
                    {
                        label : "5 min",
                        checked: false,
                        type: "checkbox",
                        click() {
                            mainWindow.webContents.send("menuTrigger", "autosave5");
                        }
                    },
                    {
                        label : "10 min",
                        checked: false,
                        type: "checkbox",
                        click() {
                            mainWindow.webContents.send("menuTrigger", "autosave10");
                        }
                    }
                ]
            },
            {
                type: 'separator'
            },
            {
                label: "3D plotter",
                click() {
                    mainWindow.loadFile('./src/html/Plotter.html')
                    Menu.setApplicationMenu(plotMenu);
                }
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click() {
                    mainWindow.webContents.send('windowReload','closeExtra')
                    BrowserWindow.getAllWindows().forEach((window) => {
                        if(mainWindow!=window) window.close()
                      })
                    var men = Menu.getApplicationMenu();
                    for (let i of ['save', 'saveas', 'tfs','tpl', '3dview', "spr", 'af', 'arf', 'tax', 'swapen', "edat", "fill", "filter", 'rgft', 'lmfit']) {
                        men.getMenuItemById(i).enabled = false;
                    }
                    mainWindow.reload();
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click() {
                    app.quit();
                },
            }
        ]
    },
    {
        label: "View",
        submenu: [
            {
                label: 'Open Plot Settings',
                accelerator: 'CmdOrCtrl+K',
                id: 'tfs',
                enabled: false,
                click() {
                    mainWindow.webContents.send("menuTrigger", "pdash")
                }
            },{
                label: "Toggle Axis",
                accelerator: 'CmdOrCtrl+W',
                id: 'tax',
                enabled: false,
                click(){
                    mainWindow.webContents.send("menuTrigger", "tax");
                }
            },{
                label: 'Toggle Plot List',
                accelerator: 'CmdOrCtrl+B',
                id: 'tpl',
                enabled: false,
                click() {
                    mainWindow.webContents.send("menuTrigger", "tplots")
                }
            },{
                label: "Toggle Swapper",
                enabled: false,
                id: 'swapen',
                click() {
                    mainWindow.webContents.send("menuTrigger", "tswap")
                }
            },{
                role: 'togglefullscreen' 
            }
        ]
    },
    {
        label: "Edit",
        submenu: [{
            label: "Fill Values",
            enabled: false,
            id: "fill",
            click() {
                mainWindow.webContents.send("menuTrigger", "fill")
            }
        }, {
            label: "Extend Data",
            id: "edat",
            enabled: false,
            click() {
                mainWindow.webContents.send("menuTrigger", "edat")
            }
        }, {
            label: "Filter Data",
            id: 'filter',
            enabled: false,
            click() {
                mainWindow.webContents.send('menuTrigger', 'filter')
            }
        },{
            label: "Auto smoother",
            enabled: false,
            id: 'smt',
            click() {
                mainWindow.webContents.send("menuTrigger", "smt")
            }
        },{
            label: "Points movable horaizontally",
            checked: false,
            type: "checkbox",
            id :"pamh",
            click() {
                mainWindow.webContents.send("menuTrigger", "pamh")
            }
        },
      ]
    },
    {
        label: "Fitting",
        submenu: [
            {
                label: "Polynomial Regression Fitting",
                enabled: false,
                id:"rgft",
                click() {
                    mainWindow.webContents.send("menuTrigger", "rgft")
                }
            },{
                label: "Levenberg-Marquardt Fitting",
                enabled: false,
                id :"lmfit",
                click() {
                    mainWindow.webContents.send("menuTrigger", "lmfit")
                }
            }
        ]
    },
    {
        label: "Window",
        submenu: [{
                label: "3D Plot Viewer",
                enabled: false,
                id: "3dview",
                click() {
                    mainWindow.webContents.send("menuTrigger", "3dview")
                }
            },
            {
                label: "Spreadsheet",
                enabled: false,
                id: "spr",
                click() {
                    mainWindow.webContents.send("menuTrigger", "spread")
                }
            },
        ]
    },
    helpMenu
];

var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);



const plotMenuTemplate = [
    {
    label: 'File',
    submenu: [
        {
            label: "Open file",
            accelerator: 'CmdOrCtrl+O',
            click() {
                mainWindow.webContents.send("menuTrigger", "open");
            }
        },
        {
            label: "Add file",
            click() {
                mainWindow.webContents.send("menuTrigger", "add");
            }
        },
        {
            label: "Load Configuration",
            enabled: false,
            click() {
                mainWindow.webContents.send("menuTrigger", "lcon");
            }
        },
        {
            label: "Save Configuration",
            enabled: false,
            click() {
                mainWindow.webContents.send("menuTrigger", "scon");
            }
        },{
            label : "Export as image",
            click() {
                mainWindow.webContents.send("menuTrigger", "trigdown");
            }
        },{
            type: 'separator'
        },
        {
            label : "Open Plot Settings",
            accelerator: 'CmdOrCtrl+K',
            click(){
                mainWindow.webContents.send("menuTrigger", 'pdash')
            }
        },
        {
            label : "Toggle Top Bar",
            click(){
                mainWindow.webContents.send("menuTrigger", 'topbar')
            }
        },
        {
            type: 'separator'
        },
        {
            label: "Toggle Fullscreen",
            accelerator: "F11",
            click() {
                if (mainWindow.isFullScreen()) {
                    mainWindow.setFullScreen(false);
                } else {
                    mainWindow.setFullScreen(true);
                }
                mainWindow.webContents.send("menuTrigger", "fullscreen")

            }
        },{
            label: "Home",
            click(){
                mainWindow.loadFile('./src/html/index.html')
                Menu.setApplicationMenu(homeMenu);
            }
        },
        {
            label: 'Reload',
            accelerator: 'CmdOrCtrl+R',
            click() {
                mainWindow.reload();
            }
        },
        {
            label: 'Quit',
            accelerator: 'CmdOrCtrl+Q',
            click() {
                app.quit();
            },
        }
    ]
    },
    helpMenu
];


var plotMenu  = Menu.buildFromTemplate(plotMenuTemplate);