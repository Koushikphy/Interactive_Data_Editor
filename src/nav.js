
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
        Plotly.update(figurecontainer, {
            name: json.lines.Title,
            marker: json.lines.Markers,
            line: json.lines.Line
        },
            json.layout)
    },
    onColorPicker: function (parent, color, onChange) {
        new JSONEditor.VanillaPicker({
            parent: parent,
            color: color,
            popup: 'bottom',
            onChange: function (color) {
                console.log('onChange', color)
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






function ind(input) {
    var ind = $('li').index(input)
    selectEditable(ind)
}


function removeRow(row) {
    if (fullData.length == 1) return
    index = $('.closefile').index(row)
    fullData.splice(index, 1);
    fullDataCols.splice(index, 1);
    fileNames.splice(index, 1);
    updatePlotTrace()

}

function makeRows() {
    // iterate this over filenames
    tmp = '<ol>'
    for (let name of fileNames) {
        name = path.basename(name, path.extname(name))
        tmp += `<li onclick='ind(this)'>
        <input type="button" class = 'closefile' value="X">
        <label class='filename' >${name}</label>
        </li>`;
    }
    tmp += '</ol>'
    $('#files').html(tmp)
    $("li .closefile").click(function (e) {
        removeRow(this)
        e.stopPropagation();
    });
}