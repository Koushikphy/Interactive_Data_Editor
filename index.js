require('v8-compile-cache');
const electron = require('electron');
const path = require('path');
const url = require('url');
var mainWindow;
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true';
process.env.NODE_ENV = 'production';

const {
    app,
    BrowserWindow,
    Menu,
    ipcMain,
    shell,
    screen
} = electron;


ipcMain.on("back", function (e, d) {
    mainWindow.webContents.send("back", d);
})

ipcMain.on("plotsetting", function (e, d) {
    mainWindow.webContents.send("plotsetting", d);
})


ipcMain.on("rf", function (e, d) {
    mainWindow.webContents.send("rf", d);
})


ipcMain.on("adrf", function (e, d) {
    mainWindow.webContents.send("adrf", d);
})



ipcMain.on('checkClose', function (eg, d) {
    mainWindow.destroy();
    app.quit();
})


app.on('ready', function () {
    mainWindow = new BrowserWindow({
        show: false,
        // width: screen.getPrimaryDisplay().workAreaSize.width,
        // height: screen.getPrimaryDisplay().workAreaSize.height,
        minWidth: 1200,
        title: "Interactive Data Editor",
        icon: path.join(__dirname, "figs/charts.png"),
        webPreferences: {
            nodeIntegration: true
        }
    });
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'html/index.html'),
        protocol: 'file:',
        slashes: true
    }));
    if (!app.isPackaged) mainWindow.webContents.openDevTools();
    // mainWindow.webContents.openDevTools();
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
            }
            ,{
                label : "Export as image",
                click() {
                    mainWindow.webContents.send("menuTrigger", "trigdown");
                }
            },
            {
                type: 'separator'
            },
            {
                label: "3D plotter",
                // enabled: false,
                click() {
                    mainWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'html/Plotter.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    Menu.setApplicationMenu(plotMenu);
                    if (!app.isPackaged) mainWindow.webContents.openDevTools();
                }
            },
            {
                label: 'Reload',
                accelerator: 'CmdOrCtrl+R',
                click() {
                    mainWindow.reload();
                    var men = Menu.getApplicationMenu();
                    for (let i of ['save', 'saveas', 'tfs', '3dview', "spr", 'af', 'arf',  'pax', 'swapen', "edat", "fill", "filter", 'rgft', 'lmfit']) {
                        men.getMenuItemById(i).enabled = false;
                    }
                    men.getMenuItemById("pax").visible = true;
                    men.getMenuItemById('pay').visible = false;
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
            }, {
                label: "Plot along X",
                accelerator: 'CmdOrCtrl+W',
                id: 'pax',
                visible: true,
                enabled: false,
                click() {
                    Menu.getApplicationMenu().getMenuItemById("pax").visible = false;
                    Menu.getApplicationMenu().getMenuItemById("pay").visible = true;
                    mainWindow.webContents.send("menuTrigger", "pa");
                }
            }, {
                label: 'Plot along Y',
                accelerator: 'CmdOrCtrl+W',
                id: 'pay',
                visible: false,
                click() {
                    Menu.getApplicationMenu().getMenuItemById("pax").visible = true;
                    Menu.getApplicationMenu().getMenuItemById("pay").visible = false;
                    mainWindow.webContents.send("menuTrigger", "pa");
                }
            }, {
                label: "Toggle Swapper",
                enabled: false,
                id: 'swapen',
                click() {
                    mainWindow.webContents.send("menuTrigger", "tswap")
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
                    mainWindow.webContents.send("menuTrigger", "fullscreen")
    
                }
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
            label: "Points movable horaizontally",
            // enabled: false,
            checked: false,
            type: "checkbox",
            id :"pamh",
            click() {
                mainWindow.webContents.send("menuTrigger", "pamh")
            }
        },
        // {
        //     label: "Ranged selector",
        //     // enabled: false,
        //     checked: false,
        //     type: "checkbox",
        //     id:"rsch",
        //     click() {
        //         mainWindow.webContents.send("menuTrigger", "rsch")
        //     }
        // },
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
            // {
            //     label: "3D Surface Plot",
            //     enabled: false,
            //     id: "surf",
            //     click() {
            //         mainWindow.webContents.send("menuTrigger", "surface")
            //     }
            // },{
            //     label: "3D Wireframe Plot",
            //     enabled: false,
            //     id: "wire",
            //     click() {
            //         mainWindow.webContents.send("menuTrigger", "wire")
            //     }
            // },
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
    {
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
                            nodeIntegration: true
                        }
                    });
                    childWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'html/doc.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    childWindow.maximize();
                    childWindow.setMenuBarVisibility(false);
                    childWindow.show();
                }
            }, {
            //     label: "Keyboard Shortcuts",
            //     click() {
            //         var childWindow = new BrowserWindow({
            //             show: false,
            //             title: "Interactive Data Editor - Documentation",
            //             icon: path.join(__dirname, 'figs/charts.png'),
            //             webPreferences: {
            //                 nodeIntegration: true
            //             }
            //         });
            //         childWindow.loadURL(url.format({
            //             pathname: path.join(__dirname, 'html/doc.html'),
            //             protocol: 'file:',
            //             slashes: true
            //         }));
            //         childWindow.maximize();
            //         childWindow.setMenuBarVisibility(false);
            //         childWindow.webContents.openDevTools()
            //         childWindow.show();
            //         childWindow.webContents.send('doc','3');
            //     }
            // },{
                label: "Sample Data",
                click() {
                    var childWindow = new BrowserWindow({
                        icon: path.join(__dirname, 'figs/charts.png'),
                        title: "Interactive Data Editor - Sample Data",
                        webPreferences: {
                            nodeIntegration: true
                        }
                    });
                    childWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'html/data.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    childWindow.setMenuBarVisibility(false);;
                    // childWindow.webContents.openDevTools()
                }
            },

            {
                label: "Homepage",
                click() {
                    shell.openExternal("https://koushikphy.github.io/ide/");
                }
            },
            {
                label: "About",
                click() {
                    var childWindow = new BrowserWindow({
                        icon: path.join(__dirname, 'figs/charts.png'),
                        title: "Interactive Data Editor",
                        webPreferences: {
                            nodeIntegration: true
                        },
                        height:650
                    });
                    childWindow.loadURL(url.format({
                        pathname: path.join(__dirname, 'html/about.html'),
                        protocol: 'file:',
                        slashes: true
                    }));
                    childWindow.setMenuBarVisibility(false);
                    childWindow.webContents.openDevTools()

                }
            },
        ]
    }
];

