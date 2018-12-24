/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 7);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */,
/* 1 */,
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */,
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


[__webpack_require__(8)].forEach(function (req) {
  req.keys().forEach(function (key) {
    req(key);
  });
});

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./border.spec.js": 9,
	"./calculator/viewportColumns.spec.js": 10,
	"./calculator/viewportRows.spec.js": 11,
	"./cell/coords.spec.js": 12,
	"./cell/range.spec.js": 13,
	"./core.spec.js": 14,
	"./event.spec.js": 15,
	"./filter/column.spec.js": 16,
	"./filter/row.spec.js": 17,
	"./scroll.spec.js": 18,
	"./scrollbar.spec.js": 19,
	"./scrollbarNative.spec.js": 20,
	"./selection.spec.js": 21,
	"./settings/columnHeaders.spec.js": 22,
	"./settings/preventOverflow.spec.js": 23,
	"./settings/rowHeaders.spec.js": 24,
	"./settings/stretchH.spec.js": 25,
	"./table.spec.js": 26
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number or string
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 8;

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableBorder', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $container = $('<div></div>');
    $wrapper = $('<div></div>');
    $container.width(100).height(200);
    $table = $('<table></table>');
    $container.append($wrapper);
    $wrapper.append($table);
    $container.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $container.remove();
  });
  it('should add/remove border to selection when cell is clicked', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    var $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
    var $top = $(wt.selections.getCell().getBorder(wt).top);
    var $right = $(wt.selections.getCell().getBorder(wt).right);
    var $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    var $left = $(wt.selections.getCell().getBorder(wt).left);
    $td1.simulate('mousedown');
    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(23);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(23);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(46);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(23);
    expect($left.position().left).toBe(0);
    $td2.simulate('mousedown');
    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(46);
    expect($top.position().left).toBe(49);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(46);
    expect($right.position().left).toBe(99);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(69);
    expect($bottom.position().left).toBe(49);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(46);
    expect($left.position().left).toBe(49);
  });
  it('should add/remove border to selection when cell is clicked and the table has only one column', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    var $top = $(wt.selections.getCell().getBorder(wt).top);
    var $right = $(wt.selections.getCell().getBorder(wt).right);
    var $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    var $left = $(wt.selections.getCell().getBorder(wt).left);
    $td1.simulate('mousedown');
    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(23);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(23);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(46);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(23);
    expect($left.position().left).toBe(0);
  });
  it('should properly add a selection border on an entirely selected column', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 2,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 1,
            color: 'red'
          }
        })
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    wt.selections.getCell().add(new Walkontable.CellCoords(4, 0));
    wt.draw(true);
    var $top = $(wt.selections.getCell().getBorder(wt).top);
    var $right = $(wt.selections.getCell().getBorder(wt).right);
    var $bottom = $(wt.selections.getCell().getBorder(wt).bottom);
    var $left = $(wt.selections.getCell().getBorder(wt).left);
    expect($top.css('height')).toBe('1px');
    expect($top.position().top).toBe(0);
    expect($top.position().left).toBe(0);
    expect($right.css('width')).toBe('1px');
    expect($right.position().top).toBe(0);
    expect($right.position().left).toBe(49);
    expect($bottom.css('height')).toBe('1px');
    expect($bottom.position().top).toBe(115);
    expect($bottom.position().left).toBe(0);
    expect($left.css('width')).toBe('1px');
    expect($left.position().top).toBe(0);
    expect($left.position().left).toBe(0);
  });
  it('should add/remove corner to selection when cell is clicked', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible: function cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({})
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    var $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
    var $corner = $(wt.selections.getCell().getBorder(wt).corner);
    $td1.simulate('mousedown');
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);
    $td2.simulate('mousedown');
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
  });
  it('should draw only one corner if selection is added between overlays', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 5,
      fixedColumnsLeft: 2,
      fixedRowsTop: 2,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current'
        }),
        area: new Walkontable.Selection({
          className: 'area',
          border: {
            cornerVisible: function cornerVisible() {
              return true;
            }
          }
        })
      })
    });
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(0, 0));
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(2, 2));
    wt.draw();
    var corners = $container.find('.wtBorder.corner:visible');
    expect(corners.length).toBe(1);
  });
  it('should move the fill handle / corner border to the left, if in the position it would overlap the container (e.g.: far-right)', function () {
    $container.css({
      overflow: 'hidden',
      width: '200px'
    });
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 4,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible: function cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({})
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
    var $td2 = $table.find('tbody tr:eq(3) td:eq(3)');
    var $td3 = $table.find('tbody tr:eq(2) td:eq(1)');
    var $corner = $(wt.selections.getCell().getBorder(wt).corner);
    $td1.simulate('mousedown');
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(42);
    expect($corner.position().left).toBe(45);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
    $td2.simulate('mousedown');
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(88);
    expect($corner.position().left).toBe(193);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
    $td3.simulate('mousedown');
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($corner.position().top).toBe(65);
    expect($corner.position().left).toBe(95);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });
  it('should move the fill handle / corner border to the top, if in the position it would overlap the container (e.g.: far-bottom)', function () {
    $container.css({
      overflow: 'hidden',
      height: 'auto',
      marginTop: '2000px'
    });
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 5,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible: function cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({})
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:last-of-type td:last-of-type');
    var $corner = $(wt.selections.getCell().getBorder(wt).corner);
    $td.simulate('mousedown');
    wt.draw();
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('116px');
    expect($corner.position().top).toBe(109); // table.height - corner.height - corner.borderTop

    expect($corner.position().left).toBe(45);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
  });
  it('should move the corner border to the top-left, if is not enough area on the bottom-right corner of container', function () {
    $container.css({
      overflow: 'hidden',
      height: 'auto',
      width: '50px',
      marginTop: '2000px',
      marginLeft: '2000px'
    });
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: 1,
      totalColumns: 1,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          border: {
            width: 2,
            color: 'green',
            cornerVisible: function cornerVisible() {
              return true;
            }
          }
        }),
        area: new Walkontable.Selection({})
      }),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:last-of-type td:last-of-type');
    var $corner = $(wt.selections.getCell().getBorder(wt).corner);
    $td.simulate('mousedown');
    wt.draw();
    expect($corner.css('width')).toBe('6px');
    expect($corner.css('height')).toBe('6px');
    expect($table.css('height')).toBe('24px');
    expect($corner.position().top).toBe(17); // table.height - corner.height - corner.borderTop

    expect($corner.position().left).toBe(43);
    expect($container[0].clientHeight === $container[0].scrollHeight).toBe(true);
    expect($container[0].clientWidth === $container[0].scrollWidth).toBe(true);
  });
});

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.ViewportColumnsCalculator', function () {
  function allColumns20() {
    return 20;
  }

  it('should render first 5 columns in unscrolled container', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(100, 0, 1000, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(100, 0, 1000, allColumns20, null, true);
    expect(calc.startColumn).toBe(0);
    expect(calc.startPosition).toBe(0);
    expect(calc.endColumn).toBe(4);
    expect(visibleCalc.startColumn).toBe(0);
    expect(visibleCalc.endColumn).toBe(4);
  });
  it('should render 6 columns, starting from 3 in container scrolled to half of fourth column', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(100, 70, 1000, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(100, 70, 1000, allColumns20, null, true);
    expect(calc.startColumn).toBe(3);
    expect(calc.startPosition).toBe(60);
    expect(calc.endColumn).toBe(8);
    expect(visibleCalc.startColumn).toBe(4);
    expect(visibleCalc.endColumn).toBe(7);
  });
  it('should render 10 columns, starting from 1 in container scrolled to half of fourth column (with render overrides)', function () {
    var overrideFn = function overrideFn(calc) {
      calc.startColumn -= 2;
      calc.endColumn += 2;
    };

    var calc = new Walkontable.ViewportColumnsCalculator(100, 70, 1000, allColumns20, overrideFn);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(100, 70, 1000, allColumns20, null, true);
    expect(calc.startColumn).toBe(1);
    expect(calc.startPosition).toBe(20);
    expect(calc.endColumn).toBe(10);
    expect(visibleCalc.startColumn).toBe(4);
    expect(visibleCalc.endColumn).toBe(7);
  });
  it('should return number of rendered columns', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(100, 50, 1000, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(100, 50, 1000, allColumns20, null, true);
    expect(calc.count).toBe(6);
    expect(visibleCalc.count).toBe(4);
  });
  it('should render all columns if their size is smaller than viewport', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(200, 0, 8, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(200, 0, 8, allColumns20, null, true);
    expect(calc.startColumn).toBe(0);
    expect(calc.endColumn).toBe(7);
    expect(calc.count).toBe(8);
    expect(visibleCalc.startColumn).toBe(0);
    expect(visibleCalc.endColumn).toBe(7);
    expect(visibleCalc.count).toBe(8);
  });
  it('should render all columns if their size is exactly the viewport', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(200, 0, 10, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(200, 0, 10, allColumns20, null, true);
    expect(calc.startColumn).toBe(0);
    expect(calc.endColumn).toBe(9);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startColumn).toBe(0);
    expect(visibleCalc.endColumn).toBe(9);
    expect(visibleCalc.count).toBe(10);
  });
  it('should render all columns if their size is slightly larger than viewport', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(199, 0, 10, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(199, 0, 10, allColumns20, null, true);
    expect(calc.startColumn).toBe(0);
    expect(calc.endColumn).toBe(9);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startColumn).toBe(0);
    expect(visibleCalc.endColumn).toBe(8);
    expect(visibleCalc.count).toBe(9);
  });
  it('should set null values if total columns is 0', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(200, 0, 0, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(200, 0, 0, allColumns20, null, true);
    expect(calc.startColumn).toBe(null);
    expect(calc.startPosition).toBe(null);
    expect(calc.endColumn).toBe(null);
    expect(calc.count).toBe(0);
    expect(visibleCalc.startColumn).toBe(null);
    expect(visibleCalc.endColumn).toBe(null);
  });
  it('should set null values if total columns is 0 (with overrideFn provided)', function () {
    var overrideFn = function overrideFn(myCalc) {
      myCalc.startColumn = 0;
      myCalc.endColumn = 0;
    };

    var calc = new Walkontable.ViewportColumnsCalculator(200, 0, 0, allColumns20, overrideFn);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(200, 0, 0, allColumns20, null, true);
    expect(calc.startColumn).toBe(null);
    expect(calc.startPosition).toBe(null);
    expect(calc.endColumn).toBe(null);
    expect(calc.count).toBe(0);
    expect(visibleCalc.startColumn).toBe(null);
    expect(visibleCalc.endColumn).toBe(null);
  });
  it('should scroll backwards if total columns is reached', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(190, 350, 20, allColumns20);
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(190, 350, 20, allColumns20, null, true);
    expect(calc.startColumn).toBe(10);
    expect(calc.startPosition).toBe(200);
    expect(calc.endColumn).toBe(19);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startColumn).toBe(11);
    expect(visibleCalc.endColumn).toBe(19);
  });
  it('should update stretchAllRatio after refreshStretching call (stretch: all)', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(250, 0, 20, allColumns20, null, true, 'all');
    expect(calc.stretchAllRatio).toBe(0);
    expect(calc.stretchLastWidth).toBe(0);
    calc.refreshStretching(414);
    expect(calc.stretchAllRatio).toBe(1.035);
    expect(calc.stretchLastWidth).toBe(0);
  });
  it('should update stretchAllRatio after refreshStretching call (stretch: last)', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(250, 0, 5, allColumns20, null, true, 'last');
    expect(calc.stretchAllRatio).toBe(0);
    expect(calc.stretchLastWidth).toBe(0);
    calc.refreshStretching(414);
    expect(calc.stretchAllRatio).toBe(0);
    expect(calc.stretchLastWidth).toBe(334);
  });
  it('should return valid stretched column width (stretch: all)', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(250, 0, 5, allColumns20, null, true, 'all');
    expect(calc.getStretchedColumnWidth(0, 50)).toBe(null);
    expect(calc.needVerifyLastColumnWidth).toBe(true);
    calc.refreshStretching(417);
    expect(calc.getStretchedColumnWidth(0, allColumns20())).toBe(83);
    expect(calc.getStretchedColumnWidth(1, allColumns20())).toBe(83);
    expect(calc.getStretchedColumnWidth(2, allColumns20())).toBe(83);
    expect(calc.getStretchedColumnWidth(3, allColumns20())).toBe(83);
    expect(calc.needVerifyLastColumnWidth).toBe(true);
    expect(calc.getStretchedColumnWidth(4, allColumns20())).toBe(85);
    expect(calc.needVerifyLastColumnWidth).toBe(false);
  });
  it('should return valid stretched column width (stretch: last)', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(250, 0, 5, allColumns20, null, true, 'last');
    expect(calc.getStretchedColumnWidth(0, 50)).toBe(null);
    calc.refreshStretching(417);
    expect(calc.getStretchedColumnWidth(0, allColumns20())).toBe(null);
    expect(calc.getStretchedColumnWidth(1, allColumns20())).toBe(null);
    expect(calc.getStretchedColumnWidth(2, allColumns20())).toBe(null);
    expect(calc.getStretchedColumnWidth(3, allColumns20())).toBe(null);
    expect(calc.getStretchedColumnWidth(4, allColumns20())).toBe(337);
  });
  it('call refreshStretching should clear stretchAllColumnsWidth and needVerifyLastColumnWidth property', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(250, 0, 5, allColumns20, null, true, 'all');
    expect(calc.stretchAllColumnsWidth.length).toBe(0);
    expect(calc.needVerifyLastColumnWidth).toBe(true);
    calc.refreshStretching(417);
    calc.getStretchedColumnWidth(0, allColumns20());
    calc.getStretchedColumnWidth(1, allColumns20());
    calc.getStretchedColumnWidth(2, allColumns20());
    calc.getStretchedColumnWidth(3, allColumns20());
    calc.getStretchedColumnWidth(4, allColumns20());
    expect(calc.stretchAllColumnsWidth.length).toBe(5);
    expect(calc.needVerifyLastColumnWidth).toBe(false);
    calc.refreshStretching(201);
    expect(calc.stretchAllColumnsWidth.length).toBe(0);
    expect(calc.needVerifyLastColumnWidth).toBe(true);
  });
  it('should calculate the number of columns based on a default width, ' + 'when the width returned from the function is not a number', function () {
    var calc = new Walkontable.ViewportColumnsCalculator(200, 0, 1000, function () {
      return void 0 + 1;
    });
    var visibleCalc = new Walkontable.ViewportColumnsCalculator(200, 0, 1000, function () {
      return void 0 + 1;
    }, null, true);
    expect(calc.startColumn).toBe(0);
    expect(calc.startPosition).toBe(0);
    expect(calc.endColumn).toBe(3);
    expect(visibleCalc.startColumn).toBe(0);
    expect(visibleCalc.endColumn).toBe(3);
  });
});

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.ViewportRowsCalculator', function () {
  function allRows20() {
    return 20;
  }

  it('should render first 5 rows in unscrolled container', function () {
    var calc = new Walkontable.ViewportRowsCalculator(100, 0, 1000, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(100, 0, 1000, allRows20, null, true);
    expect(calc.startRow).toBe(0);
    expect(calc.startPosition).toBe(0);
    expect(calc.endRow).toBe(4);
    expect(visibleCalc.startRow).toBe(0);
    expect(visibleCalc.endRow).toBe(4);
  });
  it('should render 6 rows, starting from 3 in container scrolled to half of fourth row', function () {
    var calc = new Walkontable.ViewportRowsCalculator(100, 70, 1000, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(100, 70, 1000, allRows20, null, true);
    expect(calc.startRow).toBe(3);
    expect(calc.startPosition).toBe(60);
    expect(calc.endRow).toBe(8);
    expect(visibleCalc.startRow).toBe(4);
    expect(visibleCalc.endRow).toBe(7);
  });
  it('should render 10 rows, starting from 1 in container scrolled to half of fourth row (with render overrides)', function () {
    var overrideFn = function overrideFn(calc) {
      calc.startRow -= 2;
      calc.endRow += 2;
    };

    var calc = new Walkontable.ViewportRowsCalculator(100, 70, 1000, allRows20, overrideFn);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(100, 70, 1000, allRows20, null, true);
    expect(calc.startRow).toBe(1);
    expect(calc.startPosition).toBe(20);
    expect(calc.endRow).toBe(10);
    expect(visibleCalc.startRow).toBe(4);
    expect(visibleCalc.endRow).toBe(7);
  });
  it('should return number of rendered rows', function () {
    var calc = new Walkontable.ViewportRowsCalculator(100, 50, 1000, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(100, 50, 1000, allRows20, null, true);
    expect(calc.count).toBe(6);
    expect(visibleCalc.count).toBe(4);
  });
  it('should render all rows if their size is smaller than viewport', function () {
    var calc = new Walkontable.ViewportRowsCalculator(200, 0, 8, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(200, 0, 8, allRows20, null, true);
    expect(calc.startRow).toBe(0);
    expect(calc.endRow).toBe(7);
    expect(calc.count).toBe(8);
    expect(visibleCalc.startRow).toBe(0);
    expect(visibleCalc.endRow).toBe(7);
    expect(visibleCalc.count).toBe(8);
  });
  it('should render all rows if their size is exactly the viewport', function () {
    var calc = new Walkontable.ViewportRowsCalculator(200, 0, 10, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(200, 0, 10, allRows20, null, true);
    expect(calc.startRow).toBe(0);
    expect(calc.endRow).toBe(9);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startRow).toBe(0);
    expect(visibleCalc.endRow).toBe(9);
    expect(visibleCalc.count).toBe(10);
  });
  it('should render all rows if their size is slightly larger than viewport', function () {
    var calc = new Walkontable.ViewportRowsCalculator(199, 0, 10, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(199, 0, 10, allRows20, null, true);
    expect(calc.startRow).toBe(0);
    expect(calc.endRow).toBe(9);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startRow).toBe(0);
    expect(visibleCalc.endRow).toBe(8);
    expect(visibleCalc.count).toBe(9);
  });
  it('should set null values if total rows is 0', function () {
    var calc = new Walkontable.ViewportRowsCalculator(200, 0, 0, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(200, 0, 0, allRows20, null, true);
    expect(calc.startRow).toBe(null);
    expect(calc.startPosition).toBe(null);
    expect(calc.endRow).toBe(null);
    expect(calc.count).toBe(0);
    expect(visibleCalc.startRow).toBe(null);
    expect(visibleCalc.endRow).toBe(null);
  });
  it('should set null values if total rows is 0 (with overrideFn provided)', function () {
    var overrideFn = function overrideFn(myCalc) {
      myCalc.startRow = 0;
      myCalc.endRow = 0;
    };

    var calc = new Walkontable.ViewportRowsCalculator(200, 0, 0, allRows20, overrideFn);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(200, 0, 0, allRows20, null, true);
    expect(calc.startRow).toBe(null);
    expect(calc.startPosition).toBe(null);
    expect(calc.endRow).toBe(null);
    expect(calc.count).toBe(0);
    expect(visibleCalc.startRow).toBe(null);
    expect(visibleCalc.endRow).toBe(null);
  });
  it('should scroll backwards if total rows is reached', function () {
    var calc = new Walkontable.ViewportRowsCalculator(190, 350, 20, allRows20);
    var visibleCalc = new Walkontable.ViewportRowsCalculator(190, 350, 20, allRows20, null, true);
    expect(calc.startRow).toBe(10);
    expect(calc.startPosition).toBe(200);
    expect(calc.endRow).toBe(19);
    expect(calc.count).toBe(10);
    expect(visibleCalc.startRow).toBe(11);
    expect(visibleCalc.endRow).toBe(19);
  });
  it('should calculate the number of rows based on a default height, ' + 'when the height returned from the function is not a number', function () {
    var calc = new Walkontable.ViewportRowsCalculator(100, 0, 1000, function () {
      return void 0 + 1;
    });
    var visibleCalc = new Walkontable.ViewportRowsCalculator(100, 0, 1000, function () {
      return void 0 + 1;
    }, null, true);
    expect(calc.startRow).toBe(0);
    expect(calc.startPosition).toBe(0);
    expect(calc.endRow).toBe(4);
    expect(visibleCalc.startRow).toBe(0);
    expect(visibleCalc.endRow).toBe(3);
  });
});

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.CellCoords', function () {
  describe('isValid', function () {
    var table = document.createElement('table');
    var wrapper = document.createElement('div');
    var container = document.createElement('div');
    wrapper.appendChild(container);
    container.appendChild(table);
    var wot = new Walkontable.Core({
      table: table,
      data: [],
      totalRows: 10,
      totalColumns: 5
    });
    it('should be false if one of the arguments is smaller than 0', function () {
      var cellCoords = new Walkontable.CellCoords(-1, 0);
      var result = cellCoords.isValid(wot);
      expect(result).toBe(false);
      cellCoords = new Walkontable.CellCoords(0, -1);
      result = cellCoords.isValid(wot);
      expect(result).toBe(false);
    });
    it('should be true if row is within the total number of rows', function () {
      var cellCoords = new Walkontable.CellCoords(9, 1);
      var result = cellCoords.isValid(wot);
      expect(result).toBe(true);
    });
    it('should be false if row is greater than total number of rows', function () {
      var cellCoords = new Walkontable.CellCoords(10, 1);
      var result = cellCoords.isValid(wot);
      expect(result).toBe(false);
    });
    it('should be true if column is within the total number of columns', function () {
      var cellCoords = new Walkontable.CellCoords(1, 4);
      var result = cellCoords.isValid(wot);
      expect(result).toBe(true);
    });
    it('should be false if column is greater than total number of columns', function () {
      var cellCoords = new Walkontable.CellCoords(1, 5);
      var result = cellCoords.isValid(wot);
      expect(result).toBe(false);
    });
  });
  describe('isEqual', function () {
    it('should be equal to itself', function () {
      var cellCoords = new Walkontable.CellCoords(1, 1);
      var result = cellCoords.isEqual(cellCoords);
      expect(result).toBe(true);
    });
    it('should be equal to another instance with the same row and column', function () {
      var cellCoords = new Walkontable.CellCoords(1, 1);
      var cellCoords2 = new Walkontable.CellCoords(1, 1);
      var result = cellCoords.isEqual(cellCoords2);
      expect(result).toBe(true);
    });
    it('should not be equal to an instance with different row or column', function () {
      var cellCoords = new Walkontable.CellCoords(1, 1);
      var cellCoords2 = new Walkontable.CellCoords(2, 1);
      var result = cellCoords.isEqual(cellCoords2);
      expect(result).toBe(false);
    });
  });
});

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.CellRange', function () {
  describe('getAll', function () {
    it('should get all cells in range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var all = range.getAll();
      expect(all.length).toBe(9);
      expect(all[0].row).toBe(from.row);
      expect(all[0].col).toBe(from.col);
      expect(all[1].row).toBe(1);
      expect(all[1].col).toBe(2);
      expect(all[8].row).toBe(to.row);
      expect(all[8].col).toBe(to.col);
    });
    it('should get all cells in range (reverse order)', function () {
      var from = new Walkontable.CellCoords(3, 3);
      var to = new Walkontable.CellCoords(1, 1);
      var range = new Walkontable.CellRange(from, from, to);
      var all = range.getAll();
      expect(all.length).toBe(9);
      expect(all[0].row).toBe(to.row);
      expect(all[0].col).toBe(to.col);
      expect(all[1].row).toBe(1);
      expect(all[1].col).toBe(2);
      expect(all[8].row).toBe(from.row);
      expect(all[8].col).toBe(from.col);
    });
  });
  describe('getInner', function () {
    it('should get cells in range excluding from and to', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var inner = range.getInner();
      expect(inner.length).toBe(7);
      expect(inner[1].row).toBe(1);
      expect(inner[1].col).toBe(3);
    });
    it('should get cells in range excluding from and to (reverse order)', function () {
      var from = new Walkontable.CellCoords(3, 3);
      var to = new Walkontable.CellCoords(1, 1);
      var range = new Walkontable.CellRange(from, from, to);
      var inner = range.getInner();
      expect(inner.length).toBe(7);
      expect(inner[1].row).toBe(1);
      expect(inner[1].col).toBe(3);
    });
  });
  describe('includes', function () {
    it('should return true if range is a single cell and the same cell is given', function () {
      var from = new Walkontable.CellCoords(0, 0);
      var to = new Walkontable.CellCoords(0, 0);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.includes(new Walkontable.CellCoords(0, 0))).toBe(true);
    });
    it('should return true if given cell is within the range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.includes(new Walkontable.CellCoords(1, 1))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(3, 1))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(3, 3))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(1, 3))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(2, 2))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(1, 2))).toBe(true);
      expect(range.includes(new Walkontable.CellCoords(2, 1))).toBe(true);
    });
    it('should return false if given cell outside the range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.includes(new Walkontable.CellCoords(0, 0))).toBe(false);
      expect(range.includes(new Walkontable.CellCoords(4, 4))).toBe(false);
      expect(range.includes(new Walkontable.CellCoords(1, 4))).toBe(false);
      expect(range.includes(new Walkontable.CellCoords(4, 1))).toBe(false);
      expect(range.includes(new Walkontable.CellCoords(-1, -1))).toBe(false);
    });
  });
  describe('includesRange', function () {
    describe('B has more than one cell', function () {
      /*
       +----------+
       |  a       |
       | +------+ |
       | |    b | |
       | |      | |
       | +------+ |
       +----------+
       */
      it('B is included in A, none of borders touch each other', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       |  b       |
       | +------+ |
       | |   a  | |
       | |      | |
       | +------+ |
       +----------+
       */

      it('A is included in B, none of borders touch each other', function () {
        var aTopLeft = new Walkontable.CellCoords(1, 1);
        var aBottomRight = new Walkontable.CellCoords(4, 4);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(false);
      });
      /*
       +-----------+
       | a |   b | |
       |   |     | |
       |   +-----+ |
       +-----------+
       */

      it('B is included in A, top borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +---------+
       | a |   b |
       |   |     |
       |   +-----|
       |         |
       +---------+
       */

      it('B is included in A, top and right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +---------+
       |   +-----|
       | a |   b |
       |   |     |
       |   +-----|
       +---------+
       */

      it('B is included in A, right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +---------+
       |   +-----|
       | a |   b |
       |   |     |
       +---------+
       */

      it('B is included in A, bottom and right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +-----------+
       |   +-----+ |
       | a |   b | |
       |   |     | |
       +-----------+
       */

      it('B is included in A, bottom borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(5, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +-----------+
       |-----+   a |
       |   b |     |
       |     |     |
       +-----------+
       */

      it('B is included in A, bottom and left borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +-----------+
       |-----+   a |
       |   b |     |
       |     |     |
       |-----+     |
       +-----------+
       */

      it('B is included in A, left borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 0);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +-----------+
       |   b |   a |
       |     |     |
       |-----+     |
       +-----------+
       */

      it('B is included in A, top and left borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +------------+
       |  a |   b | |
       |    |     | |
       +------------+
       */

      it('B is included in A, top and bottom borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 1);
        var bBottomRight = new Walkontable.CellCoords(5, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       |  a |   b |
       |    |     |
       +----------+
       */

      it('B is included in A, top, right and bottom borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 1);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       |  b |   a |
       |    |     |
       +----------+
       */

      it('B is included in A, top, left and bottom borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       | a        |
       |----------|
       |  b       |
       |----------|
       +----------+
       */

      it('B is included in A, left and right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 0);
        var bBottomRight = new Walkontable.CellCoords(4, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       | a        |
       |----------|
       |  b       |
       +----------+
       */

      it('B is included in A, left, bottom and right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
      /*
       +----------+
       | b        |
       |----------|
       |  a       |
       +----------+
       */

      it('B is included in A, left, top and right borders touch', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(4, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
    });
    describe('B has exactly one cell', function () {
      /*
       +----------+
       |  a       |
       | +------+ |
       | |    b | |
       | |      | |
       | +------+ |
       +----------+
       */
      it('B is included in A, none of borders touch each other', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(1, 1);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.includesRange(b)).toBe(true);
      });
    });
  });
  describe('expand', function () {
    it('should not change range if expander to a cell that fits within the range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var topLeft = range.getTopLeftCorner();
      var bottomRight = range.getBottomRightCorner();
      var expander = new Walkontable.CellCoords(3, 1);
      var res = range.expand(expander);
      expect(res).toBe(false);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(topLeft);
      expect(bottomRight2).toEqual(bottomRight);
    });
    it('should change range if expander to a cell outside of the cell range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var topLeft = range.getTopLeftCorner();
      var expander = new Walkontable.CellCoords(4, 4);
      var res = range.expand(expander);
      expect(res).toBe(true);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(topLeft);
      expect(bottomRight2).toEqual(expander);
    });
    it('should change range if expander to a cell outside of the cell range (inverted)', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var topLeft = range.getTopLeftCorner();
      var expander = new Walkontable.CellCoords(4, 4);
      var res = range.expand(expander);
      expect(res).toBe(true);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(topLeft);
      expect(bottomRight2).toEqual(expander);
    });
    it('should change range if expander to a cell outside of the cell range (bottom left)', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var expander = new Walkontable.CellCoords(3, 0);
      var res = range.expand(expander);
      expect(res).toBe(true);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(new Walkontable.CellCoords(1, 0));
      expect(bottomRight2).toEqual(new Walkontable.CellCoords(3, 3));
    });
    it('should change range if expander to a cell outside of the cell range (inverted top right)', function () {
      var from = new Walkontable.CellCoords(2, 0);
      var to = new Walkontable.CellCoords(1, 0);
      var range = new Walkontable.CellRange(from, from, to);
      var expander = new Walkontable.CellCoords(1, 1);
      var res = range.expand(expander);
      expect(res).toBe(true);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(new Walkontable.CellCoords(1, 0));
      expect(bottomRight2).toEqual(new Walkontable.CellCoords(2, 1));
    });
    it('should change range if expander to a cell outside of the cell range (inverted bottom left)', function () {
      var from = new Walkontable.CellCoords(2, 1);
      var to = new Walkontable.CellCoords(1, 1);
      var range = new Walkontable.CellRange(from, from, to);
      var expander = new Walkontable.CellCoords(3, 0);
      var res = range.expand(expander);
      expect(res).toBe(true);
      var topLeft2 = range.getTopLeftCorner();
      var bottomRight2 = range.getBottomRightCorner();
      expect(topLeft2).toEqual(new Walkontable.CellCoords(1, 0));
      expect(bottomRight2).toEqual(new Walkontable.CellCoords(3, 1));
    });
  });
  describe('overlaps', function () {
    describe('positive', function () {
      /*
             +-------+
             |       |
             |   b   |
       +-------+     |
       |     +-|-----+
       |   a   |
       |       |
       +-------+
       */
      it('overlapping from NE', function () {
        var aTopLeft = new Walkontable.CellCoords(3, 0);
        var aBottomRight = new Walkontable.CellCoords(8, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 3);
        var bBottomRight = new Walkontable.CellCoords(5, 8);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +---------+
       |      +-------+
       |      |  |    |
       |  a   |  |  b |
       |      |  |    |
       |      +-------+
       +---------+
       */

      it('overlapping from E', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 3);
        var bBottomRight = new Walkontable.CellCoords(4, 6);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +--------+
       |        |
       |  a     |
       |    +---------+
       |    |   |     |
       +----|---+     |
            |      b  |
            |         |
            +---------+
       */

      it('overlapping from SE', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(3, 3);
        var bBottomRight = new Walkontable.CellCoords(8, 8);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +---------+
       |    a    |
       | +-----+ |
       +-|-----|-+
         |  b  |
         +-----+
       */

      it('overlapping from S', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(3, 1);
        var bBottomRight = new Walkontable.CellCoords(6, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
           +--------+
           |      a |
       +--------+   |
       |   |    |   |
       |   +----|---+
       | b      |
       +--------+
       */

      it('overlapping from SW', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 3);
        var aBottomRight = new Walkontable.CellCoords(5, 8);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(3, 0);
        var bBottomRight = new Walkontable.CellCoords(8, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
           +-------+
       +---|--+    |
       |   |  |    |
       | b |  |  a |
       |   |  |    |
       +---|--+    |
           +-------+
       */

      it('overlapping from S', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 3);
        var aBottomRight = new Walkontable.CellCoords(5, 8);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +------+
       | b    |
       |   +-------+
       |   |  |    |
       +---|--+  a |
           |       |
           +-------+
       */

      it('overlapping from NW', function () {
        var aTopLeft = new Walkontable.CellCoords(3, 3);
        var aBottomRight = new Walkontable.CellCoords(8, 8);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +---------+
       |    b    |
       | +-----+ |
       +-|-----|-+
         |  a  |
         +-----+
       */

      it('overlapping from N', function () {
        var aTopLeft = new Walkontable.CellCoords(3, 1);
        var aBottomRight = new Walkontable.CellCoords(6, 4);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----------+
       |  a       |
       | +------+ |
       | |    b | |
       | |      | |
       | +------+ |
       +----------+
       */

      it('overlapping when includes', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 1);
        var bBottomRight = new Walkontable.CellCoords(4, 4);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----------+
       |  b       |
       | +------+ |
       | |    a | |
       | |      | |
       | +------+ |
       +----------+
       */

      it('overlapping when included', function () {
        var aTopLeft = new Walkontable.CellCoords(1, 1);
        var aBottomRight = new Walkontable.CellCoords(4, 4);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
        b-> +----------+
           |  a       |
           |          |
           |          |
           +----------+
       */

      it('overlapping when A includes B and B has only one cell, and this cell is A\'s top left corner', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(0, 0);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
        +----------+ <- b
       |  a       |
       |          |
       |          |
       +----------+
       */

      it('overlapping when A includes B and B has only one cell, and this cell is A\'s top right corner', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 5);
        var bBottomRight = new Walkontable.CellCoords(0, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
            +----------+
           |  a       |
           |          |
           |          |
      b -> +----------+
       */

      it('overlapping when A includes B and B has only one cell, and this cell is A\'s bottom left corner', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(5, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 0);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
        +----------+
       |  a       |
       |          |
       |          |
       +----------+ <- b
       */

      it('overlapping when A includes B and B has only one cell, and this cell is A\'s bottom right corner', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(5, 5);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
            +----+
            |b   |
       +----+----+
       |   a|
       +----+
       */

      it('overlapping by touching from NE', function () {
        var aTopLeft = new Walkontable.CellCoords(5, 0);
        var aBottomRight = new Walkontable.CellCoords(10, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 5);
        var bBottomRight = new Walkontable.CellCoords(5, 10);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+----+
       |   a|   b|
       +----+----+
       */

      it('overlapping by touching from E', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 5);
        var bBottomRight = new Walkontable.CellCoords(5, 10);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+
       |   a|
       +----+----+
            |   b|
            +----+
       */

      it('overlapping by touching from SE', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(5, 5);
        var bBottomRight = new Walkontable.CellCoords(10, 10);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+
       |   a|
       +----+
       |   b|
       +----+
       */

      it('overlapping by touching from S', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(5, 5);
        var bBottomRight = new Walkontable.CellCoords(10, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
            +----+
            |   a|
       +----+----+
       |   b|
       +----+
       */

      it('overlapping by touching from SW', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 5);
        var aBottomRight = new Walkontable.CellCoords(5, 10);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(5, 0);
        var bBottomRight = new Walkontable.CellCoords(10, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+----+
       |   b|   a|
       +----+----+
       */

      it('overlapping by touching from W', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 5);
        var aBottomRight = new Walkontable.CellCoords(5, 10);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+
       |   b|
       +----+----+
            |   a|
            +----+
       */

      it('overlapping by touching from NW', function () {
        var aTopLeft = new Walkontable.CellCoords(5, 5);
        var aBottomRight = new Walkontable.CellCoords(10, 10);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
      /*
       +----+
       |   b|
       +----+
       |   a|
       +----+
       */

      it('overlapping by touching from E', function () {
        var aTopLeft = new Walkontable.CellCoords(5, 0);
        var aBottomRight = new Walkontable.CellCoords(10, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(true);
      });
    });
    describe('negative', function () {
      /*
             +---+
             |  b|
             +---+
       +------+
       |      |
       |  a   |
       |      |
       +------+
       */
      it('not overlapping from NE', function () {
        var aTopLeft = new Walkontable.CellCoords(6, 0);
        var aBottomRight = new Walkontable.CellCoords(11, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 3);
        var bBottomRight = new Walkontable.CellCoords(5, 8);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
       +------+
       |      | +--+
       |   a  | | b|
       |      | +--+
       +------+
       */

      it('not overlapping from E', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 6);
        var bBottomRight = new Walkontable.CellCoords(4, 9);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
       +----+
       |a   |
       |    | +----+
       +----+ |b   |
              |    |
              +----+
       */

      it('not overlapping from SE', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(1, 6);
        var bBottomRight = new Walkontable.CellCoords(4, 9);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
       +----+
       |a   |
       |    |
       +----+
       +----+
       |b   |
       |    |
       +----+
       */

      it('not overlapping from S', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 0);
        var aBottomRight = new Walkontable.CellCoords(5, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(6, 0);
        var bBottomRight = new Walkontable.CellCoords(11, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
           +----+
           |a   |
           |    |
           +----+
       +----+
       |b   |
       |    |
       +----+
       */

      it('not overlapping from SW', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 3);
        var aBottomRight = new Walkontable.CellCoords(5, 8);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(6, 0);
        var bBottomRight = new Walkontable.CellCoords(11, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
            +------+
       +--+ |      |
       | b| |   a  |
       +--+ |      |
            +------+
       */

      it('not overlapping from W', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 6);
        var aBottomRight = new Walkontable.CellCoords(5, 11);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(3, 0);
        var bBottomRight = new Walkontable.CellCoords(6, 3);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
       +----+
       |b   |
       |    | +----+
       +----+ | a  |
              |    |
              +----+
       */

      it('not overlapping from NW', function () {
        var aTopLeft = new Walkontable.CellCoords(0, 6);
        var aBottomRight = new Walkontable.CellCoords(3, 11);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
      /*
       +----+
       |b   |
       +----+
       +----+
       |   a|
       +----+
       */

      it('not overlapping from N', function () {
        var aTopLeft = new Walkontable.CellCoords(6, 0);
        var aBottomRight = new Walkontable.CellCoords(11, 5);
        var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
        var bTopLeft = new Walkontable.CellCoords(0, 0);
        var bBottomRight = new Walkontable.CellCoords(5, 5);
        var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
        expect(a.overlaps(b)).toBe(false);
      });
    });
  });
  describe('expand by range', function () {
    it('should not expand range A with range B if A includes B', function () {
      var aTopLeft = new Walkontable.CellCoords(0, 0);
      var aBottomRight = new Walkontable.CellCoords(5, 5);
      var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
      var bTopLeft = new Walkontable.CellCoords(2, 2);
      var bBottomRight = new Walkontable.CellCoords(4, 4);
      var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
      expect(a.expandByRange(b)).toBe(false);
      expect(a.getTopLeftCorner().row).toEqual(0);
      expect(a.getTopLeftCorner().col).toEqual(0);
      expect(a.getBottomRightCorner().row).toEqual(5);
      expect(a.getBottomRightCorner().col).toEqual(5);
    });
    it('should not expand range A with range B if A and B don\'t overlap', function () {
      var aTopLeft = new Walkontable.CellCoords(0, 0);
      var aBottomRight = new Walkontable.CellCoords(5, 5);
      var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
      var bTopLeft = new Walkontable.CellCoords(10, 10);
      var bBottomRight = new Walkontable.CellCoords(15, 15);
      var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
      expect(a.expandByRange(b)).toBe(false);
      expect(a.getTopLeftCorner().row).toEqual(0);
      expect(a.getTopLeftCorner().col).toEqual(0);
      expect(a.getBottomRightCorner().row).toEqual(5);
      expect(a.getBottomRightCorner().col).toEqual(5);
    });
    it('should not expand range A with range B', function () {
      var aTopLeft = new Walkontable.CellCoords(0, 0);
      var aBottomRight = new Walkontable.CellCoords(5, 5);
      var a = new Walkontable.CellRange(aTopLeft, aTopLeft, aBottomRight);
      var bTopLeft = new Walkontable.CellCoords(2, 2);
      var bBottomRight = new Walkontable.CellCoords(7, 7);
      var b = new Walkontable.CellRange(bTopLeft, bTopLeft, bBottomRight);
      expect(a.expandByRange(b)).toBe(true);
      expect(a.getTopLeftCorner().row).toEqual(0);
      expect(a.getTopLeftCorner().col).toEqual(0);
      expect(a.getBottomRightCorner().row).toEqual(7);
      expect(a.getBottomRightCorner().col).toEqual(7);
    });
  });
  describe('forAll', function () {
    it('callback should be called for all cells in the range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(3, 3);
      var range = new Walkontable.CellRange(from, from, to);
      var forAllCallback = jasmine.createSpy('beforeColumnSortHandler');
      range.forAll(forAllCallback);
      expect(forAllCallback.calls.count()).toBe(9);
    });
    it('callback should be called with row, column parameters', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      var rows = [];
      var cols = [];
      range.forAll(function (row, col) {
        rows.push(row);
        cols.push(col);
      });
      expect(rows).toEqual([1, 1, 2, 2]);
      expect(cols).toEqual([1, 2, 1, 2]);
    });
    it('iteration should be interrupted when callback returns false', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      var callCount = 0;
      range.forAll(function () {
        callCount += 1;

        if (callCount === 2) {
          return false;
        }
      });
      expect(callCount).toBe(2);
    });
  });
  describe('direction', function () {
    it('should properly change direction on NW-SE', function () {
      var from = new Walkontable.CellCoords(2, 1);
      var to = new Walkontable.CellCoords(1, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getDirection()).toBe('SW-NE');
      range.setDirection('NW-SE');
      expect(range.getDirection()).toBe('NW-SE');
      expect(range.from.row).toBe(1);
      expect(range.from.col).toBe(1);
      expect(range.to.row).toBe(2);
      expect(range.to.col).toBe(2);
    });
    it('should properly change direction on NE-SW', function () {
      var from = new Walkontable.CellCoords(2, 1);
      var to = new Walkontable.CellCoords(1, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getDirection()).toBe('SW-NE');
      range.setDirection('NE-SW');
      expect(range.getDirection()).toBe('NE-SW');
      expect(range.from.row).toBe(1);
      expect(range.from.col).toBe(2);
      expect(range.to.row).toBe(2);
      expect(range.to.col).toBe(1);
    });
    it('should properly change direction on SE-NW', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getDirection()).toBe('NW-SE');
      range.setDirection('SE-NW');
      expect(range.getDirection()).toBe('SE-NW');
      expect(range.from.row).toBe(2);
      expect(range.from.col).toBe(2);
      expect(range.to.row).toBe(1);
      expect(range.to.col).toBe(1);
    });
    it('should properly change direction on SW-NE', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getDirection()).toBe('NW-SE');
      range.setDirection('SW-NE');
      expect(range.getDirection()).toBe('SW-NE');
      expect(range.from.row).toBe(2);
      expect(range.from.col).toBe(1);
      expect(range.to.row).toBe(1);
      expect(range.to.col).toBe(2);
    });
    it('should properly return the vertical direction of a range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getVerticalDirection()).toEqual('N-S');
      from = new Walkontable.CellCoords(2, 2);
      to = new Walkontable.CellCoords(1, 1);
      range = new Walkontable.CellRange(from, from, to);
      expect(range.getVerticalDirection()).toEqual('S-N');
    });
    it('should properly return the horizontal direction of a range', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      expect(range.getHorizontalDirection()).toEqual('W-E');
      from = new Walkontable.CellCoords(2, 2);
      to = new Walkontable.CellCoords(1, 1);
      range = new Walkontable.CellRange(from, from, to);
      expect(range.getHorizontalDirection()).toEqual('E-W');
    });
    it('should flip the direction vertically when using the `flipDirectionVertically` method', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      range.flipDirectionVertically();
      expect(range.from.row).toEqual(2);
      expect(range.from.col).toEqual(1);
      expect(range.to.row).toEqual(1);
      expect(range.to.col).toEqual(2);
      expect(range.getDirection()).toEqual('SW-NE');
    });
    it('should flip the direction horizontally when using the `flipDirectionHorizontally` method', function () {
      var from = new Walkontable.CellCoords(1, 1);
      var to = new Walkontable.CellCoords(2, 2);
      var range = new Walkontable.CellRange(from, from, to);
      range.flipDirectionHorizontally();
      expect(range.from.row).toEqual(1);
      expect(range.from.col).toEqual(2);
      expect(range.to.row).toEqual(2);
      expect(range.to.col).toEqual(1);
      expect(range.getDirection()).toEqual('NE-SW');
    });
  });
});

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableCore', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden'
    });
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray(100, 4);
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('first row should have the same text as in data source', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var TDs = $table.find('tbody tr:first td');
    expect(TDs[0].innerHTML).toBe('0');
    expect(TDs[1].innerHTML).toBe('a');
  });
  it('should bootstrap table if empty TABLE is given', function () {
    $wrapper.width(200).height(200);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      renderAllRows: true
    });
    wt.draw();
    expect($table.find('td').length).toBe(400);
  });
  it('should bootstrap column headers if THEAD is given', function () {
    $table.remove();
    $table = $('<table><thead><tr><th>A</th><th>B</th><th>C</th><th>D</th></tr></thead></table>');
    $table.appendTo('body');
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    expect($table.find('thead th').length).toBe(5); // include corner TH

    expect($table.find('tbody tr:first th').length).toBe(1);
    expect($table.find('tbody tr:first td').length).toBe(4);
  });
  it('should figure out how many columns to display if width param given', function () {
    $wrapper.width(100);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe(2);
  });
  it('should not render table that is removed from DOM', function () {
    $wrapper.remove();
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect(wt.drawn).toBe(false);
    expect(wt.drawInterrupted).toBe(true);
  });
  it('should not render table that is `display: none`', function () {
    var $div = $('<div style="display: none"></div>').appendTo('body');
    $div.append($table);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect(wt.drawn).toBe(false);
    expect(wt.drawInterrupted).toBe(true);
    $div.remove();
  });
  it('should render empty table (limited height)', function () {
    createDataArray(0, 5);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect(function () {
      wt.draw(); // second render was giving "Cannot read property 'firstChild' of null" sometimes
    }).not.toThrow();
  });
  it('should render empty table (unlimited height)', function () {
    createDataArray(0, 5);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect(function () {
      wt.draw(); // second render was giving "Cannot read property 'firstChild' of null" sometimes
    }).not.toThrow();
  });
  it('should render empty then filled table (limited height)', function () {
    createDataArray(0, 5);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    createDataArray(1, 5);
    expect(function () {
      wt.draw(); // second render was giving "Cannot read property 'firstChild' of null" sometimes
    }).not.toThrow();
  });
  it('should render empty then filled table (unlimited height)', function () {
    createDataArray(0, 5);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    createDataArray(1, 5);
    expect(function () {
      wt.draw(); // second render was giving "Cannot read property 'firstChild' of null" sometimes
    }).not.toThrow();
  });
  it('should render table with rows but no columns', function () {
    createDataArray(5, 0);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(5);
    expect($table.find('tbody td').length).toBe(0);
    expect($table.find('tbody col').length).toBe(0);
  });
});

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableEvent', function () {
  var $table;
  var debug = false;
  beforeEach(function () {
    $table = $('<table></table>'); // create a table that is not attached to document

    $table.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }
  });
  it('should call `onCellMouseDown` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellMouseDown: function onCellMouseDown(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('mousedown');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellContextMenu` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellContextMenu: function onCellContextMenu(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('contextmenu');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellMouseOver` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellMouseOver: function onCellMouseOver(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('mouseover');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellMouseOver` callback with correctly passed TD element when cell contains another table', function () {
    var fn = jasmine.createSpy();
    var wt = new Walkontable.Core({
      table: $table[0],
      data: [['<table style="width: 50px;"><tr><td class="test">TEST</td></tr></table>']],
      totalRows: 1,
      totalColumns: 1,
      onCellMouseOver: fn,
      cellRenderer: function cellRenderer(row, column, TD) {
        TD.innerHTML = wt.wtSettings.getSetting('data', row, column);
      }
    });
    wt.draw();
    var outerTD = $table.find('tbody td:not(td.test)');
    var innerTD = $table.find('tbody td.test');
    innerTD.simulate('mouseover');
    expect(fn.calls.argsFor(0)[2]).toBe(outerTD[0]);
  });
  it('should call `onCellMouseOut` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellMouseOut: function onCellMouseOut(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('mouseover').simulate('mouseout');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellMouseOut` callback with correctly passed TD element when cell contains another table', function () {
    var fn = jasmine.createSpy();
    var wt = new Walkontable.Core({
      table: $table[0],
      data: [['<table style="width: 50px;"><tr><td class="test">TEST</td></tr></table>']],
      totalRows: 1,
      totalColumns: 1,
      onCellMouseOut: fn,
      cellRenderer: function cellRenderer(row, column, TD) {
        TD.innerHTML = wt.wtSettings.getSetting('data', row, column);
      }
    });
    wt.draw();
    var outerTD = $table.find('tbody td:not(td.test)');
    $table.find('tbody td.test').simulate('mouseover').simulate('mouseout');
    expect(fn.calls.argsFor(0)[2]).toBe(outerTD[0]);
  });
  it('should call `onCellDblClick` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellDblClick: function onCellDblClick(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('mousedown').simulate('mouseup').simulate('mousedown').simulate('mouseup');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellDblClick` callback, even when it is set only after first click', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $td.simulate('mousedown').simulate('mouseup').simulate('mousedown');
    wt.update('onCellDblClick', function (event, coords, TD) {
      myCoords = coords;
      myTD = TD;
    });
    $td.simulate('mouseup');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('should call `onCellMouseDown` callback when clicked on TH', function () {
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      onCellMouseDown: function onCellMouseDown() {
        called = true;
      }
    });
    wt.draw();
    $table.find('th:first').simulate('mousedown');
    expect(called).toEqual(true);
  });
  it('should not call `onCellMouseDown` callback when clicked on the focusable element (column headers)', function () {
    var opt = ['Maserati', 'Mazda', 'Mercedes', 'Mini', 'Mitsubishi'].map(function (value) {
      return "<option value=\"".concat(value, "\">").concat(value, "</option>");
    }).join('');
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = "#".concat(col, "<select>").concat(opt, "</select>");
      }],
      onCellMouseDown: function onCellMouseDown() {
        called = true;
      }
    });
    wt.draw();
    $table.find('th:first select').focus().simulate('mousedown');
    expect(called).toBe(false);
  });
  it('should not call `onCellMouseDown` callback when clicked on the focusable element (cell renderer)', function () {
    var opt = ['Maserati', 'Mazda', 'Mercedes', 'Mini', 'Mitsubishi'].map(function (value) {
      return "<option value=\"".concat(value, "\">").concat(value, "</option>");
    }).join('');
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        TD.innerHTML = "<select>".concat(opt, "</select>");
      },
      onCellMouseDown: function onCellMouseDown() {
        called = true;
      }
    });
    wt.draw();
    $table.find('td:first select').focus().simulate('mousedown');
    expect(called).toBe(false);
  });
  it('should call `onCellMouseOver` callback when clicked on TH', function () {
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      onCellMouseOver: function onCellMouseOver(event, coords) {
        called = coords;
      }
    });
    wt.draw();
    $table.find('th:first').simulate('mouseover');
    expect(called.row).toEqual(-1);
    expect(called.col).toEqual(0);
  });
  it('should call `onCellDblClick` callback when clicked on TH', function () {
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      onCellDblClick: function onCellDblClick() {
        called = true;
      }
    });
    wt.draw();
    $table.find('th:first').simulate('mousedown').simulate('mouseup').simulate('mousedown').simulate('mouseup');
    expect(called).toEqual(true);
  });
  it('should not call `onCellDblClick` callback when right-clicked', function () {
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellDblClick: function onCellDblClick() {
        called = true;
      }
    });
    wt.draw();
    var options = {
      button: 2
    };
    $table.find('tbody tr:first td:first').simulate('mousedown', options).simulate('mouseup', options).simulate('mousedown', options).simulate('mouseup', options);
    expect(called).toEqual(false);
  });
  it('should not call `onCellDblClick` when first mouse up came from mouse drag', function () {
    var called = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onCellDblClick: function onCellDblClick() {
        called = true;
      }
    });
    wt.draw();
    $table.find('tbody tr:first td:eq(1)').simulate('mousedown');
    $table.find('tbody tr:first td:first').simulate('mouseup').simulate('mousedown').simulate('mouseup');
    expect(called).toEqual(false);
  });
  it('border click should call `onCellMouseDown` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current',
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        })
      }),
      onCellMouseDown: function onCellMouseDown(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.selections.getCell().add(new Walkontable.CellCoords(1, 1));
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $table.parents('.wtHolder').find('.current:first').simulate('mousedown');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  });
  it('border click should call `onCellDblClick` callback', function () {
    var myCoords = null;
    var myTD = null;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current',
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        })
      }),
      onCellDblClick: function onCellDblClick(event, coords, TD) {
        myCoords = coords;
        myTD = TD;
      }
    });
    wt.selections.getCell().add(new Walkontable.CellCoords(1, 1));
    wt.draw();
    var $td = $table.find('tbody tr:eq(1) td:eq(1)');
    $table.parents('.wtHolder').find('.current:first').simulate('mousedown').simulate('mouseup').simulate('mousedown').simulate('mouseup');
    expect(myCoords).toEqual(new Walkontable.CellCoords(1, 1));
    expect(myTD).toEqual($td[0]);
  }); // corner

  it('should call `onCellCornerMouseDown` callback', function () {
    var clicked = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current',
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        })
      }),
      onCellCornerMouseDown: function onCellCornerMouseDown() {
        clicked = true;
      }
    });
    wt.selections.getCell().add(new Walkontable.CellCoords(10, 2));
    wt.draw();
    $table.parents('.wtHolder').find('.current.corner').simulate('mousedown');
    expect(clicked).toEqual(true);
  });
  it('should call `onCellCornerDblClick` callback, even when it is set only after first click', function () {
    var clicked = false;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          className: 'current',
          border: {
            width: 1,
            color: 'red',
            style: 'solid'
          }
        })
      })
    });
    wt.selections.getCell().add(new Walkontable.CellCoords(10, 2));
    wt.draw();
    var $td = $table.parents('.wtHolder').find('.current.corner');
    $td.simulate('mousedown').simulate('mouseup').simulate('mousedown');
    wt.update('onCellCornerDblClick', function () {
      clicked = true;
    });
    $td.simulate('mouseup');
    expect(clicked).toEqual(true);
  });
  it('should call `onDraw` callback after render', function () {
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      onDraw: function onDraw() {
        count += 1;
      }
    });
    wt.draw();
    expect(count).toEqual(1);
  });
});

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.ColumnFilter', function () {
  describe('offsettedTH', function () {
    it('should do nothing if row header is not visible', function () {
      var filter = new Walkontable.ColumnFilter();
      filter.countTH = 0;
      expect(filter.offsettedTH(1)).toEqual(1);
    });
    it('should decrease n by 1 if row header is visible', function () {
      var filter = new Walkontable.ColumnFilter();
      filter.countTH = 1;
      expect(filter.offsettedTH(1)).toEqual(0);
    });
  });
  describe('unOffsettedTH', function () {
    it('should do nothing if row header is not visible', function () {
      var filter = new Walkontable.ColumnFilter();
      filter.countTH = 0;
      expect(filter.unOffsettedTH(1)).toEqual(1);
    });
    it('should increase n by 1 if row header is visible', function () {
      var filter = new Walkontable.ColumnFilter();
      filter.countTH = 1;
      expect(filter.unOffsettedTH(0)).toEqual(1);
    });
  });
});

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.RowFilter', function () {
  describe('offsetted', function () {
    it('should return n, when offset == 0 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 0;
      filter.total = 100;
      expect(filter.offsetted(0)).toEqual(0);
    });
    it('should return n, when offset == 0 && n == 5', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 0;
      filter.total = 100;
      expect(filter.offsetted(5)).toEqual(5);
    });
    it('should return n + 1, when offset == 1 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 1;
      filter.total = 100;
      expect(filter.offsetted(0)).toEqual(1);
    });
    it('should return n + 5, when offset == 5 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 5;
      filter.total = 100;
      expect(filter.offsetted(0)).toEqual(5);
    });
  });
  describe('unOffsetted', function () {
    it('should return n, when offset == 0 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 0;
      filter.total = 100;
      expect(filter.unOffsetted(0)).toEqual(0);
    });
    it('should return n, when offset == 0 && n == 5', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 0;
      filter.total = 100;
      expect(filter.unOffsetted(5)).toEqual(5);
    });
    it('should return n - 1, when offset == 1 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 1;
      filter.total = 100;
      expect(filter.unOffsetted(1)).toEqual(0);
    });
    it('should return n - 5, when offset == 5 && n == 0', function () {
      var filter = new Walkontable.RowFilter();
      filter.offset = 5;
      filter.total = 100;
      expect(filter.unOffsetted(5)).toEqual(0);
    });
  });
  describe('renderedToSource', function () {
    it('should translate visible column to source', function () {
      var filter = new Walkontable.RowFilter();
      filter.fixedCount = 1; // only cell index 0 falls into this

      filter.offset = 4;
      expect(filter.renderedToSource(0)).toEqual(4);
      expect(filter.renderedToSource(1)).toEqual(5);
      expect(filter.renderedToSource(2)).toEqual(6);
    });
  });
});

