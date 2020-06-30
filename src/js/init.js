require('v8-compile-cache');
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

var menu = Menu.getApplicationMenu();

var fl = JSON.parse(localStorage.getItem("files"));
if (fl !== null) {
    recentFiles = fl;
    recentMenu();
}

var fl = JSON.parse(localStorage.getItem("recent"));
if (fl !== null) recentLocation = fl;


function getFile(params) {
    console.log(params)
    try {
        if(params.starswith('-') || params.starswith('--')) return false
        let file =  path.resolve(process.cwd(),params)
        fileReader(file)
    } catch (error) {
        console.log(error)
    }
}


//in dev mode don't load animation directly go to plot
if (app.isPackaged) {
    if (remote.process.argv.length > 1) {
        window.onload = function () {
            getFile(remote.process.argv[1])
        };
    } else {
        require('../lib/particles.min');
        document.getElementById('particle').style.opacity = 1
    }
} else {
    document.getElementById('particle').remove();
    if (remote.process.argv.length > 2) {
        window.onload = function () {
            getFile(remote.process.argv[2])
        };
    };
}
