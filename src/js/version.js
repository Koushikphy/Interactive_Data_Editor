function versionCheck() {
    const lastChecked = store.get('lastChecked')
    const t = new Date();
    const today= `${t.getDate()}${t.getMonth()}${t.getFullYear()}`
    if(lastChecked==today) return  // check just once a day
    fetch('https://api.github.com/repos/Koushikphy/Interactive_Data_Editor/releases/latest')
    .then(response => response.json())
    .then(data => {
        var body = data.body
        var new_ver = data.tag_name
        var cur_var = `v${require('../../package.json').version}`
        console.log(body, new_ver)
        store.set('lastChecked',today)
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

module.exports = {
    versionCheck
}