/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableScroll', function () {
  var debug = false;
  var $container;
  var $wrapper;
  var $table;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden'
    });
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray(100, 4);
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  describe('scroll', function () {
    it('should scroll to last column when rowHeaders is not in use', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportHorizontally(getTotalColumns() - 1);
      wt.draw();
      expect($table.find('tbody tr:eq(0) td:last')[0].innerHTML).toBe('c');
    });
    it('should scroll to last column when rowHeaders is in use', function () {
      function plusOne(i) {
        return i + 1;
      }

      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnHeaders: [function (col, TH) {
          TH.innerHTML = plusOne(col);
        }],
        rowHeaders: [function (row, TH) {
          TH.innerHTML = plusOne(row);
        }]
      });
      wt.draw();
      wt.scrollViewportHorizontally(getTotalColumns() - 1);
      wt.draw();
      expect($table.find('tbody tr:eq(0) td:last')[0].innerHTML).toBe('c');
    });
    it('scroll not scroll the viewport if all rows are visible', function () {
      spec().data.splice(5);
      $wrapper.height(201).width(100);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.wtTable.getVisibleRowsCount()).toEqual(5);
      wt.scrollViewportVertically(getTotalRows() - 1);
      wt.draw();
      expect(wt.wtTable.getCoords($table.find('tbody tr:eq(0) td:eq(0)')[0])).toEqual(new Walkontable.CellCoords(0, 0));
    });
    it('scroll horizontal should take totalColumns if it is smaller than width', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportHorizontally(getTotalColumns() - 1);
      wt.draw();
      expect(wt.wtTable.getCoords($table.find('tbody tr:eq(0) td:eq(0)')[0])).toEqual(new Walkontable.CellCoords(0, 0));
    });
    it('scroll vertical should return `false` if given number smaller than 0', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewportVertically(-1)).toBe(false);
    });
    it('scroll vertical should return `false` if given number bigger than totalRows', function () {
      spec().data.splice(20, spec().data.length - 20);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewportVertically(999)).toBe(false);
    });
    it('scroll horizontal should return `false` if given number smaller than 0', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewportHorizontally(-1)).toBe(false);
    });
    it('scroll horizontal should return `false` if given number bigger than totalRows', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewportHorizontally(999)).toBe(false);
    });
    it('scroll viewport to a cell that is visible should do nothing', function () {
      $wrapper.height(201).width(120);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      var tmp = wt.getViewport();
      wt.scrollViewport(new Walkontable.CellCoords(0, 1));
      wt.draw();
      expect(wt.getViewport()).toEqual(tmp);
    });
    it('scroll viewport to a cell on far right should make it visible on right edge', function () {
      $wrapper.width(125).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      var height = $wrapper[0].clientHeight;
      var visibleRowCount = Math.floor(height / 23);
      wt.scrollViewport(new Walkontable.CellCoords(0, 2));
      wt.draw();
      expect(wt.getViewport()).toEqual([0, 1, visibleRowCount - 1, 2]);
    });
    it('scroll viewport to a cell on far left should make it visible on left edge', function () {
      $wrapper.width(100).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      var height = $wrapper[0].clientHeight;
      var visibleRowCount = Math.floor(height / 23);
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.getViewport()).toEqual([0, 3, visibleRowCount - 1, 3]);
      wt.scrollViewport(new Walkontable.CellCoords(0, 1));
      wt.draw();
      expect(wt.getViewport()).toEqual([0, 1, visibleRowCount - 1, 1]);
    });
    it('scroll viewport to a cell on far left should make it visible on left edge (with row header)', function () {
      $wrapper.width(140).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        rowHeaders: [function (row, TH) {
          TH.innerHTML = row + 1;
        }]
      });
      wt.draw();
      var height = $wrapper[0].clientHeight;
      var visibleRowCount = Math.floor(height / 23);
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.getViewport()).toEqual([0, 3, visibleRowCount - 1, 3]);
      wt.scrollViewport(new Walkontable.CellCoords(0, 1));
      wt.draw();
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(1);
    });
    it('scroll viewport to a cell on far right should make it visible on right edge (with row header)', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        rowHeaders: [function (row, TH) {
          TH.innerHTML = row + 1;
        }]
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 2));
      wt.draw();
      expect(wt.wtTable.getCoords($table.find('tbody tr:first td:last')[0])).toEqual(new Walkontable.CellCoords(0, 3));
    });
    it('scroll viewport to a cell on far bottom should make it visible on bottom edge', function () {
      $wrapper.width(125).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(12, 0));
      wt.draw();
      expect(wt.getViewport()[0]).toBeAroundValue(5);
      expect(wt.getViewport()[1]).toBeAroundValue(0);
      expect(wt.getViewport()[2]).toBeAroundValue(12);
      expect(wt.getViewport()[3]).toBeAroundValue(1);
    });
    it('scroll viewport to a cell on far top should make it visible on top edge', function () {
      $wrapper.width(100).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(20, 0));
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(12, 0));
      wt.draw();
      expect(wt.wtTable.getCoords($table.find('tbody tr:first td:first')[0])).toEqual(new Walkontable.CellCoords(12, 0));
    });
    it('scroll viewport to a cell that does not exist (vertically) should return `false`', function () {
      spec().data.splice(20, spec().data.length - 20);
      $wrapper.width(100).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewport(new Walkontable.CellCoords(40, 0))).toBe(false);
    });
    it('scroll viewport to a cell that does not exist (horizontally) should return `false`', function () {
      $wrapper.width(100).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.scrollViewport(new Walkontable.CellCoords(0, 40))).toBe(false);
    });
    it('remove row from the last scroll page should scroll viewport a row up if needed', function () {
      $wrapper.width(100).height(210);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(getTotalRows() - 1, 0));
      wt.draw();
      var originalViewportStartRow = wt.getViewport()[0];
      spec().data.splice(getTotalRows() - 4, 1); // remove row at index 96

      wt.draw();
      expect(originalViewportStartRow - 1).toEqual(wt.getViewport()[0]);
    });
    it('should scroll to last row if smaller data source is loaded that does not have currently displayed row', function () {
      $wrapper.width(100).height(260);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportVertically(50);
      wt.draw();
      spec().data.splice(30, spec().data.length - 30);
      wt.draw();
      expect($table.find('tbody tr').length).toBeGreaterThan(9);
    });
    it('should scroll to last column if smaller data source is loaded that does not have currently displayed column', function () {
      createDataArray(20, 100);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportHorizontally(50);
      wt.draw();
      createDataArray(100, 30);
      wt.draw();
      expect($table.find('tbody tr:first td').length).toBeGreaterThan(3);
    });
    it('should scroll to last row with very high rows', function () {
      createDataArray(20, 100);

      for (var i = 0, ilen = this.data.length; i < ilen; i++) {
        this.data[i][0] += '\n this \nis \na \nmultiline \ncell';
      }

      $wrapper.width(260).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportVertically(getTotalRows() - 1);
      wt.draw();
      expect($table.find('tbody tr:last td:first')[0]).toBe(wt.wtTable.getCell(new Walkontable.CellCoords(this.data.length - 1, 0))); // last rendered row should be last data row
    });
    xit('should scroll to last row with very high rows (respecting fixedRows)', function () {
      createDataArray(20, 100);

      for (var i = 0, ilen = spec().data.length; i < ilen; i++) {
        spec().data[i][0] += '\n this \nis \na \nmultiline \ncell';
      }

      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedRowsTop: 2
      });
      wt.draw();
      wt.scrollViewportVertically(2000);
      wt.draw();
      expect($table.find('tbody tr:eq(0) td:first')[0]).toBe(wt.wtTable.getCell(new Walkontable.CellCoords(0, 0))); // first rendered row should fixed row 0

      expect($table.find('tbody tr:eq(1) td:first')[0]).toBe(wt.wtTable.getCell(new Walkontable.CellCoords(1, 0))); // second rendered row should fixed row 1

      expect($table.find('tbody tr:eq(2) td:first')[0]).toBe(wt.wtTable.getCell(new Walkontable.CellCoords(2, 0))); // third rendered row should fixed row 1

      expect($table.find('tbody tr:last td:first')[0]).toBe(wt.wtTable.getCell(new Walkontable.CellCoords(spec().data.length - 1, 0))); // last rendered row should be last data row
    });
    it('should scroll to last column with very wide cells', function () {
      createDataArray(20, 100);
      $wrapper.width(260).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportHorizontally(50);
      wt.draw();
      createDataArray(100, 30);
      wt.draw();
      expect($table.find('tbody tr:first td').length).toBeGreaterThan(3);
    });
    it('should scroll the desired cell to the bottom edge even if it\'s located in a fixed column', function (done) {
      createDataArray(20, 100);
      $wrapper.width(260).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedColumnsLeft: 2
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(8, 1));
      wt.draw();
      setTimeout(function () {
        expect(wt.wtTable.getLastVisibleRow()).toBe(8);
        done();
      }, 20);
    });
    it('should update the scroll position of overlays only once, when scrolling the master table', function (done) {
      createDataArray(100, 100);
      $wrapper.width(260).height(201);
      var topOverlayCallback = jasmine.createSpy('topOverlayCallback');
      var leftOverlayCallback = jasmine.createSpy('leftOverlayCallback');
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedColumnsLeft: 2,
        fixedRowsTop: 2
      });
      var masterHolder = wt.wtTable.holder;
      var leftOverlayHolder = wt.wtOverlays.leftOverlay.clone.wtTable.holder;
      var topOverlayHolder = wt.wtOverlays.topOverlay.clone.wtTable.holder;
      topOverlayHolder.addEventListener('scroll', topOverlayCallback);
      leftOverlayHolder.addEventListener('scroll', leftOverlayCallback);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(50, 50));
      wt.draw();
      setTimeout(function () {
        expect(topOverlayCallback.calls.count()).toEqual(1);
        expect(leftOverlayCallback.calls.count()).toEqual(1);
        expect(topOverlayHolder.scrollLeft).toEqual(masterHolder.scrollLeft);
        expect(leftOverlayHolder.scrollTop).toEqual(masterHolder.scrollTop);
        topOverlayHolder.removeEventListener('scroll', topOverlayCallback);
        leftOverlayHolder.removeEventListener('scroll', leftOverlayCallback);
        done();
      }, 20);
    });
    it('should call onScrollVertically hook, if scrollTop was changed', function (done) {
      createDataArray(100, 100);
      $wrapper.width(260).height(201);
      var scrollHorizontally = jasmine.createSpy('scrollHorizontal');
      var scrollVertically = jasmine.createSpy('scrollVertically');
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedColumnsLeft: 2,
        fixedRowsTop: 2,
        onScrollVertically: scrollVertically,
        onScrollHorizontally: scrollHorizontally
      });
      wt.draw();
      wt.wtTable.holder.scrollTop = 400;
      wt.draw();
      setTimeout(function () {
        expect(scrollVertically.calls.count()).toEqual(1);
        expect(scrollHorizontally.calls.count()).toEqual(0);
        done();
      }, 50);
    });
    it('should call onScrollHorizontally hook, if scrollLeft was changed', function (done) {
      createDataArray(100, 100);
      $wrapper.width(260).height(201);
      var scrollHorizontally = jasmine.createSpy('scrollHorizontal');
      var scrollVertically = jasmine.createSpy('scrollVertically');
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedColumnsLeft: 2,
        fixedRowsTop: 2,
        onScrollVertically: scrollVertically,
        onScrollHorizontally: scrollHorizontally
      });
      wt.draw();
      wt.wtTable.holder.scrollLeft = 400;
      wt.draw();
      setTimeout(function () {
        expect(scrollVertically.calls.count()).toEqual(0);
        expect(scrollHorizontally.calls.count()).toEqual(1);
        done();
      }, 50);
    }); // Commented due to PhantomJS WheelEvent problem.
    // Throws an error: TypeError: '[object WheelEventConstructor]' is not a constructor

    xit('should scroll the table when the `wheel` event is triggered on the corner overlay', function (done) {
      createDataArray(100, 100);
      $wrapper.width(260).height(201);
      var masterCallback = jasmine.createSpy('masterCallback');
      var topCallback = jasmine.createSpy('topCallback');
      var leftCallback = jasmine.createSpy('leftCallback');
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        fixedColumnsLeft: 2,
        fixedRowsTop: 2
      });
      wt.draw();
      var topLeftCornerOverlayHolder = wt.wtOverlays.topLeftCornerOverlay.clone.wtTable.holder;
      var topHolder = wt.wtOverlays.topOverlay.clone.wtTable.holder;
      var leftHolder = wt.wtOverlays.leftOverlay.clone.wtTable.holder;
      var masterHolder = wt.wtTable.holder;
      masterHolder.addEventListener('scroll', masterCallback);
      topHolder.addEventListener('scroll', topCallback);
      leftHolder.addEventListener('scroll', leftCallback);
      var wheelEvent = new WheelEvent('wheel', {
        deltaX: 400
      });
      topLeftCornerOverlayHolder.dispatchEvent(wheelEvent);
      wt.draw();
      setTimeout(function () {
        expect(masterCallback.callCount).toEqual(1);
        expect(topCallback.callCount).toEqual(1);
        expect(leftCallback.callCount).toEqual(0);
        wheelEvent = new WheelEvent('wheel', {
          deltaY: 400
        });
        topLeftCornerOverlayHolder.dispatchEvent(wheelEvent);
        wt.draw();
      }, 20);
      setTimeout(function () {
        expect(masterCallback.callCount).toEqual(2);
        expect(topCallback.callCount).toEqual(1);
        expect(leftCallback.callCount).toEqual(1);
        done();
      }, 40);
    });
  });
  describe('scrollViewport - horizontally', function () {
    beforeEach(function () {
      $wrapper.width(201).height(201);
    });
    it('should scroll to last column on the right', function () {
      spec().data = createSpreadsheetData(10, 10);
      $wrapper.width(201).height(201);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: 50
      });
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(2);
      wt.scrollViewport(new Walkontable.CellCoords(0, 9));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9);
    });
    it('should not scroll back to a column that is in viewport', function () {
      spec().data = createSpreadsheetData(10, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: 50
      });
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(2);
      wt.scrollViewport(new Walkontable.CellCoords(0, 9));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9);
      wt.scrollViewport(new Walkontable.CellCoords(0, 9));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9); // nothing changed

      wt.scrollViewport(new Walkontable.CellCoords(0, 8));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9); // nothing changed

      wt.scrollViewport(new Walkontable.CellCoords(0, 7));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9); // nothing changed
    });
    it('should scroll back to a column that is before viewport', function () {
      spec().data = createSpreadsheetData(10, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: 50
      });
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(2);
      wt.scrollViewport(new Walkontable.CellCoords(0, 9));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(5);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 4));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(5); // nothing changed

      wt.scrollViewport(new Walkontable.CellCoords(0, 9));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(9);
    });
    it('should scroll to a column that is after viewport', function () {
      spec().data = createSpreadsheetData(10, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: 50
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 2));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(2);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 4));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(4);
    });
    it('should scroll to a wide column that is after viewport', function () {
      spec().data = createSpreadsheetData(10, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: function columnWidth(col) {
          if (col === 3) {
            return 100;
          }

          return 50;
        }
      });
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(2);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(0);
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(2);
    });
    xit('should scroll to a very wide column that is after viewport', function () {
      spec().data = createSpreadsheetData(10, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: function columnWidth(col) {
          if (col === 3) {
            return 300;
          }

          return 50;
        }
      });
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(0);
      wt.scrollViewport(new Walkontable.CellCoords(0, 3)).draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(3);
      wt.scrollViewport(new Walkontable.CellCoords(0, 2)).draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(2);
      wt.scrollViewport(new Walkontable.CellCoords(0, 3)).draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(3);
      wt.scrollViewport(new Walkontable.CellCoords(0, 4)).draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(4);
      expect(wt.wtTable.getFirstVisibleColumn()).toEqual(3);
    });
    xit('should scroll to a very wide column that is after viewport (with fixedColumnsLeft)', function () {
      spec().data = createSpreadsheetData(1, 10);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: function columnWidth(col) {
          if (col === 3) {
            return 300;
          }

          return 50;
        },
        fixedColumnsLeft: 2
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 2));
      wt.draw();
      expect(wt.wtTable.getFirstVisibleColumn()).toBeGreaterThan(2);
      expect(wt.wtTable.getLastVisibleColumn()).toBeGreaterThan(2);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 3));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(3);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(0, 4));
      wt.draw();
      expect(wt.wtTable.getLastVisibleColumn()).toEqual(4);
    });
  });
  describe('scrollViewport - vertically', function () {
    beforeEach(function () {
      $wrapper.width(201).height(201);
    });
    xit('should scroll to a very high row that is after viewport', function () {
      spec().data = createSpreadsheetData(20, 1);
      var txt = 'Very very very very very very very very very very very very very very very very very long text.';
      spec().data[4][0] = txt;
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.wtTable.getFirstVisibleRow()).toEqual(0);
      wt.scrollViewport(new Walkontable.CellCoords(4, 0));
      wt.draw();
      expect(wt.wtTable.getLastVisibleRow()).toEqual(4);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(5, 0));
      wt.draw();
      expect(wt.wtTable.getLastVisibleRow()).toEqual(5);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(4, 0));
      wt.draw();
      expect(wt.wtTable.getFirstVisibleRow()).toEqual(4);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(3, 0));
      wt.draw();
      expect(wt.wtTable.getFirstVisibleRow()).toEqual(3);
    });
    xit('should scroll to a very high row that is after viewport (at the end)', function () {
      spec().data = createSpreadsheetData(20, 1);
      var txt = 'Very very very very very very very very very very very very very very very very very long text.';
      spec().data[19][0] = txt;
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(18, 0));
      wt.draw();
      expect($table.find('tbody tr').length).toBe(2);
      expect($table.find('tbody tr:eq(0) td:eq(0)').html()).toBe('A18');
      expect($table.find('tbody tr:eq(1) td:eq(0)').html()).toBe(txt);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(19, 0));
      wt.draw();
      expect($table.find('tbody tr').length).toBe(1);
      expect($table.find('tbody tr:eq(0) td:eq(0)').html()).toBe(txt); // scrolled down

      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(18, 0));
      wt.draw();
      expect($table.find('tbody tr').length).toBe(2);
      expect($table.find('tbody tr:eq(0) td:eq(0)').html()).toBe('A18'); // scrolled up

      expect($table.find('tbody tr:eq(1) td:eq(0)').html()).toBe(txt);
      wt.draw();
      wt.scrollViewport(new Walkontable.CellCoords(17, 0));
      wt.draw();
      expect($table.find('tbody tr').length).toBe(3);
      expect($table.find('tbody tr:eq(0) td:eq(0)').html()).toBe('A17'); // scrolled up

      expect($table.find('tbody tr:eq(1) td:eq(0)').html()).toBe('A18');
      expect($table.find('tbody tr:eq(2) td:eq(0)').html()).toBe(txt);
    });
  });
});

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableScrollbar', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden'
    });
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should table in DIV.wtHolder that contains 2 scrollbars', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.parents('.wtHolder').length).toEqual(1);
  });
  it('scrolling should have no effect when totalRows is smaller than height', function () {
    this.data.splice(5, this.data.length - 5);

    try {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.wtOverlays.topOverlay.onScroll(1);
      expect(wt.getViewport()[0]).toEqual(0);
      wt.wtOverlays.topOverlay.onScroll(-1);
      expect(wt.getViewport()[0]).toEqual(0);
    } catch (e) {
      expect(e).toBeUndefined();
    }
  });
});

