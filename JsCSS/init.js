const req = require("request");
const { remote, ipcRenderer, shell } = require('electron');
const { dialog, BrowserWindow, Menu, MenuItem, app } = remote;
var undoStack = [], redoStack = [], editorWindow, viewer = [, ,],
    recentLocation = '',
    recentFiles = [], show = false,
    saved = true, compFName, firstSave = true;


function versionCheck() {
    var today = new Date()
    var today = today.getDate() + '' + today.getMonth()
    if (today == JSON.parse(localStorage.getItem("today"))) return
    localStorage.setItem("today", JSON.stringify(today))
    req({
        'url': "https://api.github.com/repos/Koushikphy/Interactive-Data-Editor/releases/latest",
        'headers': {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36});'
        }
    },
        function (_, _, body) {
            var new_ver = JSON.parse(body).name
            console.log(new_ver)
            if (new_ver != "v2.3.0") {
                var txt = `A new version of the software ${new_ver} is available.\n Do you wnat to downlod it now?`
                var res = dialog.showMessageBox({
                    type: "question",
                    title: "Update available!!!",
                    message: txt,
                    buttons: ['OK', "Cancel"]
                })
                if (!res) {
                    shell.openExternal("https://github.com/Koushikphy/Interactive-Data-Editor/releases")
                }
            }
        })
};


function replaceWithHome(name) {
    var home = process.env.HOME || process.env.USERPROFILE;
    if (name.includes(home)) {
        return name.replace(home, "~")
    } else {
        return name
    }
};



function recentMenu() {
    var rrf = menu.getMenuItemById("rf").submenu;
    rrf.clear();
    for (let i = recentFiles.length - 1; i >= 0; i--) {
        var fln = replaceWithHome(recentFiles[i].slice())
        var item = {
            label: fln,
            click() {
                ipcRenderer.send("rf", recentFiles[i]);
            }
        };
        rrf.append(new MenuItem(item));
    }
    localStorage.setItem("files", JSON.stringify(recentFiles));
};



var menu = Menu.getApplicationMenu();
versionCheck();

var fl = JSON.parse(localStorage.getItem("files"));
if (fl !== null) {
    recentFiles = fl;
    recentMenu();
}

var fl = JSON.parse(localStorage.getItem("recent"));
if (fl !== null) {
    recentLocation = fl;
}