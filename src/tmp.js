

/**
 * Custom selection handler that selects points and cancels the default zoom behaviour
 */
function selectPointsByDrag(e) {

    // Select points
    Highcharts.each(this.series, function (series) {
        Highcharts.each(series.points, function (point) {
            if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max &&
                    point.y >= e.yAxis[0].min && point.y <= e.yAxis[0].max) {
                point.select(true, true);
            }
        });
    });

    // Fire a custom event
    // HighchartsAdapter.fireEvent(this, 'selectedpoints', { points: this.getSelectedPoints() });

    return false; // Don't zoom
}

/**
 * The handler for a custom event, fired from selection event
 */
// function selectedPoints(e) {
//     // Show a label
//     toast(this, '<b>' + e.points.length + ' points selected.</b>' +
//         '<br>Click on empty space to deselect.');
// }

/**
 * On click, unselect all points
 */
function unselectByClick() {
    var points = this.getSelectedPoints();
    if (points.length > 0) {
        Highcharts.each(points, function (point) {
            point.select(false);
        });
    }
}

chart: {
        type: 'scatter',
        events: {
            selection: selectPointsByDrag,
            // selectedpoints: selectedPoints,
            click: unselectByClick
        },
        zoomType: 'xy'
    }