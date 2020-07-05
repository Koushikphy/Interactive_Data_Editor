const path   = require('path')
const fs  = require("fs")

module.exports.downloadImage = (fileName, res, type) => {
// function downloadImage(fileName, res, type){
    res = res.split("x")
    type = type.toLocaleLowerCase()
    if(!fileName) fileName = 'plot'
    if (type =='pdf'){
        fileName+='.pdf'
        exportPDF({width: parseFloat(res[0]), height:parseFloat(res[1])}).then(pdfData=>{
            var tmp_name = dialog.showSaveDialogSync({
                title: "Save As:",
                defaultPath: path.join(recentLocation, fileName),
                filters: [{
                    name: 'PDF',
                    extensions: ['pdf']
                  }]
            });
            if (tmp_name === undefined) return
            fs.writeFileSync(tmp_name, pdfData)
        })
    }else{
        Plotly.downloadImage(figurecontainer, {filename: fileName, format: type, width: res[0], height: res[1]});
    }
}


function exportPDF({ width=1920, height=1080}={}){
    return new Promise((resolve,reject)=>{ 
        var printOpts = {
            marginsType: 1,
            printBackground: true,
            pageSize: {
                width: (width + 6) / 0.00377957517575025,
                height: (height + 6) / 0.00377957517575025
            }
        }
        var html =  window.encodeURIComponent(`<!DOCTYPE html>
        <html>
        <head>
        <meta charset="UTF-8">
        <style>
        body {
            margin: 0;
            padding: 0;
            background-color: 'rgba(0,0,0,0)'
        }
        </style>
        </head>
        <body><img/></body>
        </html>`);
        Plotly.toImage(figurecontainer, {format: 'svg', width, height}).then(imgdata => {
            var win = new remote.BrowserWindow({width, height, show: false})
            win.on('closed', () => {win = null})
            win.loadURL(`data:text/html,${html}`);
            
            win.webContents.executeJavaScript(`new Promise((resolve, reject) => {
                const img = document.body.firstChild
                img.onload = resolve
                img.onerror = reject
                img.src = "${imgdata}"
                setTimeout(() => reject(new Error('too long to load image')), ${3000})
            });0`).then(()=>{

                win.webContents.printToPDF(printOpts).then(pdfData=>resolve(pdfData)).catch(err=>reject(err))
                }).catch((err) => {
                    reject(err)
                    console.log(err)
                    win.close()
                })
        })
    })
}


// module.exports = {
//     downloadImage : downloadImage
// }
