//########################### regression fit ########################
function clearFit(lm = false) {
    Plotly.deleteTraces(figurecontainer, 1);
    enableMenu(['extend', 'fill', 'filter', 'af', 'arf', lm ? 'rgfit' : 'lmfit'])
    lm ? Plotly.relayout(figurecontainer, { annotations: [{ text: '', showarrow: false }] }) :
        document.getElementById('formulaStr').innerHTML = ' '
    setTimeout(resizePlot, 300)
}


function saveFit() {

    let dirname = path.dirname(fileNames[currentEditable]);
    let filename = path.basename(fileNames[currentEditable], path.extname(fileNames[currentEditable]));
    let extn = path.extname(fileNames[currentEditable]);
    let save_name = path.join(dirname, filename + "_fit" + extn);

    var tmp_name = dialog.showSaveDialogSync({
        title: "Save As:",
        defaultPath: save_name
    });
    if (tmp_name === undefined) return

    try {
        var txt = transpose([dpsx, dpsy, fitY]).map(i => i.join('\t')).join('\n')
        fs.writeFileSync(tmp_name, txt);
        showStatus("Data Saved in file " + replaceWithHome(tmp_name));
        saved = true;
    } catch (error) {
        showStatus("Something went wrong! Couldn't save the data...")
        return false;
    }
}



var fitY;
function polyfit() {
    let n = parseInt($('#polyInp').val())
    if (n >= dpsx.length) {
        showStatus(`Fitting of order ${n} is not possible.`); return
    }
    let [fity, coeff] = regressionFit(dpsx, dpsy, n)
    fitY = fity
    Plotly.restyle(figurecontainer, { 'x': [dpsx], 'y': [fity] }, 1)

    document.getElementById('formulaStr').innerHTML = 'y = ' + coeff.map((el, i) => {
        if (i == 0) return el.toPrecision(5)
        return `${el > 0 ? '+' : ''}${el.toPrecision(5)}${i > 1 ? `x<sup>${i}</sup>` : 'x'}`
    }).join(' ')

}


//########################### LM FIT ##############################
function lmfit() {
    // use a form and parse multiple values
    let funcStr = $('#funcStr').val()
    let paramList = $('#paramList').val().split(',')
    let maxIter = parseInt($('#iterationVal').val())
    let parameters = $('#intVal').val().split(',').map(x => parseFloat(x))
    let maxVal = $('#maxVal').val().split(',').map(x => parseFloat(x))
    let minVal = $('#minVal').val().split(',').map(x => parseFloat(x))
    let dampVal = parseFloat($('#dampVal').val())
    let stepVal = parseFloat($('#stepVal').val())
    let etVal = parseFloat($('#etVal').val())
    let egVal = parseFloat($('#egVal').val())

    let [fity, params, chiError] = levenMarFit(dpsx, dpsy, funcStr, paramList, maxIter, parameters, maxVal, minVal, dampVal, stepVal, etVal, egVal)

    let anotX = 0.5, anotY = 1;
    if (figurecontainer.layout.annotations != undefined) {  // persists annotation if already used
        anotX = figurecontainer.layout.annotations[0].x
        anotY = figurecontainer.layout.annotations[0].y
    }

    anotText = `y = ${$('#funcStr').val()}<br>
                ${$('#paramList').val().split(',').join(', ')} = ${params.map(x => x.toPrecision(5)).join(', ')}
                <br>&#967;<sup>2</sup> Error = ${chiError.toPrecision(5)}`
    Plotly.update(figurecontainer, { x: [dpsx], y: [fity] }, {
        annotations: [{
            xref: 'paper', x: anotX,
            yref: 'paper', y: anotY,
            showarrow: false,
            text: anotText,
            bordercolor: '#000000'
        }]
    },
        1)
    fitY = fity
}

