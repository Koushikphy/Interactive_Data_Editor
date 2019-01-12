const electron = require('electron');
const path = require('path');
const url = require('url');
var mainWindow,win;
process.env.NODE_ENV = 'production';

const {app, BrowserWindow, Menu, ipcMain,shell} = electron;



ipcMain.on("back", function(e,d){
    mainWindow.webContents.send("back",d);
})

ipcMain.on("rf",function(e,d){
    mainWindow.webContents.send("rf",d);
})


app.on('ready', function(){
    mainWindow = new BrowserWindow({show:false,minWidth:1200,icon:path.join(__dirname,"charts.png"), webPreferences: {nodeIntegration: true}});
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes:true
    }));
    mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function(){
    app.quit();
    })
    Menu.setApplicationMenu(homeMenu);
    mainWindow.show()
});


const homeMenuTemplate =  [
    {

        label: 'File',
        submenu:[
            {
                label : "Open file",
                accelerator:process.platform == 'darwin' ? 'Command+O' : 'Ctrl+O',
                click(){
                    mainWindow.webContents.send("menuTrigger","open");
                }
            },
            {
                label: 'Recent Files',
                id:'rf',
                submenu:[],
            },
            {
                label: "Open file for compare",
                enabled:false,
                id:"openc",
                click(){
                    mainWindow.webContents.send("menuTrigger","openc")
                }
            },
            {
                label: "Show compare data",
                id:'compf',
                type: "checkbox",
                checked: true,
                visible : false,
                click(){
                    mainWindow.webContents.send("menuTrigger","compf")
                }
            },
            {type:'separator'},
            {
                label : "Save",
                enabled:false,
                id:'save',
                accelerator:process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click(){
                    mainWindow.webContents.send("menuTrigger","save");
                }
            },
            {
                label : "Save As",
                enabled:false,
                id:'saveas',
                accelerator:process.platform =='darwin' ? 'Command+Ctrl+S' : 'Shift+Ctrl+S',
                click(){
                    mainWindow.webContents.send("menuTrigger","saveas");
                }
            },

            {type:'separator'},
            {
                label:'Go Home',
                accelerator:process.platform == 'darwin' ? 'Command+H' : 'Ctrl+H',
                click(){
                    mainWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'index.html'),
                    protocol: 'file:',
                    slashes:true
                    }));
                    var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);
                    Menu.setApplicationMenu(homeMenu);
                }
            },
            {
                label:'Reload',
                accelerator:process.platform == 'darwin' ? 'Command+R' : 'Ctrl+R',
                click(){
                    mainWindow.reload();
                }
            },
            {type:'separator'},
            {
                label:'Quit',
                accelerator:process.platform == 'darwin' ? 'Command+Q' : 'Ctrl+Q',
                click(){
                    app.quit();
                },
            }
        ]
    },
    {
        label: "Data",
        submenu:[
            {
                label : "Plot along",
                id:'pa',
                enabled: false,
                submenu : [
                {
                    label: "X",
                    id:'pax',
                    type:"checkbox",
                    checked:false,
                    click(){
                        Menu.getApplicationMenu().getMenuItemById("pay").checked = false;
                        mainWindow.webContents.send("menuTrigger","pa");
                    }
                },
                {
                    label : "Y",
                    id : "pay",
                    type:"checkbox",
                    checked:true,
                    click(){
                        Menu.getApplicationMenu().getMenuItemById("pax").checked = false;
                        mainWindow.webContents.send("menuTrigger","pa");
                    }
                }
                ]
            },
            {
                label: "CS somoothing",
                id:'cs',
                enabled:false,
                accelerator:process.platform =='darwin' ? 'D' : 'D',
                click(){
                    mainWindow.webContents.send("menuTrigger","cs");
                }
            },
            {
                label: "MA Smoothing",
                id:'ma',
                enabled:false,
                accelerator:process.platform =='darwin' ? 'M' : 'M',
                click(){
                    mainWindow.webContents.send("menuTrigger","ma");
                }
            },
            {
                label: "Change Sign",
                enabled:false,
                id:'cg',
                accelerator:process.platform =='darwin' ? 'C' : 'C',
                click(){
                    mainWindow.webContents.send("menuTrigger","csign");
                }
            },
            {
                label: "Undo/Redo",
                enabled:false,
                id:'un',
                accelerator:process.platform =='darwin' ? 'Command+Z' : 'Ctrl+Z',
                click(){
                    mainWindow.webContents.send("menuTrigger","undo");
                }
            },
            {
                label:"Points not movable horaizontally",
                enabled: false,
                checked:true,
                type: "checkbox",
                id:"pamh",
                click(){
                    mainWindow.webContents.send("menuTrigger","pamh")
                }
            }
        ]
    },
    {
        label: "Window",
        submenu: [
            {
                label: "3D Wireframe Plot",
                enabled:false,
                id:"wire",
                click(){
                    mainWindow.webContents.send("menuTrigger","wire")
                }
            },
            {
                label : "3D Surface Plot",
                enabled:false,
                id:"surf",
                click(){
                    mainWindow.webContents.send("menuTrigger","surface")
                }
            },
            {
                label : "Spreadsheet",
                enabled:false,
                id:"spr",
                click(){
                    mainWindow.webContents.send("menuTrigger","spread")
                }
            },
        ]
    },
    {
        label : "Help",
        submenu:[
            {
                label: "Help",
                click(){
                    var childWindow = new BrowserWindow({icon: path.join(__dirname, 'charts.png')});
                    childWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'help.html'),
                    protocol: 'file:',
                    slashes:true
                    }));
                    childWindow.setMenu(null);
                }
            },
            {
                label: "About",
                click(){
                    var childWindow = new BrowserWindow({width:500,height:500});
                    childWindow.loadURL(url.format({
                    pathname: path.join(__dirname, 'about.html'),
                    protocol: 'file:',
                    slashes:true
                    }));
                    childWindow.setMenu(null);
                }
            },
            {
                label: "Check for updates",
                click(){
                    shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor/releases");
                }
            }
        ]
    }
];

var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);