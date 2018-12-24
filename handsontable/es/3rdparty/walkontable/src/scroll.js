function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import { innerHeight, innerWidth, getScrollLeft, getScrollTop, offset } from './../../../helpers/dom/element';
import { rangeEach, rangeEachReverse } from './../../../helpers/number';
/**
 * @class Scroll
 */

var Scroll =
/*#__PURE__*/
function () {
  /**
   * @param {Walkontable} wotInstance
   */
  function Scroll(wotInstance) {
    _classCallCheck(this, Scroll);

    this.wot = wotInstance; // legacy support

    this.instance = wotInstance;
  }
  /**
   * Scrolls viewport to a cell.
   *
   * @param {CellCoords} coords
   * @param {Boolean} [snapToTop]
   * @param {Boolean} [snapToRight]
   * @param {Boolean} [snapToBottom]
   * @param {Boolean} [snapToLeft]
   * @returns {Boolean}
   */


  _createClass(Scroll, [{
    key: "scrollViewport",
    value: function scrollViewport(coords, snapToTop, snapToRight, snapToBottom, snapToLeft) {
      var scrolledHorizontally = this.scrollViewportHorizontally(coords.col, snapToRight, snapToLeft);
      var scrolledVertically = this.scrollViewportVertically(coords.row, snapToTop, snapToBottom);
      return scrolledHorizontally || scrolledVertically;
    }
    /**
     * Scrolls viewport to a column.
     *
     * @param {Number} column Visual column index.
     * @param {Boolean} [snapToRight]
     * @param {Boolean} [snapToLeft]
     * @returns {Boolean}
     */

  }, {
    key: "scrollViewportHorizontally",
    value: function scrollViewportHorizontally(column, snapToRight, snapToLeft) {
      if (!this.wot.drawn) {
        return false;
      }

      var _this$_getVariables = this._getVariables(),
          fixedColumnsLeft = _this$_getVariables.fixedColumnsLeft,
          leftOverlay = _this$_getVariables.leftOverlay,
          totalColumns = _this$_getVariables.totalColumns;

      var result = false;

      if (column >= 0 && column <= Math.max(totalColumns - 1, 0)) {
        if (column >= fixedColumnsLeft && (column < this.getFirstVisibleColumn() || snapToLeft)) {
          result = leftOverlay.scrollTo(column);
        } else if (column > this.getLastVisibleColumn() || snapToRight) {
          result = leftOverlay.scrollTo(column, true);
        }
      }

      return result;
    }
    /**
     * Scrolls viewport to a row.
     *
     * @param {Number} row Visual row index.
     * @param {Boolean} [snapToTop]
     * @param {Boolean} [snapToBottom]
     * @returns {Boolean}
     */

  }, {
    key: "scrollViewportVertically",
    value: function scrollViewportVertically(row, snapToTop, snapToBottom) {
      if (!this.wot.drawn) {
        return false;
      }

      var _this$_getVariables2 = this._getVariables(),
          fixedRowsBottom = _this$_getVariables2.fixedRowsBottom,
          fixedRowsTop = _this$_getVariables2.fixedRowsTop,
          topOverlay = _this$_getVariables2.topOverlay,
          totalRows = _this$_getVariables2.totalRows;

      var result = false;

      if (row >= 0 && row <= Math.max(totalRows - 1, 0)) {
        if (row >= fixedRowsTop && (row < this.getFirstVisibleRow() || snapToTop)) {
          result = topOverlay.scrollTo(row);
        } else if (row > this.getLastVisibleRow() && row < totalRows - fixedRowsBottom || snapToBottom) {
          result = topOverlay.scrollTo(row, true);
        }
      }

      return result;
    }
    /**
     * Get first visible row based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: "getFirstVisibleRow",
    value: function getFirstVisibleRow() {
      var _this$_getVariables3 = this._getVariables(),
          topOverlay = _this$_getVariables3.topOverlay,
          wtTable = _this$_getVariables3.wtTable,
          wtViewport = _this$_getVariables3.wtViewport,
          totalRows = _this$_getVariables3.totalRows,
          fixedRowsTop = _this$_getVariables3.fixedRowsTop;

      var firstVisibleRow = wtTable.getFirstVisibleRow();

      if (topOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var totalTableHeight = innerHeight(wtTable.hider);
        var windowHeight = innerHeight(window);
        var windowScrollTop = getScrollTop(window); // Only calculate firstVisibleRow when table didn't filled (from up) whole viewport space

        if (rootElementOffset.top + totalTableHeight - windowHeight <= windowScrollTop) {
          var rowsHeight = wtViewport.getColumnHeaderHeight();
          rowsHeight += topOverlay.sumCellSizes(0, fixedRowsTop);
          rangeEachReverse(totalRows, 1, function (row) {
            rowsHeight += topOverlay.sumCellSizes(row - 1, row);

            if (rootElementOffset.top + totalTableHeight - rowsHeight <= windowScrollTop) {
              // Return physical row + 1
              firstVisibleRow = row;
              return false;
            }
          });
        }
      }

      return firstVisibleRow;
    }
    /**
     * Get last visible row based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: "getLastVisibleRow",
    value: function getLastVisibleRow() {
      var _this$_getVariables4 = this._getVariables(),
          topOverlay = _this$_getVariables4.topOverlay,
          wtTable = _this$_getVariables4.wtTable,
          wtViewport = _this$_getVariables4.wtViewport,
          totalRows = _this$_getVariables4.totalRows;

      var lastVisibleRow = wtTable.getLastVisibleRow();

      if (topOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var windowHeight = innerHeight(window);
        var windowScrollTop = getScrollTop(window); // Only calculate lastVisibleRow when table didn't filled (from bottom) whole viewport space

        if (rootElementOffset.top > windowScrollTop) {
          var rowsHeight = wtViewport.getColumnHeaderHeight();
          rangeEach(1, totalRows, function (row) {
            rowsHeight += topOverlay.sumCellSizes(row - 1, row);

            if (rootElementOffset.top + rowsHeight - windowScrollTop >= windowHeight) {
              // Return physical row - 1 (-2 because rangeEach gives row index + 1 - sumCellSizes requirements)
              lastVisibleRow = row - 2;
              return false;
            }
          });
        }
      }

      return lastVisibleRow;
    }
    /**
     * Get first visible column based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: "getFirstVisibleColumn",
    value: function getFirstVisibleColumn() {
      var _this$_getVariables5 = this._getVariables(),
          leftOverlay = _this$_getVariables5.leftOverlay,
          wtTable = _this$_getVariables5.wtTable,
          wtViewport = _this$_getVariables5.wtViewport,
          totalColumns = _this$_getVariables5.totalColumns;

      var firstVisibleColumn = wtTable.getFirstVisibleColumn();

      if (leftOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var totalTableWidth = innerWidth(wtTable.hider);
        var windowWidth = innerWidth(window);
        var windowScrollLeft = getScrollLeft(window); // Only calculate firstVisibleColumn when table didn't filled (from left) whole viewport space

        if (rootElementOffset.left + totalTableWidth - windowWidth <= windowScrollLeft) {
          var columnsWidth = wtViewport.getRowHeaderWidth();
          rangeEachReverse(totalColumns, 1, function (column) {
            columnsWidth += leftOverlay.sumCellSizes(column - 1, column);

            if (rootElementOffset.left + totalTableWidth - columnsWidth <= windowScrollLeft) {
              // Return physical column + 1
              firstVisibleColumn = column;
              return false;
            }
          });
        }
      }

      return firstVisibleColumn;
    }
    /**
     * Get last visible column based on virtual dom and how table is visible in browser window viewport.
     *
     * @returns {Number}
     */

  }, {
    key: "getLastVisibleColumn",
    value: function getLastVisibleColumn() {
      var _this$_getVariables6 = this._getVariables(),
          leftOverlay = _this$_getVariables6.leftOverlay,
          wtTable = _this$_getVariables6.wtTable,
          wtViewport = _this$_getVariables6.wtViewport,
          totalColumns = _this$_getVariables6.totalColumns;

      var lastVisibleColumn = wtTable.getLastVisibleColumn();

      if (leftOverlay.mainTableScrollableElement === window) {
        var rootElementOffset = offset(wtTable.wtRootElement);
        var windowWidth = innerWidth(window);
        var windowScrollLeft = getScrollLeft(window); // Only calculate lastVisibleColumn when table didn't filled (from right) whole viewport space

        if (rootElementOffset.left > windowScrollLeft) {
          var columnsWidth = wtViewport.getRowHeaderWidth();
          rangeEach(1, totalColumns, function (column) {
            columnsWidth += leftOverlay.sumCellSizes(column - 1, column);

            if (rootElementOffset.left + columnsWidth - windowScrollLeft >= windowWidth) {
              // Return physical column - 1 (-2 because rangeEach gives column index + 1 - sumCellSizes requirements)
              lastVisibleColumn = column - 2;
              return false;
            }
          });
        }
      }

      return lastVisibleColumn;
    }
    /**
     * Returns collection of variables used to rows and columns visibility calculations.
     *
     * @returns {Object}
     * @private
     */

  }, {
    key: "_getVariables",
    value: function _getVariables() {
      var wot = this.wot;
      var topOverlay = wot.wtOverlays.topOverlay;
      var leftOverlay = wot.wtOverlays.leftOverlay;
      var wtTable = wot.wtTable;
      var wtViewport = wot.wtViewport;
      var totalRows = wot.getSetting('totalRows');
      var totalColumns = wot.getSetting('totalColumns');
      var fixedRowsTop = wot.getSetting('fixedRowsTop');
      var fixedRowsBottom = wot.getSetting('fixedRowsBottom');
      var fixedColumnsLeft = wot.getSetting('fixedColumnsLeft');
      return {
        topOverlay: topOverlay,
        leftOverlay: leftOverlay,
        wtTable: wtTable,
        wtViewport: wtViewport,
        totalRows: totalRows,
        totalColumns: totalColumns,
        fixedRowsTop: fixedRowsTop,
        fixedRowsBottom: fixedRowsBottom,
        fixedColumnsLeft: fixedColumnsLeft
      };
    }
  }]);

  return Scroll;
}();

export default Scroll;