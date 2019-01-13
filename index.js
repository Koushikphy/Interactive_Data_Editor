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
        pathname: path.join(__dirname, 'HTML/all.html'),
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
                accelerator: 'CmdOrCtrl+O',
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
                accelerator: 'CmdOrCtrl++S',
                click(){
                    mainWindow.webContents.send("menuTrigger","save");
                }
            },
            {
                label : "Save As",
                enabled:false,
                id:'saveas',
                accelerator:'CmdOrCtrl+Shift+S',
                click(){
                    mainWindow.webContents.send("menuTrigger","saveas");
                }
            },

            {type:'separator'},
            {
                label:'Go Home',
                accelerator: 'CmdOrCtrl+H',
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
                accelerator: 'CmdOrCtrl+R',
                click(){
                    mainWindow.reload();
                    for (let i of ['save', 'saveas', 'cs', 'ma', 'cg', 'un','wire','surf', "spr",'openc','pamh','pa']){
                        Menu.getApplicationMenu().getMenuItemById(i).enabled = false;
                    }
                    Menu.getApplicationMenu().getMenuItemById("compf").visible = false;
                }
            },
            {type:'separator'},
            {
                label:'Quit',
                accelerator: 'CmdOrCtrl+Q',
                click(){
                    app.quit();
                },
            }
        ]
    },
    {
        label : "Edit",
        submenu:[
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
                accelerator:'D',
                click(){
                    mainWindow.webContents.send("menuTrigger","cs");
                }
            },
            {
                label: "MA Smoothing",
                id:'ma',
                enabled:false,
                accelerator:'M',
                click(){
                    mainWindow.webContents.send("menuTrigger","ma");
                }
            },
            {
                label: "Change Sign",
                enabled:false,
                id:'cg',
                accelerator:'C',
                click(){
                    mainWindow.webContents.send("menuTrigger","csign");
                }
            },
            {
                label: "Undo/Redo",
                enabled:false,
                id:'un',
                accelerator: 'CmdOrCtrl+Z',
                click(){
                    mainWindow.webContents.send("menuTrigger","undo");
                }
            },

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
            },{
                label:"Open Swapper",
                enabled:false,
                id:'swapen',
                click(){
                    mainWindow.webContents.send("menuTrigger","swapen")
                }
            },{
                label :"Exit Swapper",
                id:'swapex',
                visible:false,
                click(){
                    mainWindow.webContents.send("menuTrigger","swapex")
                }
            },
            {
                label : "Toggle Fullscreen",
                accelerator: "F11",
                click(){
                    if (mainWindow.isFullScreen()) {
                        mainWindow.setFullScreen(false);
                    } else{
                        mainWindow.setFullScreen(true);
                    }
                    mainWindow.webContents.send("menuTrigger","fullscreen")
                }
            }
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
                label: "Homepage",
                click(){
                    shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor");
                }
            }
        ]
    }
];

var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);