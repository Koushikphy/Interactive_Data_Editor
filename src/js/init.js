require('v8-compile-cache');
const {remote,ipcRenderer,shell} = require('electron');
const {Menu,MenuItem,app} = remote;
const menu = Menu.getApplicationMenu();

var recentLocation, recentFiles = [];


function replaceWithHome(name) { // replaces full path name with the short one
    var home = process.env.HOME || process.env.USERPROFILE;
    if (name.includes(home)) {
        return name.replace(home, "~")
    } else {
        return name
    }
};

function recentMenu() {// builds the recent file submenu
    var rrf = menu.getMenuItemById("rf").submenu;
    var arf = menu.getMenuItemById("arf").submenu;
    if (recentFiles.length > 10) recentFiles.splice(0, 1);
    rrf.clear(); arf.clear();

    for(let rc of recentFiles){
        let fln = replaceWithHome(rc)
        rrf.insert(0,new MenuItem({
            label: fln,
            click() {fileReader(rc)}
        }));
        arf.insert(0,new MenuItem({
            label: fln,
            click() {addNewFile(rc)}
        }))
    }
    localStorage.setItem("files", JSON.stringify(recentFiles));
};


var fl = JSON.parse(localStorage.getItem("files"));
if (fl !== null) {
    recentFiles = fl;
    recentMenu();
}

var fl = JSON.parse(localStorage.getItem("recent"));
if (fl !== null) recentLocation = fl;


function getFile(params) { // get the filename from the argument list
    try {
        // console.log(params)
        // console.log(typeof(params))
        if(params.startsWith('-') || params.startsWith('--')) return false
        let file =  path.resolve(process.cwd(),params)
        fileReader(file)
    } catch (error) {
        console.log(error)
    }
}

if (app.isPackaged) {
    if (remote.process.argv.length > 1) {
        window.onload = function () {
            getFile(remote.process.argv[1])
        };
    } else {
        require('../lib/particles.min');
        document.getElementById('particle').style.opacity = 1
    }
    require('../js/version').versionCheck()
} else {
    document.getElementById('particle').remove();
    if (remote.process.argv.length > 2) {
        window.onload = function () {
            getFile(remote.process.argv[2])
        };
    };
}
