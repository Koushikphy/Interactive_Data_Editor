
var minWidth = window.innerWidth / 4.5

$('#split-bar').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar').offset().left;
        if (x > minWidth && x < window.innerWidth / 2.5) {
            $('#sidebar').css("width", x - 2);
            $('#full').css("margin-left", x);
            resizePlot()
        }
    })
});


$('#split-bar2').mousedown(function (e) {
    e.preventDefault();
    $(document).mousemove(function (e) {
        e.preventDefault();
        var x = e.pageX - $('#sidebar2').offset().left;
        if (x > minWidth && x < window.innerWidth / 2.5) {
            $('#sidebar2').css("width", x - 2);
            $('#full').css("margin-left", x);
            $('#jsoneditor').css("width", x - 7);
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
    lines = { Title, Markers, Line }
    layout = figurecontainer.layout
    editor.update({ lines, layout })
}


var options = {
    onChangeJSON: function (json) {
        Plotly.update(figurecontainer,
            {
                name: json.lines.Title,
                marker: json.lines.Markers,
                line: json.lines.Line
            },
            json.layout)
        makeRows();
    },
    onColorPicker: function (parent, color, onChange) {
        new JSONEditor.VanillaPicker({
            parent: parent,
            color: color,
            popup: 'bottom',
            onChange: function (color) {
                var alpha = color.rgba[3]
                var hex = (alpha === 1)
                    ? color.hex.substr(0, 7)
                    : color.hex
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
};

var editor = new JSONEditor(
    document.getElementById('jsoneditor'),
    options,
    {
        "lines": '',
        "layout": ''
    });


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
    Plotly.deleteTraces(figurecontainer, index);
    //take special care if 0 deleted i.e the editable trace
    if (figurecontainer.data.length == 1) {
        Plotly.restyle(figurecontainer,
            {
                marker: {
                    symbol: 200,
                    color: '#b00'
                },
                line: {
                    width: 2,
                    color: "#1e77b4",
                }
            });
    }
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
}



function copyFile(row) {
    index = $('.copyfile').index(row);
    data = fullData[index]
    fullData.unshift(fullData[index]);
    fullDataCols.unshift(JSON.parse(JSON.stringify(fullDataCols[index])));
    fileNames.unshift(fileNames[index]);
    addTrace();
}




function makeRows() {
    // iterate this over filenames
    tmp = '<ol>'
    for (let i = 0; i < fileNames.length; i++) {
        name = fileNames[i];
        ccll = fullDataCols[i];
        name = path.basename(name, path.extname(name))
        tmp += `<li onclick='getInd(this)'>
        <input type="button" class = 'closefile' value="X">
        <input type="button" class = 'copyfile' value="C">
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