const electron = require('electron');
const path = require('path');
const url = require('url');

var mainWindow,win;
process.env.NODE_ENV = 'production';

const {app, BrowserWindow, Menu, ipcMain} = electron;



ipcMain.on("menu",function(e,d){
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    mainWindow.setMenu(mainMenu);
})


ipcMain.on("back", function(e,d){
    mainWindow.webContents.send("back",d);
})

app.on('ready', function(){
    mainWindow = new BrowserWindow({show:false,minWidth:1200,icon:path.join(__dirname,"icons/charts.png")});
    mainWindow.maximize();
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes:true
    }));
    // mainWindow.webContents.openDevTools();
    mainWindow.on('closed', function(){
    app.quit();
    })

    const falseMenu = Menu.buildFromTemplate(falseMenuTemplate);
    mainWindow.setMenu(falseMenu);
    mainWindow.show()
});




const mainMenuTemplate =  [
        {
        label: 'File',
        submenu:[
        {
            label : "Save",
            accelerator:process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
            click(){
                mainWindow.webContents.send("data","save");
            }
        },
        {
            label : "Save As",
            accelerator:process.platform =='darwin' ? 'Command+Ctrl+S' : 'Shift+Ctrl+S',
            click(){
                mainWindow.webContents.send("data","saveas");
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
                slashes:true,
                }));
                const falseMenu = Menu.buildFromTemplate(falseMenuTemplate);
                mainWindow.setMenu(falseMenu);
            },

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
            accelerator:process.platform =='darwin' ? 'D' : 'D',
            click(){
                mainWindow.webContents.send("data","cs");
            }
        },
        {
            label: "MA Smoothing",
            accelerator:process.platform =='darwin' ? 'M' : 'M',
            click(){
                mainWindow.webContents.send("data","ma");
            }
        },
        {
            label: "Change Sign",
            accelerator:process.platform =='darwin' ? 'C' : 'C',
            click(){
                mainWindow.webContents.send("data","csign");
            }
        },
        {
            label: "Undo/Redo",
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
                var childWindow = new BrowserWindow({icon: path.join(__dirname, 'icons/charts.ico')});
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
        ]
    }
];


const falseMenuTemplate =  [
        {
        label: 'File',
        submenu:[
            {
                label : "Save",
                enabled:false,
                accelerator:process.platform == 'darwin' ? 'Command+S' : 'Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","save");
                }
            },
            {
                label : "Save As",
                enabled:false,
                accelerator:process.platform =='darwin' ? 'Command+Ctrl+S' : 'Shift+Ctrl+S',
                click(){
                    mainWindow.webContents.send("data","saveas");
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
            enabled:false,
            accelerator:process.platform =='darwin' ? 'D' : 'D',
            click(){
                mainWindow.webContents.send("data","cs");
            }
        },
        {
            label: "MA Smoothing",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'M' : 'M',
            click(){
                mainWindow.webContents.send("data","ma");
            }
        },
        {
            label: "Change Sign",
            enabled:false,
            accelerator:process.platform =='darwin' ? 'C' : 'C',
            click(){
                mainWindow.webContents.send("data","csign");
            }
        },
        {
            label: "Undo/Redo",
            enabled:false,
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
                var childWindow = new BrowserWindow({icon: path.join(__dirname, 'icons/charts.ico')});
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
        ]
    }
];