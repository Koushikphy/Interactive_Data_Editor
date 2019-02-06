const electron = require('electron');
const path = require('path');
const url = require('url');
var mainWindow;
process.env.NODE_ENV = 'production';

const { app, BrowserWindow, Menu, ipcMain, shell } = electron;


function isDev() {
    const isEnvSet = 'ELECTRON_IS_DEV' in process.env;
    const getFromEnv = parseInt(process.env.ELECTRON_IS_DEV, 10) === 1;
    return isEnvSet ? getFromEnv : !app.isPackaged
}



ipcMain.on("back", function (e, d) {
    mainWindow.webContents.send("back", d);
})

ipcMain.on("rf", function (e, d) {
    mainWindow.webContents.send("rf", d);
})


ipcMain.on('checkClose', function (eg, d) {
    mainWindow.destroy();
    app.quit();
})


app.on('ready', function () {
    mainWindow = new BrowserWindow({
        show: false,
        minWidth: 1200,
        icon: path.join(__dirname, "charts.png"),
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'HTML/all.html'),
        protocol: 'file:',
        slashes: true
    }));
    if (isDev()) mainWindow.webContents.openDevTools();
    // mainWindow.on('closed', function(){
    // app.quit();
    // })
    mainWindow.on('close', function (e) {
        e.preventDefault();
        mainWindow.webContents.send('checkClose', 'isCloseAble');
    })
    Menu.setApplicationMenu(homeMenu);
    mainWindow.show()
});


const homeMenuTemplate = [{

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
        label: "Open file for compare",
        enabled: false,
        id: "openc",
        click() {
            mainWindow.webContents.send("menuTrigger", "openc")
        }
    },
    {
        label: "Show compare data",
        id: 'compf',
        type: "checkbox",
        checked: true,
        visible: false,
        click() {
            mainWindow.webContents.send("menuTrigger", "compf")
        }
    },
    {
        type: 'separator'
    },
    {
        label: "Save",
        enabled: false,
        id: 'save',
        accelerator: 'CmdOrCtrl++S',
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
        type: 'separator'
    },
    {
        label: "3D plotter",
        click() {
            var childWindow = new BrowserWindow();
            childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'HTML/Plotter.html'),
                protocol: 'file:',
                slashes: true
            }));
            childWindow.maximize();
            childWindow.setMenu(null);
        }
    },
    {
        label: 'Go Home',
        accelerator: 'CmdOrCtrl+H',
        click() {
            mainWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'index.html'),
                protocol: 'file:',
                slashes: true
            }));
            var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);
            Menu.setApplicationMenu(homeMenu);
        }
    },
    {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click() {
            mainWindow.reload();
            for (let i of ['save', 'saveas', 'cs', 'ma', 'cg', 'un', 'wire', 'surf', "spr", 'openc', 'pamh', 'pax']) {
                Menu.getApplicationMenu().getMenuItemById(i).enabled = false;
            }
            Menu.getApplicationMenu().getMenuItemById("compf").visible = false;
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
    label: "Edit",
    submenu: [{
        label: "CS somoothing",
        id: 'cs',
        enabled: false,
        accelerator: 'D',
        click() {
            mainWindow.webContents.send("menuTrigger", "cs");
        }
    },
    {
        label: "MA Smoothing",
        id: 'ma',
        enabled: false,
        accelerator: 'M',
        click() {
            mainWindow.webContents.send("menuTrigger", "ma");
        }
    },
    {
        label: "Change Sign",
        enabled: false,
        id: 'cg',
        accelerator: 'C',
        click() {
            mainWindow.webContents.send("menuTrigger", "csign");
        }
    },
    {
        label: "Undo/Redo",
        enabled: false,
        id: 'un',
        accelerator: 'CmdOrCtrl+Z',
        click() {
            mainWindow.webContents.send("menuTrigger", "undo");
        }
    },
    {
        label: "Points not movable horaizontally",
        enabled: false,
        checked: true,
        type: "checkbox",
        id: "pamh",
        click() {
            mainWindow.webContents.send("menuTrigger", "pamh")
        }
    }
    ]
},
{
    label: "Data",
    submenu: [{
        label: "Plot along X",
        id: 'pax',
        visible: true,
        click() {
            Menu.getApplicationMenu().getMenuItemById("pax").visible = false;
            Menu.getApplicationMenu().getMenuItemById("pay").visible = true;
            mainWindow.webContents.send("menuTrigger", "pa");
        }
    }, {
        label: 'Plot along Y',
        id: 'pay',
        visible: false,
        click() {
            Menu.getApplicationMenu().getMenuItemById("pax").visible = true;
            Menu.getApplicationMenu().getMenuItemById("pay").visible = false;
            mainWindow.webContents.send("menuTrigger", "pa");
        }
    }, {
        label: "Open Swapper",
        enabled: false,
        id: 'swapen',
        click() {
            mainWindow.webContents.send("menuTrigger", "swapen")
        }
    }, {
        label: "Exit Swapper",
        id: 'swapex',
        visible: false,
        click() {
            mainWindow.webContents.send("menuTrigger", "swapex")
        }
    }, {
        label: "Fill Missing Values",
        enabled: false,
        id: "fill",
        click() {
            mainWindow.webContents.send("menuTrigger", "fill")
        }
    }, {
        label: "Extend Data",
        id: "edat",
        enabled: "false",
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
    }

    ]
},
{
    label: "Window",
    submenu: [{
        label: "3D Wireframe Plot",
        enabled: false,
        id: "wire",
        click() {
            mainWindow.webContents.send("menuTrigger", "wire")
        }
    },
    {
        label: "3D Surface Plot",
        enabled: false,
        id: "surf",
        click() {
            mainWindow.webContents.send("menuTrigger", "surface")
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
    {
        label: "Toggle Fullscreen",
        accelerator: "F11",
        click() {
            if (mainWindow.isFullScreen()) {
                mainWindow.setFullScreen(false);
            } else {
                mainWindow.setFullScreen(true);
            }
            setTimeout(function () {
                mainWindow.webContents.send("menuTrigger", "fullscreen")
            }, 100)
        }
    }
    ]
},
{
    label: "Help",
    submenu: [{
        label: "Help",
        click() {
            var childWindow = new BrowserWindow({
                icon: path.join(__dirname, 'charts.png'),
                webPreferences: {
                    nodeIntegration: true
                }
            });
            childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'help.html'),
                protocol: 'file:',
                slashes: true
            }));
            childWindow.setMenuBarVisibility(false);;
        }
    }, {
        label: "Sample Data",
        click() {
            var childWindow = new BrowserWindow();
            childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'data.html'),
                protocol: 'file:',
                slashes: true
            }));
            childWindow.setMenuBarVisibility(false);;
        }
    },

    {
        label: "Homepage",
        click() {
            shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor");
        }
    },
    {
        label: "About",
        click() {
            var childWindow = new BrowserWindow();
            childWindow.loadURL(url.format({
                pathname: path.join(__dirname, 'about.html'),
                protocol: 'file:',
                slashes: true
            }));
            childWindow.setMenuBarVisibility(false);;
        }
    },
    ]
}
];

var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);