/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableScrollbarNative', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden'
    });
    $wrapper.width(100).height(200);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('initial render should be no different than the redraw (vertical)', function () {
    createDataArray(100, 1);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var tds = $table.find('td').length;
    wt.draw();
    expect($table.find('td').length).toEqual(tds);
  });
  it('initial render should be no different than the redraw (horizontal)', function () {
    createDataArray(1, 50);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var tds = $table.find('td').length;
    wt.draw();
    expect($table.find('td').length).toEqual(tds);
  });
  it('scrolling 50px down should render 2 more rows', function () {
    createDataArray(20, 4);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var lastRenderedRow = wt.wtTable.getLastRenderedRow();
    $(wt.wtTable.holder).scrollTop(50);
    wt.draw();
    expect(wt.wtTable.getLastRenderedRow()).toEqual(lastRenderedRow + 2);
  });
  it('should recognize the scrollHandler properly, even if the \'overflow\' property is assigned in an external stylesheet', function () {
    $wrapper.css({
      overflow: ''
    });
    $wrapper.addClass('testOverflowHidden');
    createDataArray(20, 4);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    wt.wtOverlays.topOverlay.scrollTo(3);
    expect($(wt.wtTable.holder).scrollTop()).toEqual(69);
  });
});

/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('Walkontable.Selection', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden'
    });
    $wrapper.width(100).height(200);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should add/remove class to selection when cell is clicked', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController(),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    var $td1 = $table.find('tbody td:eq(0)');
    var $td2 = $table.find('tbody td:eq(1)');
    $td1.simulate('mousedown');
    expect($td1.hasClass('current')).toEqual(true);
    $td2.simulate('mousedown');
    expect($td1.hasClass('current')).toEqual(false);
    expect($td2.hasClass('current')).toEqual(true);
  });
  it('should add class to selection on all overlays', function () {
    $wrapper.width(300).height(300);
    this.data = createSpreadsheetData(10, 10);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController(),
      fixedColumnsLeft: 2,
      fixedRowsTop: 2
    });
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(1, 1));
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(1, 2));
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(2, 1));
    wt.selections.createOrGetArea().add(new Walkontable.CellCoords(2, 2));
    wt.draw();
    var tds = $wrapper.find('td:contains(B2), td:contains(B3), td:contains(C2), td:contains(C3)');
    expect(tds.length).toBeGreaterThan(4);

    for (var i = 0, ilen = tds.length; i < ilen; i++) {
      expect(tds[i].className).toContain('area');
    }
  });
  it('should not add class to selection until it is rerendered', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController()
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    var $td1 = $table.find('tbody td:eq(0)');
    expect($td1.hasClass('current')).toEqual(false);
    wt.draw();
    expect($td1.hasClass('current')).toEqual(true);
  });
  it('should add/remove border to selection when cell is clicked', function (done) {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController(),
      onCellMouseDown: function onCellMouseDown(event, coords) {
        wt.selections.getCell().clear();
        wt.selections.getCell().add(coords);
        wt.draw();
      }
    });
    wt.draw();
    setTimeout(function () {
      var $td1 = $table.find('tbody tr:eq(1) td:eq(0)');
      var $td2 = $table.find('tbody tr:eq(2) td:eq(1)');
      var $top = $(wt.selections.getCell().getBorder(wt).top); // cheat... get border for ht_master

      $td1.simulate('mousedown');
      var pos1 = $top.position();
      expect(pos1.top).toBeGreaterThan(0);
      expect(pos1.left).toBe(0);
      $td2.simulate('mousedown');
      var pos2 = $top.position();
      expect(pos2.top).toBeGreaterThan(pos1.top);
      expect(pos2.left).toBeGreaterThan(pos1.left);
      done();
    }, 1500);
  });
  it('should add a selection that is outside of the viewport', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController()
    });
    wt.draw();
    wt.selections.getCell().add([20, 0]);
    expect(wt.wtTable.getCoords($table.find('tbody tr:first td:first')[0])).toEqual(new Walkontable.CellCoords(0, 0));
  });
  it('should not scroll the viewport after selection is cleared', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController()
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    wt.draw();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(0);
    wt.scrollViewportVertically(17);
    wt.draw();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(10);
    expect(wt.wtTable.getLastVisibleRow()).toBeAroundValue(17);
    wt.selections.getCell().clear();
    expect(wt.wtTable.getFirstVisibleRow()).toEqual(10);
    expect(wt.wtTable.getLastVisibleRow()).toBeAroundValue(17);
  });
  it('should clear a selection that has more than one cell', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController()
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 1));
    wt.selections.getCell().clear();
    expect(wt.selections.getCell().cellRange).toEqual(null);
  });
  it('should highlight cells in selected row & column', function () {
    $wrapper.width(300);
    var customSelection = new Walkontable.Selection({
      highlightRowClassName: 'highlightRow',
      highlightColumnClassName: 'highlightColumn'
    });
    customSelection.add(new Walkontable.CellCoords(0, 0));
    customSelection.add(new Walkontable.CellCoords(0, 1));
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        custom: [customSelection]
      })
    });
    wt.draw();
    expect($table.find('.highlightRow').length).toEqual(2);
    expect($table.find('.highlightColumn').length).toEqual(wt.wtTable.getRenderedRowsCount() * 2 - 2);
  });
  it('should highlight cells in selected row & column, when same class is shared between 2 selection definitions', function () {
    $wrapper.width(300);
    var customSelection1 = new Walkontable.Selection({
      highlightRowClassName: 'highlightRow',
      highlightColumnClassName: 'highlightColumn'
    });
    customSelection1.add(new Walkontable.CellCoords(0, 0));
    var customSelection2 = new Walkontable.Selection({
      highlightRowClassName: 'highlightRow',
      highlightColumnClassName: 'highlightColumn'
    });
    customSelection2.add(new Walkontable.CellCoords(0, 0));
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        custom: [customSelection1, customSelection2]
      })
    });
    wt.draw();
    expect($table.find('.highlightRow').length).toEqual(3);
    expect($table.find('.highlightColumn').length).toEqual(wt.wtTable.getRenderedRowsCount() - 1);
  });
  it('should remove highlight when selection is deselected', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      selections: createSelectionController({
        current: new Walkontable.Selection({
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        })
      })
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 0));
    wt.selections.getCell().add(new Walkontable.CellCoords(0, 1));
    wt.draw();
    wt.selections.getCell().clear();
    wt.draw();
    expect($table.find('.highlightRow').length).toEqual(0);
    expect($table.find('.highlightColumn').length).toEqual(0);
  });
  it('should add/remove appropriate class to the row/column headers of selected cells', function () {
    $wrapper.width(300);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      selections: createSelectionController({
        current: new Walkontable.Selection({
          highlightRowClassName: 'highlightRow',
          highlightColumnClassName: 'highlightColumn'
        })
      })
    });
    wt.draw();
    wt.selections.getCell().add(new Walkontable.CellCoords(1, 1));
    wt.selections.getCell().add(new Walkontable.CellCoords(2, 2));
    wt.draw(); // left side:
    // -2 -> because one row is partially visible
    // right side:
    // *2 -> because there are 2 columns selected
    // +2 -> because there are the headers
    // -4 -> because 4 cells are selected = there are overlapping highlightRow class

    expect($table.find('.highlightRow').length).toEqual(wt.wtViewport.columnsVisibleCalculator.count * 2 + 2 - 4);
    expect($table.find('.highlightColumn').length - 2).toEqual(wt.wtViewport.rowsVisibleCalculator.count * 2 + 2 - 4);
    expect($table.find('.highlightColumn').length).toEqual(14);
    expect(getTableTopClone().find('.highlightColumn').length).toEqual(2);
    expect(getTableTopClone().find('.highlightRow').length).toEqual(0);
    expect(getTableLeftClone().find('.highlightColumn').length).toEqual(0);
    expect(getTableLeftClone().find('.highlightRow').length).toEqual(2);
    var $colHeaders = $table.find('thead tr:first-child th');
    var $rowHeaders = $table.find('tbody tr th:first-child');
    expect($colHeaders.eq(2).hasClass('highlightColumn')).toBe(true);
    expect($colHeaders.eq(3).hasClass('highlightColumn')).toBe(true);
    expect($rowHeaders.eq(1).hasClass('highlightRow')).toBe(true);
    expect($rowHeaders.eq(2).hasClass('highlightRow')).toBe(true);
    wt.selections.getCell().clear();
    wt.draw();
    expect($table.find('.highlightRow').length).toEqual(0);
    expect($table.find('.highlightColumn').length).toEqual(0);
    expect(getTableTopClone().find('.highlightColumn').length).toEqual(0);
    expect(getTableTopClone().find('.highlightRow').length).toEqual(0);
    expect(getTableLeftClone().find('.highlightColumn').length).toEqual(0);
    expect(getTableLeftClone().find('.highlightRow').length).toEqual(0);
  });
  describe('replace', function () {
    it('should replace range from property and return true', function () {
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        selections: createSelectionController()
      });
      wt.selections.getCell().add(new Walkontable.CellCoords(1, 1));
      wt.selections.getCell().add(new Walkontable.CellCoords(3, 3));
      var result = wt.selections.getCell().replace(new Walkontable.CellCoords(3, 3), new Walkontable.CellCoords(4, 4));
      expect(result).toBe(true);
      expect(wt.selections.getCell().getCorners()).toEqual([1, 1, 4, 4]);
    });
  });
});

