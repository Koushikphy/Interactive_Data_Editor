const req = require("request");
const {
    remote,
    ipcRenderer,
    shell
} = require('electron');
const {
    dialog,
    BrowserWindow,
    Menu,
    MenuItem,
    app
} = remote;
var recentLocation, recentFiles = [];


function versionCheck() {
    // var today = new Date()
    // var today = today.getDate() + '' + today.getMonth()
    // if (today == JSON.parse(localStorage.getItem("today"))) return;
    // localStorage.setItem("today", JSON.stringify(today))
    req({
            'url': "https://api.github.com/repos/Koushikphy/Interactive-Data-Editor/releases/latest",
            'headers': {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36});'
            }
        },
        function (_, _, body) {
            var new_ver = JSON.parse(body).name
            console.log(new_ver)
            if (new_ver != "v2.6.0") {
                var txt = `A new version of the software ${new_ver} is available.\n Do you wnat to downlod it now?`
                var res = dialog.showMessageBox({
                    type: "question",
                    title: "Update available!!!",
                    message: txt,
                    buttons: ['OK', "Cancel"]
                })
                if (!res) {
                    shell.openExternal("https://koushikphy.github.io/ide/#download--installation")
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
    var arf = menu.getMenuItemById("arf").submenu;
    if (recentFiles.length > 10) {
        recentFiles.splice(0, 1);
    }
    rrf.clear();
    arf.clear();
    for (let i = recentFiles.length - 1; i >= 0; i--) {
        var fln = replaceWithHome(recentFiles[i].slice())
        var item = {
            label: fln,
            click() {
                ipcRenderer.send("rf", recentFiles[i]);
            }
        };
        var item2 = {
            label: fln,
            click() {
                ipcRenderer.send("adrf", recentFiles[i]);
            }
        };
        rrf.append(new MenuItem(item));
        arf.append(new MenuItem(item2));

    }
    localStorage.setItem("files", JSON.stringify(recentFiles));
};

//in dev mode don't load animation directly go to plot
// const particlesJS = require('particles.js');
// window.particlesJS.load('particle', '../lib/particles.json');
if (app.isPackaged) {
    versionCheck();
    if (remote.process.argv.length > 1) {
        window.onload = function () {
            fileReader(remote.process.argv[1])
        };
    } else {
        const particlesJS = require('particles.js');
        window.particlesJS.load('particle', '../lib/particles.json');
    }
} else {
    document.getElementById("branding").remove()
    document.getElementById('particle').remove();
    document.getElementById('full').style.display = 'block';
    if (remote.process.argv.length > 2) {
        window.onload = function () {
            fileReader(remote.process.argv[2])
        };
    };
}


var menu = Menu.getApplicationMenu();

var fl = JSON.parse(localStorage.getItem("files"));
if (fl !== null) {
    recentFiles = fl;
    recentMenu();
}

var fl = JSON.parse(localStorage.getItem("recent"));
if (fl !== null) {
    recentLocation = fl;
}


function closeThis(m){
    $(m).parent().slideUp();
    resizePlot();
}