var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);



const plotMenuTemplate = [{
    label: 'File',
    submenu: [{
            label: "Open file",
            accelerator: 'CmdOrCtrl+O',
            click() {
                mainWindow.webContents.send("menuTrigger", "open");
            }
        },
        {
            label: "Load Configuration",
            click() {
                mainWindow.webContents.send("menuTrigger", "lcon");
            }
        },
        {
            label: "Save Configuration",
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
            label : "Toggle Plot Settings",
            accelerator: 'CmdOrCtrl+K',
            click(){
                mainWindow.webContents.send("menuTrigger", 'side')
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
                mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'html/index.html'),
                    protocol: 'file:',
                    slashes: true
                }));
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

    {
    label: "Help",
    submenu: [{
            label: "Documentation",
            click() {
                var childWindow = new BrowserWindow({
                    show: false,
                    minWidth: 1200,
                    title: "Interactive Data Editor - Documentation",
                    icon: path.join(__dirname, 'figs/charts.png'),
                    webPreferences: {
                        nodeIntegration: true
                    }
                });
                childWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'html/doc.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                childWindow.maximize();
                childWindow.setMenuBarVisibility(false);
                childWindow.show();
            }
        }, {
            label: "Sample Data",
            click() {
                var childWindow = new BrowserWindow({
                    icon: path.join(__dirname, 'figs/charts.png'),
                    title: "Interactive Data Editor - Sample Data",
                    webPreferences: {
                        nodeIntegration: true
                    }
                });
                childWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'html/data.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                childWindow.setMenuBarVisibility(false);;
            }
        },

        {
            label: "Homepage",
            click() {
                shell.openExternal("https://koushikphy.github.io/ide/");
            }
        },
        {
            label: "About",
            click() {
                var childWindow = new BrowserWindow({
                    icon: path.join(__dirname, 'figs/charts.png'),
                    title: "Interactive Data Editor",
                    webPreferences: {
                        nodeIntegration: true
                    }
                });
                childWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'html/about.html'),
                    protocol: 'file:',
                    slashes: true
                }));
                childWindow.setMenuBarVisibility(false);
                // childWindow.webContents.openDevTools()
            }
        },
    ]
}
];


var plotMenu  = Menu.buildFromTemplate(plotMenuTemplate);