/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('columnHeaders option', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden',
      position: 'relative'
    });
    $wrapper.width(500).height(201);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should not add class `htColumnHeaders` when column headers are disabled', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($wrapper.hasClass('htColumnHeaders')).toBe(false);
  });
  it('should add class `htColumnHeaders` when column headers are enabled', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($wrapper.hasClass('htColumnHeaders')).toBe(true);
  });
  it('should create table with column headers', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($wrapper.find('.ht_clone_left colgroup col').length).toBe(0);
    expect($wrapper.find('.ht_clone_left thead tr').length).toBe(1);
    expect($wrapper.find('.ht_clone_left tbody tr').length).toBe(0);
    expect($wrapper.find('.ht_clone_top colgroup col').length).toBe(4);
    expect($wrapper.find('.ht_clone_top thead tr').length).toBe(1);
    expect($wrapper.find('.ht_clone_top tbody tr').length).toBe(0);
    expect($wrapper.find('.ht_master colgroup col').length).toBe(4);
    expect($wrapper.find('.ht_master thead tr').length).toBe(1);
    expect($wrapper.find('.ht_master tbody tr').length).toBe(9);
  });
  it('should create column headers with correct height when th has css `white-space: normal`', function () {
    var style = $('<style>.handsontable thead th {white-space: normal;}</style>').appendTo('head');
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = 'Client State State';
      }],
      columnWidth: 80
    });
    wt.draw();
    expect($wrapper.find('.ht_clone_top thead tr').height()).toBe(43);
    style.remove();
  });
  it('should create column headers with correct height when th has css `white-space: pre-line` (default)', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = 'Client State State';
      }],
      columnWidth: 80
    });
    wt.draw();
    expect($wrapper.find('.ht_clone_top thead tr').height()).toBe(23);
  });
  it('should generate column headers from function', function () {
    var headers = ['Description', 2012, 2013, 2014];
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (column, TH) {
        TH.innerHTML = headers[column];
      }]
    });
    wt.draw();
    var visibleHeaders = headers.slice(0, wt.wtTable.getLastRenderedColumn() + 1); // headers for rendered columns only

    expect($table.find('thead tr:first th').length).toBe(visibleHeaders.length);
    expect($table.find('thead tr:first th').text()).toEqual(visibleHeaders.join(''));
  });
});

