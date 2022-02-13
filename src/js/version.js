function _versionCheck() {
    fetch('https://api.github.com/repos/Koushikphy/Interactive_Data_Editor/releases/latest')
    .then(response => response.json())
    .then(data => {
        var body = data.body
        var new_ver = data.tag_name
        var cur_var = `v${require('../../package.json').version}`
        console.log(body, new_ver)
        if (new_ver != cur_var) {
            var res = dialog.showMessageBoxSync({
                type: "question",
                title: "Update available!!!",
                message: `A new version of the software ${new_ver} is available.\nDo you want to download it now?`,
                buttons: ['OK', "Cancel"]
            })
            if (!res) {
                shell.openExternal("https://koushikphy.github.io/Interactive_Data_Editor/")
            }
        }
    })
}

function versionCheck(){
    setTimeout(_versionCheck, 3000)
}

module.exports = {
    versionCheck
}