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


function openFileFromArgs(fileList){
    if(!fileList.length) return
    window.onload =()=>{ // path and fileReader still not available
        try{
            var files = fileList.map(e=>path.resolve(process.cwd(),e))
            fileReader(files[0])
            for (let i = 1; i < files.length; i++) {
                addNewFile(files[i])
                
            }
        } catch (error){
            console.log(error)
        }
    }
}
// lets just consider anything that does not start with `-/--` is a file passed through the commandline
var fileList = remote.process.argv.slice(1).filter(e=>!(e.startsWith('-') || e.startsWith('--')|| e.trim()=='.'))
if (app.isPackaged) {
    if(fileList.length){
        openFileFromArgs(fileList)
    } else{
        require('../lib/particles.min');
        document.getElementById('particle').style.opacity = 1
    }
    require('../js/version').versionCheck()
} else {
    document.getElementById('particle').remove();
    if(fileList.length) openFileFromArgs(fileList)
}