/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('preventOverflow option', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      position: 'relative'
    });
    $wrapper.width(500).height(201);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray(100, 100);
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should set overflow to `auto` for master table when `horizontal` value is passed', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      preventOverflow: function preventOverflow() {
        return 'horizontal';
      }
    });
    wt.draw();
    expect($table.parents('.wtHolder').css('overflow')).toBe('auto');
    expect($table.parents('.ht_master').css('overflow')).toBe('visible');
  });
  it('should set overflow-x to `auto` for top clone when `horizontal` value is passed', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (column, TH) {
        TH.innerHTML = column + 1;
      }],
      preventOverflow: function preventOverflow() {
        return 'horizontal';
      }
    });
    wt.draw();
    expect($(wt.wtTable.wtRootElement.parentNode).find('.ht_clone_top .wtHolder').css('overflow-x')).toBe('auto');
    expect($(wt.wtTable.wtRootElement.parentNode).find('.ht_clone_top .wtHolder').css('overflow-y')).toBe('hidden');
  });
});

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('rowHeaders option', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden',
      position: 'relative'
    });
    $wrapper.width(500).height(201);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should not add class `htRowHeader` when row headers are disabled', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($wrapper.hasClass('htRowHeaders')).toBe(false);
  });
  it('should add class `htRowHeader` when row headers are enabled', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    expect($wrapper.hasClass('htRowHeaders')).toBe(true);
  });
  it('should create table row headers', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    expect($wrapper.find('.ht_clone_left colgroup col').length).toBe(1);
    expect($wrapper.find('.ht_clone_left thead tr').length).toBe(0);
    expect($wrapper.find('.ht_clone_left tbody tr').length).toBe(9);
    expect($wrapper.find('.ht_clone_top colgroup col').length).toBe(0);
    expect($wrapper.find('.ht_clone_top thead tr').length).toBe(0);
    expect($wrapper.find('.ht_clone_top tbody tr').length).toBe(0);
    expect($wrapper.find('.ht_master colgroup col').length).toBe(5);
    expect($wrapper.find('.ht_master thead tr').length).toBe(0);
    expect($wrapper.find('.ht_master tbody tr').length).toBe(9);
  });
  it('should generate headers from function', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    var potentialRowCount = 9;
    expect($table.find('tbody td').length).toBe(potentialRowCount * wt.wtTable.getRenderedColumnsCount()); // displayed cells

    expect($table.find('tbody th').length).toBe(potentialRowCount); // 9*1=9 displayed row headers

    expect($table.find('tbody tr:first th').length).toBe(1); // only one th per row

    expect($table.find('tbody tr:first th')[0].innerHTML).toBe('1'); // this should be the first row header
  });
  it('should add \'rowHeader\' class to row header column', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($table.find('col:first').hasClass('rowHeader')).toBe(true);
  });
});

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('stretchH option', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden',
      position: 'relative'
    });
    $wrapper.width(500).height(201);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should stretch all visible columns when stretchH equals \'all\'', function () {
    createDataArray(20, 2);
    $wrapper.width(500).height(400);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'all',
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    expect($table.outerWidth()).toBeAroundValue(wt.wtTable.holder.clientWidth); // fix differences between Mac and Linux PhantomJS

    expect($table.find('col:eq(2)').width() - $table.find('col:eq(1)').width()).toBeInArray([-1, 0, 1]);
  });
  it('should stretch all visible columns when stretchH equals \'all\' and window is resized', function (done) {
    createDataArray(20, 2);
    $wrapper.width(500).height(400);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'all',
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    var initialTableWidth = $table.outerWidth();
    expect(initialTableWidth).toBeAroundValue($table[0].clientWidth);
    $wrapper.width(600).height(500);
    var evt = document.createEvent('CustomEvent'); // MUST be 'CustomEvent'

    evt.initCustomEvent('resize', false, false, null);
    window.dispatchEvent(evt);
    setTimeout(function () {
      var currentTableWidth = $table.outerWidth();
      expect(currentTableWidth).toBeAroundValue($table[0].clientWidth);
      expect(currentTableWidth).toBeGreaterThan(initialTableWidth);
      done();
    }, 10);
  });
  it('should stretch all visible columns when stretchH equals \'all\' (when rows are of variable height)', function () {
    createDataArray(20, 2);

    for (var i = 0, ilen = this.data.length; i < ilen; i++) {
      if (i % 2) {
        this.data[i][0] += ' this is a cell that contains a lot of text, which will make it multi-line';
      }
    }

    $wrapper.width(300);
    $wrapper.css({
      overflow: 'hidden'
    });
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'all'
    });
    wt.draw();
    var expectedColWidth = (300 - getScrollbarWidth()) / 2;
    expectedColWidth = Math.floor(expectedColWidth);
    var wtHider = $table.parents('.wtHider');
    expect(wtHider.find('col:eq(0)').width()).toBeAroundValue(expectedColWidth);
    expect(wtHider.find('col:eq(1)').width() - expectedColWidth).toBeInArray([0, 1]); // fix differences between Mac and Linux PhantomJS
  });
  it('should stretch last visible column when stretchH equals \'last\' (vertical scroll)', function () {
    createDataArray(20, 2);
    $wrapper.width(300).height(201);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'last',
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    var wtHider = $table.parents('.wtHider');
    expect(wtHider.outerWidth()).toBe(getTableWidth($table));
    expect(wtHider.find('col:eq(1)').width()).toBeLessThan(wtHider.find('col:eq(2)').width());
  });
  it('should stretch last column when stretchH equals \'last\' (horizontal scroll)', function () {
    createDataArray(5, 20);
    $wrapper.width(400).height(201);
    spec().data[0][19] = 'longer text';
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'last',
      columnHeaders: [function (index, TH) {
        TH.innerHTML = index + 1;
      }],
      columnWidth: function columnWidth(index) {
        return index === 19 ? 100 : 50;
      }
    });
    wt.draw();
    wt.scrollViewportHorizontally(19);
    wt.draw();
    var wtHider = $table.parents('.wtHider');
    expect(wtHider.find('col:eq(6)').width()).toBe(100);
  });
  it('should stretch last visible column when stretchH equals \'last\' (no scrolls)', function () {
    createDataArray(2, 2);
    $wrapper.width(300).height(201);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'last',
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    var wtHider = $table.parents('.wtHider');
    expect(wtHider.outerWidth()).toBe(getTableWidth($table));
    expect(wtHider.find('col:eq(1)').width()).toBeLessThan(wtHider.find('col:eq(2)').width());
  });
  it('should not stretch when stretchH equals \'none\'', function () {
    createDataArray(20, 2);
    $wrapper.width(300).height(201);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      stretchH: 'none',
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }]
    });
    wt.draw();
    expect($table.width()).toBeLessThan($wrapper.width());
    expect($table.find('col:eq(1)').width()).toBe($table.find('col:eq(2)').width());
  });
});

