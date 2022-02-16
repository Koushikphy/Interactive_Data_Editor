require('v8-compile-cache');
const {remote,ipcRenderer,shell} = require('electron');
const {Menu,MenuItem,app} = remote;
const menu = Menu.getApplicationMenu();
const os = require('os');
const path   = require('path')
const fs     = require("fs");
const {replaceWithHome} = require('../js/utils')


class dataStore{
    constructor(){
        // every thing will be sotred in the `ide.conf` file
        this.file = path.join(app.getPath('userData'),'ide.conf')
        this.info = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file,"utf8")) :{}
    }
    get(key,optionalValue) {
        return this.info.hasOwnProperty(key) ? this.info[key]: optionalValue 
    }
    set(key, value){
        this.info[key] = value
        fs.writeFileSync(this.file,JSON.stringify(this.info, null, 4))
    }
}

const store = new dataStore()


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
    store.set('files', recentFiles)
};


var recentFiles =store.get('files',[]) 
if (recentFiles.length!=0) recentMenu();

var recentLocation = store.get('recent',os.userInfo().homedir)


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
// lets just consider anything that does not start with `-/--` is a file passed through the command line
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


var autoSave = parseInt(store.get('autosave',0)) // autosave file every, 0 means no autosave
var autoSaveMenuItems = menu.getMenuItemById('autosave').submenu.items;
autoSaveMenuItems.forEach(e=>{e.checked=false})
autoSaveMenuItems[{0:0,1:1,5:2,10:3}[autoSave]].checked = true
