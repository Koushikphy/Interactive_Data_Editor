const electron = require('electron');
const path = require('path');
const url = require('url');
// require('electron-reload')(__dirname);
var mainWindow,win;
process.env.NODE_ENV = 'production';

const {app, BrowserWindow, Menu, ipcMain,shell} = electron;



ipcMain.on("back", function(e,d){
    mainWindow.webContents.send("back",d);
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
                label : "Save",
                enabled:false,
                id:'save',
                accelerator:process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","save");
                }
            },
            {
                label : "Save As",
                enabled:false,
                id:'saveas',
                accelerator:process.platform =='darwin' ? 'Command+Ctrl+S' : 'Shift+Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","saveas");
                }
            },
            {
                label: 'Recent Files',
                id:'rf',
                submenu:[],
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
        label: "Edit",
        submenu:[
        {
            label: "CS somoothing",
            id:'cs',
            enabled:false,
            accelerator:process.platform =='darwin' ? 'D' : 'D',
            click(){
                mainWindow.webContents.send("data","cs");
            }
        },
        {
            label: "MA Smoothing",
            id:'ma',
            enabled:false,
            accelerator:process.platform =='darwin' ? 'M' : 'M',
            click(){
                mainWindow.webContents.send("data","ma");
            }
        },
        {
            label: "Change Sign",
            enabled:false,
            id:'cg',
            accelerator:process.platform =='darwin' ? 'C' : 'C',
            click(){
                mainWindow.webContents.send("data","csign");
            }
        },
        {
            label: "Undo/Redo",
            enabled:false,
            id:'un',
            accelerator:process.platform =='darwin' ? 'Command+Z' : 'Ctrl+Z',
            click(){
                mainWindow.webContents.send("data","undo");
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
            label: "Check for updates",
            click(){
                shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor/releases");
            }
        }
        ]
    }
];
var homeMenu = Menu.buildFromTemplate(homeMenuTemplate);