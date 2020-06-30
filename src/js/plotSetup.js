var points;
const figurecontainer = document.getElementById("figurecontainer");
const Plotly = require('plotly.js-gl3d-dist');
const { layout, colorList, iniPointsD } = require('../js/plotUtils')
const { downloadImage } = require('../js/download')



const pop = document.getElementById('popup')
const popMain = document.getElementById('popmain')
const titletxt = document.getElementById('titletxt')
function triggerDownload() {
    popMain.innerHTML = `&ensp; File Name:<input type="text" id= "dfileName"><br>
            &ensp; File Type: <select id="fileFormat">
            <option>PDF</option>
            <option>JPEG</option>
                    <option>PNG</option>
                    <option>SVG</option>
                    <option>WEBP</option>
                </select><br>
            &ensp; Resolution: <input type="text" id="imRes" value="1920x1080">
            <br>
            <div style='text-align:center;margin-top:10px'>
                <input type="submit" value="OK" onclick="downloadImage($('#dfileName').val(), $('#imRes').val(), $('#fileFormat').val());closePop();">
            </div>`
        pop.style.width = 'fit-content'
        titletxt.innerHTML = 'Save Image'
        popMain.style.textAlign = 'left'
        // openPop()
        pop.style.visibility='visible'
        pop.style.opacity = 1
}

var mode={
    displaylogo:false,
    editable: true,
    responsive: true,
    modeBarButtonsToRemove : ["toImage","sendDataToCloud"],
    modeBarButtonsToAdd    : [
        [
            {
                name: 'Save the image',
                icon: Plotly.Icons.camera,
                click: triggerDownload
            }
        ]
    ]
}

// Plotly.newPlot(figurecontainer, [clone(iniPointsD)], layout, mode);
Plotly.newPlot(figurecontainer, [iniPointsD], layout, mode);
points = figurecontainer.querySelector(".scatterlayer .trace:first-of-type .points").getElementsByTagName("path");