/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


describe('WalkontableTable', function () {
  var $table;
  var $container;
  var $wrapper;
  var debug = false;
  beforeEach(function () {
    $wrapper = $('<div></div>').css({
      overflow: 'hidden',
      position: 'relative'
    });
    $wrapper.width(100).height(201);
    $container = $('<div></div>');
    $table = $('<table></table>'); // create a table that is not attached to document

    $wrapper.append($container);
    $container.append($table);
    $wrapper.appendTo('body');
    createDataArray();
  });
  afterEach(function () {
    if (!debug) {
      $('.wtHolder').remove();
    }

    $wrapper.remove();
  });
  it('should create as many rows as fits in height', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(9);
  });
  it('should create as many rows as in `totalRows` if it is smaller than `height`', function () {
    this.data.splice(5, this.data.length - 5);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(5);
  });
  it('first row should have as many columns as in THEAD', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe($table.find('thead th').length);
  });
  it('should put a blank cell in the corner if both rowHeaders and colHeaders are set', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        if (col > -1) {
          TH.innerHTML = 'Column';
        }
      }],
      rowHeaders: [function (row, TH) {
        if (row > -1) {
          TH.innerHTML = 'Row';
        }
      }]
    });
    wt.draw();
    expect($table.find('thead tr:first th').length).toBe(wt.wtTable.getRenderedColumnsCount() + 1); // 4 columns in THEAD + 1 empty cell in the corner

    expect($table.find('thead tr:first th:eq(0)')[0].innerHTML.replace(/&nbsp;/, '')).toBe(''); // corner row is empty (or contains only &nbsp;)

    expect($table.find('thead tr:first th:eq(1)')[0].innerHTML).toBe('Column');
    expect($table.find('tbody tr:first th:eq(0)')[0].innerHTML).toBe('Row');
  });
  it('getCell should only return cells from rendered rows', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect(wt.wtTable.getCell(new Walkontable.CellCoords(7, 0)) instanceof HTMLElement).toBe(true);
    expect($table.find('tr:eq(8) td:first-child').text()).toEqual(this.data[8][0].toString());
    expect(wt.wtTable.getCell(new Walkontable.CellCoords(20, 0))).toBe(-2); // exit code

    expect(wt.wtTable.getCell(new Walkontable.CellCoords(25, 0))).toBe(-2); // exit code
  });
  it('getCoords should return coords of TD', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    var $td2 = $table.find('tbody tr:eq(1) td:eq(1)');
    expect(wt.wtTable.getCoords($td2[0])).toEqual(new Walkontable.CellCoords(1, 1));
  });
  it('getCoords should return coords of TD (with row header)', function () {
    $wrapper.width(300);

    function plusOne(i) {
      return i + 1;
    }

    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = plusOne(row);
      }]
    });
    wt.draw();
    var $td2 = $table.find('tbody tr:eq(1) td:eq(1)');
    expect(wt.wtTable.getCoords($td2[0])).toEqual(new Walkontable.CellCoords(1, 1));
  });
  it('getStretchedColumnWidth should return valid column width when stretchH is set as \'all\'', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      stretchH: 'all'
    });
    wt.draw();
    wt.wtViewport.columnsRenderCalculator.refreshStretching(502);
    expect(wt.wtTable.getStretchedColumnWidth(0, 50)).toBe(125);
    expect(wt.wtTable.getStretchedColumnWidth(1, 50)).toBe(125);
    expect(wt.wtTable.getStretchedColumnWidth(2, 50)).toBe(125);
    expect(wt.wtTable.getStretchedColumnWidth(3, 50)).toBe(127);
  });
  it('getStretchedColumnWidth should return valid column width when stretchH is set as \'last\'', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      stretchH: 'last'
    });
    wt.draw();
    wt.wtViewport.columnsRenderCalculator.refreshStretching(502);
    expect(wt.wtTable.getStretchedColumnWidth(0, 50)).toBe(50);
    expect(wt.wtTable.getStretchedColumnWidth(1, 50)).toBe(50);
    expect(wt.wtTable.getStretchedColumnWidth(2, 50)).toBe(50);
    expect(wt.wtTable.getStretchedColumnWidth(3, 50)).toBe(352);
  });
  it('should use custom cell renderer if provided', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        var cellData = getData(row, column);

        if (cellData === void 0) {
          TD.innerHTML = '';
        } else {
          TD.innerHTML = cellData;
        }

        TD.className = '';
        TD.style.backgroundColor = 'yellow';
      }
    });
    wt.draw();
    expect($table.find('td:first')[0].style.backgroundColor).toBe('yellow');
  });
  it('should remove rows if they were removed in data source', function () {
    this.data.splice(8, this.data.length - 8); // second param is required by IE8

    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    expect($table.find('tbody tr').length).toBe(8);
    this.data.splice(7, this.data.length - 7); // second param is required by IE8

    wt.draw();
    expect($table.find('tbody tr').length).toBe(7);
  });
  it('should render as much columns as the container width allows, if width is null', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(2);
    expect($table.find('tbody tr:first').children().length).toBe(2);
    $wrapper.width(200);
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(4);
    expect($table.find('tbody tr:first').children().length).toBe(4);
  });
  it('should render as much columns as the container width allows, if width is null (with row header)', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }]
    });
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(2);
    expect($table.find('tbody tr:first').children().length).toBe(2);
    $wrapper.width(200);
    wt.draw();
    expect($table.find('thead tr:first').children().length).toBe(4);
    expect($table.find('tbody tr:first').children().length).toBe(4);
  });
  it('should use column width function to get column width', function () {
    $wrapper.width(600);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      columnWidth: function columnWidth(column) {
        return (column + 1) * 50;
      }
    });
    wt.draw();
    expect($table.find('tbody tr:first td:eq(0)').outerWidth()).toBe(50);
    expect($table.find('tbody tr:first td:eq(1)').outerWidth()).toBe(100);
    expect($table.find('tbody tr:first td:eq(2)').outerWidth()).toBe(150);
    expect($table.find('tbody tr:first td:eq(3)').outerWidth()).toBe(200);
  });
  it('should use column width array to get column width', function () {
    $wrapper.width(600);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      columnWidth: [50, 100, 150, 201]
    });
    wt.draw();
    expect($table.find('tbody tr:first td:eq(0)').outerWidth()).toBe(50);
    expect($table.find('tbody tr:first td:eq(1)').outerWidth()).toBe(100);
    expect($table.find('tbody tr:first td:eq(2)').outerWidth()).toBe(150);
    expect($table.find('tbody tr:first td:eq(3)').outerWidth()).toBe(201);
  });
  it('should use column width integer to get column width', function () {
    $wrapper.width(600);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      columnWidth: 100
    });
    wt.draw();
    expect($table.find('tbody tr:first td:eq(0)').outerWidth()).toBe(100);
    expect($table.find('tbody tr:first td:eq(1)').outerWidth()).toBe(100);
    expect($table.find('tbody tr:first td:eq(2)').outerWidth()).toBe(100);
    expect($table.find('tbody tr:first td:eq(3)').outerWidth()).toBe(100);
  });
  it('should use column width also when there are no rows', function () {
    this.data.length = 0;
    $wrapper.width(600);
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: 4,
      rowHeaders: [function (row, TH) {
        TH.innerHTML = row + 1;
      }],
      columnHeaders: [function (col, TH) {
        TH.innerHTML = col + 1;
      }],
      columnWidth: 100
    });
    wt.draw(); // start from eq(1) because eq(0) is corner header

    expect($table.find('thead tr:first th:eq(1)').outerWidth()).toBe(100);
    expect($table.find('thead tr:first th:eq(2)').outerWidth()).toBe(100);
    expect($table.find('thead tr:first th:eq(3)').outerWidth()).toBe(100);
    expect($table.find('thead tr:first th:eq(4)').outerWidth()).toBe(100);
  });
  it('should render a cell that is outside of the viewport horizontally', function () {
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns
    });
    wt.draw();
    $table.find('tbody td').html('');
    wt.draw();
    expect($table.find('tbody tr:first td').length).toBe(2);
  });
  it('should not render a cell when fastDraw == true', function () {
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        count += 1;
        return wt.wtSettings.defaults.cellRenderer(row, column, TD);
      }
    });
    wt.draw();
    var oldCount = count;
    wt.draw(true);
    expect(count).toBe(oldCount);
  });
  it('should not ignore fastDraw == true when grid was scrolled by amount of rows that doesn\'t exceed endRow', function () {
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        count += 1;
        return wt.wtSettings.defaults.cellRenderer(row, column, TD);
      },
      viewportRowCalculatorOverride: function viewportRowCalculatorOverride(calc) {
        calc.endRow += 10;
      }
    });
    wt.draw();
    var oldCount = count;
    wt.scrollViewportVertically(8);
    wt.draw(true);
    expect(count).not.toBeGreaterThan(oldCount);
  });
  it('should ignore fastDraw == true when grid was scrolled by amount of rows that exceeds endRow', function () {
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        count += 1;
        return wt.wtSettings.defaults.cellRenderer(row, column, TD);
      },
      viewportRowCalculatorOverride: function viewportRowCalculatorOverride(calc) {
        calc.endRow += 10;
      }
    });
    wt.draw();
    var oldCount = count;
    wt.scrollViewportVertically(10);
    wt.draw(true);
    expect(count).not.toBeGreaterThan(oldCount);
    wt.scrollViewportVertically(getTotalRows() - 1);
    wt.draw(true);
    expect(count).toBeGreaterThan(oldCount);
  });
  it('should not ignore fastDraw == true when grid was scrolled by amount of columns that doesn\'t exceed endColumn', function () {
    createDataArray(50, 50);
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        count += 1;
        return wt.wtSettings.defaults.cellRenderer(row, column, TD);
      },
      viewportColumnCalculatorOverride: function viewportColumnCalculatorOverride(calc) {
        calc.endColumn += 10;
      }
    });
    wt.draw();
    var oldCount = count;
    wt.scrollViewportHorizontally(8);
    wt.draw(true);
    expect(count).not.toBeGreaterThan(oldCount);
  });
  it('should ignore fastDraw == true when grid was scrolled by amount of columns that exceeds endColumn', function () {
    createDataArray(50, 50);
    var count = 0;
    var wt = new Walkontable.Core({
      table: $table[0],
      data: getData,
      totalRows: getTotalRows,
      totalColumns: getTotalColumns,
      cellRenderer: function cellRenderer(row, column, TD) {
        count += 1;
        return wt.wtSettings.defaults.cellRenderer(row, column, TD);
      },
      viewportColumnCalculatorOverride: function viewportColumnCalculatorOverride(calc) {
        calc.endColumn += 10;
      }
    });
    wt.draw();
    var oldCount = count;
    wt.scrollViewportHorizontally(10);
    wt.draw(true);
    expect(count).not.toBeGreaterThan(oldCount);
    wt.scrollViewportHorizontally(11);
    wt.draw(true);
    expect(count).toBeGreaterThan(oldCount);
  });
  describe('cell header border', function () {
    it('should be correct visible in fixedColumns and without row header', function () {
      createDataArray(50, 50);
      $wrapper.width(500).height(400);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns,
        columnWidth: 70,
        fixedColumnsLeft: 2,
        columnHeaders: [function () {}]
      });
      wt.draw();
      expect($('.ht_clone_top_left_corner thead tr th').eq(0).css('border-left-width')).toBe('1px');
      expect($('.ht_clone_top_left_corner thead tr th').eq(0).css('border-right-width')).toBe('1px');
      expect($('.ht_clone_top_left_corner thead tr th').eq(1).css('border-left-width')).toBe('0px');
      expect($('.ht_clone_top_left_corner thead tr th').eq(1).css('border-right-width')).toBe('1px');
    });
  });
  describe('isLastRowFullyVisible', function () {
    it('should be false because it is only partially visible', function () {
      createDataArray(8, 4);
      $wrapper.width(185).height(175);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.wtTable.isLastRowFullyVisible()).toEqual(false);
    });
    it('should be true because it is fully visible', function () {
      createDataArray(8, 4);
      $wrapper.width(185).height(185);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollViewportVertically(7);
      wt.draw();
      expect(wt.wtTable.isLastRowFullyVisible()).toEqual(true);
    });
  });
  xdescribe('isLastColumnFullyVisible', function () {
    it('should be false because it is only partially visible', function () {
      createDataArray(18, 4);
      $wrapper.width(209).height(185);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      expect(wt.wtTable.isLastColumnFullyVisible()).toEqual(false); // few pixels are obstacled by scrollbar
    });
    it('should be true because it is fully visible', function () {
      createDataArray(18, 4);
      $wrapper.width(180).height(185);
      var wt = new Walkontable.Core({
        table: $table[0],
        data: getData,
        totalRows: getTotalRows,
        totalColumns: getTotalColumns
      });
      wt.draw();
      wt.scrollHorizontal(1);
      expect(wt.wtTable.isLastColumnFullyVisible()).toEqual(true);
    });
  });
});

/***/ })
/******/ ]);
//# sourceMappingURL=specs.entry.js.map