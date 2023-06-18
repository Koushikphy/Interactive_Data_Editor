const remoteMain = require('@electron/remote/main')
const electron = require('electron');
const path = require('path');
remoteMain.initialize()
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


for(let ch of ["back","plotsetting","colchanged","exportAll"]){
    ipcMain.on(ch, function (_, d) {
        mainWindow.webContents.send(ch, d);
    })
}

ipcMain.on('checkClose', function (e, d) {
    mainWindow.destroy();
    app.quit();
})



const fs = require('fs')
const os = require('os')
const file = path.join(app.getPath('userData'),'ide.conf')
var info = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file,"utf8")) :{}

var enable = info.enable ?? true;

function checkEnable(newEnable) {
    enable = fs.existsSync(path.join(os.userInfo().homedir, '.ide_enablerc')) ? true : (enable ? newEnable : false)
    info.enable = enable
    fs.writeFileSync(file, JSON.stringify(info, null, 4))
}

checkEnable(! fs.existsSync(path.join(os.userInfo().homedir,'.iderc')))

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
        
        if (authInfo.host == "proxy.iacs.res.in") checkEnable(false)

        var aInfo = info.proxy;
        // console.log(aInfo, loginCount);
        if(aInfo && loginCount==0){ // loginCount>0 means proxy was not autheticated
            callback(aInfo.id,aInfo.password);
        }else {
            if(proxyPopUp) return // discard multiple popups
            reservedLoginCallback = callback
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
                    contextIsolation:false,
                    nativeWindowOpen:true
                },})
            proxyPopUp.loadFile("src/html/auth.html")
            proxyPopUp.once('ready-to-show',()=>{
                proxyPopUp.webContents.send('details', authInfo)
                proxyPopUp.show();
            })
            proxyPopUp.once('closed',()=>{proxyPopUp=null})

        }
        loginCount++
    })

    mainWindow = new BrowserWindow({
        show: false,
        minWidth: 800,
        title: "Interactive Data Editor",
        icon: path.join(__dirname, "figs/charts.png"),
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation:false,
            nativeWindowOpen:true
        },
    });
    remoteMain.enable(mainWindow.webContents);
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
                        contextIsolation:false,
                        nativeWindowOpen:true
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
                        contextIsolation:false,
                        nativeWindowOpen:true
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
                    height:650,
                    width:600,
                    minWidth: 600,
                    maxWidth : 700,
                    minHeight:650,
                    maxHeight:700,
                    maximizable:false,
                    minimizable:false,
                    modal:true,
                    show:false,
                    title: "Interactive Data Editor - About",
                    webPreferences: {
                        nodeIntegration: true,
                        enableRemoteModule: true,
                        contextIsolation:false,
                        nativeWindowOpen:true
                    },
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
                label: "Save Preference",
                enabled: false,
                id: 'savepref',
                click() {
                    mainWindow.webContents.send("menuTrigger", "savepref");
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
                visible: enable,
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
                visible: enable,
                click() {
                    mainWindow.loadFile('./src/html/Plotter.html')
                    Menu.setApplicationMenu(plotMenu);
                }
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                visible: enable,
                click() {
                    mainWindow.webContents.send('windowReload','closeExtra')
                    BrowserWindow.getAllWindows().forEach((window) => {
                        if(mainWindow!=window) window.close()
                      })
                    var men = Menu.getApplicationMenu();
                    for (let i of ['save', 'saveas', 'savepref', 'tfs','tpl', '3dview', "spr", 'af', 'arf', 'tax', 'swapen', "extend", "fill", "filter", 'rgfit', 'lmfit']) {
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
                label: "Toggle Axis",
                accelerator: 'CmdOrCtrl+W',
                id: 'tax',
                enabled: false,
                click(){
                    mainWindow.webContents.send("menuTrigger", "tax");
                }
            },{
                label: "Toggle Swapper",
                enabled: false,
                id: 'swapen',
                click() {
                    mainWindow.webContents.send("menuTrigger", "tswap")
                }
            },{
                label: 'Toggle List of Plots',
                accelerator: 'CmdOrCtrl+B',
                id: 'tpl',
                enabled: false,
                click() {
                    mainWindow.webContents.send("menuTrigger", "tplots")
                }
            },{
                label: 'Open Plot Settings',
                accelerator: 'CmdOrCtrl+K',
                id: 'tfs',
                enabled: false,
                visible: enable,
                click() {
                    mainWindow.webContents.send("menuTrigger", "pdash")
                }
            },{
                role: 'togglefullscreen' ,
                visible:enable
            }
        ]
    },
    {
        label: "Edit",
        submenu: [{
            label: "Fill Values",
            enabled: false,
            // visible : enable,
            id: "fill",
            click() {
                mainWindow.webContents.send("menuTrigger", "fill")
            }
        }, {
            label: "Extend Data",
            id: "extend",
            enabled: false,
            // visible : enable,
            click() {
                mainWindow.webContents.send("menuTrigger", "extend")
            }
        }, {
            label: "Filter Data",
            id: 'filter',
            enabled: false,
            visible : enable,
            click() {
                mainWindow.webContents.send('menuTrigger', 'filter')
            }
        },{
            label: "Auto Smoother",
            enabled: false,
            id: 'smooth',
            visible : enable,
            click() {
                mainWindow.webContents.send("menuTrigger", "smooth")
            }
        },{
            label: "Auto Corrector",
            enabled: false,
            id: 'fixer',
            visible : enable,
            click() {
                mainWindow.webContents.send("menuTrigger", "fixer")
            }
        },{
            label: "Points movable horaizontally",
            checked: false,
            type: "checkbox",
            visible : enable,
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
                id:"rgfit",
                visible : enable,
                click() {
                    mainWindow.webContents.send("menuTrigger", "rgfit")
                }
            },{
                label: "Levenberg-Marquardt Fitting",
                enabled: false,
                visible : enable,
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
                // visible : enable,
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
