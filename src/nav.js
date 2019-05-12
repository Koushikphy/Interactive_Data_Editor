var minWidth = window.innerWidth / 4.5

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > minWidth / 5.0 && x < window.innerWidth / 2.5) {
            $('#sidebar').css("width", x - 2);
            $('#full').css("margin-left", x);
            minWidth = x;
            resizePlot()
        }
    })
});


$('#split-bar2').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar2').offset().left;
        if (x > minWidth / 5.0 && x < window.innerWidth / 2.5) {
            $('#sidebar2').css("width", x - 2);
            $('#full').css("margin-left", x);
            $('#jsoneditor').css("width", x - 7);
            minWidth = x;
            resizePlot()
        }
    })
});


$(document).mouseup(function (e) {
    $(document).unbind('mousemove');
});


function openNav() {
    closeNav2();
    $('#split-bar').css("width", 5);
    $('#sidebar').css("width", minWidth);
    $('#full').css("margin-left", minWidth + 6);
    $('.ham').toggle();
    resizePlot()
}


function closeNav() {
    $('#split-bar').css("width", 0);
    $('#sidebar').css("width", 0);
    $('#full').css("margin-left", 0);
    $('.ham').toggle();
    resizePlot()

}

function openNav2() {
    closeNav();
    $('#split-bar2').css("width", 5);
    $('#sidebar2').css("width", minWidth);
    $('#jsoneditor').css("width", minWidth - 5);
    $('#full').css("margin-left", minWidth + 6);
    $('.ham').toggle()
    resizePlot()
}


function closeNav2() {
    $('#split-bar2').css("width", 0);
    $('#sidebar2').css("width", 0);
    $('#full').css("margin-left", 0);
    $('#jsoneditor').css("width", 195);
    $('.ham').toggle()
    resizePlot()
}


function updateJSON() {
    var Title = []
    var Markers = []
    var Line = []
    for (let trace of figurecontainer.data) {
        Title.push(trace.name)
        Markers.push(trace.marker)
        Line.push(trace.line)
    }
    lines = {
        Title,
        Markers,
        Line
    }
    layout = figurecontainer.layout
    editor.update({
        lines,
        layout
    })
}

var symbols = []
for (let i = 0; i <= 44; i++) {
    symbols.push(i.toString());
    symbols.push((i + 100).toString());
    symbols.push((i + 200).toString())
}

var schema = {
    "properties": {
        'lines': {
            "properties": {
                "Line": {
                    "items": {
                        "properties": {
                            "width": {
                                "type": 'integer'
                            },
                            "dash": {
                                "type": 'integer'
                            },
                            "shape": {
                                "enum": ['linear', 'spline']
                            }
                        }
                    }
                },
                "Markers": {
                    "items": {
                        "properties": {
                            "symbol": {
                                "type": "integer"
                            },
                            "size": {
                                "type": "number"
                            },
                            "opacity": {
                                "type": "number"
                            }
                        }
                    }
                }
            }
        }
    }
}


var options = {
    onChangeJSON: function (json) {
        legendNames = json.lines.Title //.map(x => x.replace(/([ :0-9])$/g, ''))
        Plotly.restyle(figurecontainer, {
            name: json.lines.Title,
            marker: json.lines.Markers,
            line: json.lines.Line
        })
        Plotly.relayout(figurecontainer, json.layout)
        makeRows();
    },
    onColorPicker: function (parent, color, onChange) {
        new JSONEditor.VanillaPicker({
            parent: parent,
            color: color,
            popup: 'bottom',
            onChange: function (color) {
                var alpha = color.rgba[3]
                var hex = (alpha === 1) ?
                    color.hex.substr(0, 7) :
                    color.hex
                onChange(hex)
            },
            //   onDone: function (color) {
            //     console.log('onDone', color)
            //   },
            //   onClose: function (color) {
            //     console.log('onClose', color)
            //   }
        }).show();
    },
    mode: 'form',
    schema: schema
};

var jsoneditor = document.getElementById('jsoneditor')
var editor = new JSONEditor(
    jsoneditor,
    options, {
        "lines": '',
        "layout": ''
    });
$('#jsoneditor').height(window.innerHeight - jsoneditor.offsetTop)

function getInd(input) {
    var ind = $('li').index(input)
    selectEditable(ind)
}


function removeRow(row) {
    if (fullData.length == 1) return
    index = $('.closefile').index(row)
    fullData.splice(index, 1);
    fullDataCols.splice(index, 1);
    fileNames.splice(index, 1);
    saveNames.splice(index, 1);
    legendNames.splice(index, 1);
    Plotly.deleteTraces(figurecontainer, index);
    makeRows();
    makeEditable();
    var col = fullDataCols[0]
    if (ddd) {
        xCol.selectedIndex = col.x;
        yCol.selectedIndex = col.y;
        zCol.selectedIndex = col.z;
    } else {
        xCol.selectedIndex = col.y;
        yCol.selectedIndex = col.z;
    }
    if (index == 0) {
        marker = [{
            symbol: 200,
            color: '#b00',
            size: 6,
            opacity: 1
        }]
        line = [{
            width: 2,
            color: "#1e77b4",
            dash: 0,
            shape: 'linear'
        }]
        for (let i = 1; i < figurecontainer.data.length; i++) {
            marker.push({
                symbol: 200,
                color: colorList[i % 9],
                size: 6,
                opacity: 1
            })
            line.push({
                width: 2,
                color: colorList[i % 9],
                dash: 0,
                shape: 'linear'
            })
        }
        col = fullDataCols[0];
        Plotly.restyle(figurecontainer, {
            line,
            marker
        });
    }
}



function copyFile(row) {
    index = $('.copyfile').index(row);
    data = fullData[index]
    fullData.unshift(fullData[index]);
    fullDataCols.unshift(JSON.parse(JSON.stringify(fullDataCols[index])));
    fileNames.unshift(fileNames[index]);
    saveNames.unshift(saveNames[index]);
    legendNames.unshift(legendNames[index])
    addTrace();
}




function makeRows() {
    // iterate this over filenames
    tmp = '<ol>'
    for (let i = 0; i < fileNames.length; i++) {
        name = fileNames[i];
        ccll = fullDataCols[i];
        name = path.basename(name)
        tmp += `<li onclick='getInd(this)'>
        <input type="button" title="Close this File" class = 'closefile' value="X">
        <input type="button" title="Copy this File" class = 'copyfile' value="C">
        <label class='filename' >${name} ${ccll.y + 1}:${ccll.z + 1}</label>
        </li>`;
    }
    tmp += '</ol>'
    $('#files').html(tmp)
    $("li .closefile").click(function (e) {
        removeRow(this)
        e.stopPropagation();
    });
    $("li .copyfile").click(function (e) {
        copyFile(this)
        e.stopPropagation();
    });
    updateJSON()
}