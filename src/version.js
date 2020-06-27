function versionCheck() {
    let req = require("request");
    req({
            'url': "https://api.github.com/repos/Koushikphy/Interactive-Data-Editor/releases/latest",
            'headers': {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/29.0.1521.3 Safari/537.36});'
            }
        },
        function (_, _, body) {
            var new_ver = JSON.parse(body).name
            var body = JSON.parse(body).body
            console.log(body, new_ver)
            if (new_ver != `v${require('../package.json').version}`) {
                var txt = `A new version of the software ${new_ver} is available.\n Do you want to download it now?`
                var res = dialog.showMessageBoxSync({
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

setTimeout(function(){ if (app.isPackaged) versionCheck() },5000)