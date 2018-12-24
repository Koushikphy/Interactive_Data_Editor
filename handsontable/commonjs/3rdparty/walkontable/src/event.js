"use strict";

exports.__esModule = true;
exports.default = void 0;

var _element = require("./../../../helpers/dom/element");

var _function = require("./../../../helpers/function");

var _feature = require("./../../../helpers/feature");

var _browser = require("./../../../helpers/browser");

var _eventManager = _interopRequireDefault(require("./../../../eventManager"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var privatePool = new WeakMap();
/**
 * @class Event
 */

var Event =
/*#__PURE__*/
function () {
  /**
   * @param {*} instance Walkontable instance.
   */
  function Event(instance) {
    _classCallCheck(this, Event);

    /**
     * Instance of {@link Walkontable}.
     *
     * @private
     * @type {Walkontable}
     */
    this.instance = instance;
    /**
     * Instance of {@link EventManager}.
     *
     * @private
     * @type {EventManager}
     */

    this.eventManager = new _eventManager.default(instance);
    privatePool.set(this, {
      selectedCellBeforeTouchEnd: void 0,
      dblClickTimeout: [null, null],
      dblClickOrigin: [null, null]
    });
    this.registerEvents();
  }
  /**
   * Adds listeners for mouse and touch events.
   *
   * @private
   */


  _createClass(Event, [{
    key: "registerEvents",
    value: function registerEvents() {
      var _this = this;

      this.eventManager.addEventListener(this.instance.wtTable.holder, 'contextmenu', function (event) {
        return _this.onContextMenu(event);
      });
      this.eventManager.addEventListener(this.instance.wtTable.TABLE, 'mouseover', function (event) {
        return _this.onMouseOver(event);
      });
      this.eventManager.addEventListener(this.instance.wtTable.TABLE, 'mouseout', function (event) {
        return _this.onMouseOut(event);
      });

      var initTouchEvents = function initTouchEvents() {
        _this.eventManager.addEventListener(_this.instance.wtTable.holder, 'touchstart', function (event) {
          return _this.onTouchStart(event);
        });

        _this.eventManager.addEventListener(_this.instance.wtTable.holder, 'touchend', function (event) {
          return _this.onTouchEnd(event);
        });

        if (!_this.instance.momentumScrolling) {
          _this.instance.momentumScrolling = {};
        }

        _this.eventManager.addEventListener(_this.instance.wtTable.holder, 'scroll', function () {
          clearTimeout(_this.instance.momentumScrolling._timeout);

          if (!_this.instance.momentumScrolling.ongoing) {
            _this.instance.getSetting('onBeforeTouchScroll');
          }

          _this.instance.momentumScrolling.ongoing = true;
          _this.instance.momentumScrolling._timeout = setTimeout(function () {
            if (!_this.instance.touchApplied) {
              _this.instance.momentumScrolling.ongoing = false;

              _this.instance.getSetting('onAfterMomentumScroll');
            }
          }, 200);
        });
      };

      var initMouseEvents = function initMouseEvents() {
        _this.eventManager.addEventListener(_this.instance.wtTable.holder, 'mouseup', function (event) {
          return _this.onMouseUp(event);
        });

        _this.eventManager.addEventListener(_this.instance.wtTable.holder, 'mousedown', function (event) {
          return _this.onMouseDown(event);
        });
      };

      if ((0, _browser.isMobileBrowser)()) {
        initTouchEvents();
      } else {
        // PC like devices which support both methods (touchscreen and ability to plug-in mouse).
        if ((0, _feature.isTouchSupported)()) {
          initTouchEvents();
        }

        initMouseEvents();
      }

      this.eventManager.addEventListener(window, 'resize', function () {
        if (_this.instance.getSetting('stretchH') !== 'none') {
          _this.instance.draw();
        }
      });
    }
    /**
     * Checks if an element is already selected.
     *
     * @private
     * @param {Element} touchTarget
     * @returns {Boolean}
     */

  }, {
    key: "selectedCellWasTouched",
    value: function selectedCellWasTouched(touchTarget) {
      var priv = privatePool.get(this);
      var cellUnderFinger = this.parentCell(touchTarget);
      var coordsOfCellUnderFinger = cellUnderFinger.coords;

      if (priv.selectedCellBeforeTouchEnd && coordsOfCellUnderFinger) {
        var _ref = [coordsOfCellUnderFinger.row, priv.selectedCellBeforeTouchEnd.from.row],
            rowTouched = _ref[0],
            rowSelected = _ref[1];
        var _ref2 = [coordsOfCellUnderFinger.col, priv.selectedCellBeforeTouchEnd.from.col],
            colTouched = _ref2[0],
            colSelected = _ref2[1];
        return rowTouched === rowSelected && colTouched === colSelected;
      }

      return false;
    }
    /**
     * Gets closest TD or TH element.
     *
     * @private
     * @param {Element} elem
     * @returns {Object} Contains coordinates and reference to TD or TH if it exists. Otherwise it's empty object.
     */

  }, {
    key: "parentCell",
    value: function parentCell(elem) {
      var cell = {};
      var TABLE = this.instance.wtTable.TABLE;
      var TD = (0, _element.closestDown)(elem, ['TD', 'TH'], TABLE);

      if (TD) {
        cell.coords = this.instance.wtTable.getCoords(TD);
        cell.TD = TD;
      } else if ((0, _element.hasClass)(elem, 'wtBorder') && (0, _element.hasClass)(elem, 'current')) {
        cell.coords = this.instance.selections.getCell().cellRange.highlight;
        cell.TD = this.instance.wtTable.getCell(cell.coords);
      } else if ((0, _element.hasClass)(elem, 'wtBorder') && (0, _element.hasClass)(elem, 'area')) {
        if (this.instance.selections.createOrGetArea().cellRange) {
          cell.coords = this.instance.selections.createOrGetArea().cellRange.to;
          cell.TD = this.instance.wtTable.getCell(cell.coords);
        }
      }

      return cell;
    }
    /**
     * onMouseDown callback.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onMouseDown",
    value: function onMouseDown(event) {
      var priv = privatePool.get(this);
      var activeElement = document.activeElement;
      var getParentNode = (0, _function.partial)(_element.getParent, event.realTarget);
      var realTarget = event.realTarget; // ignore focusable element from mouse down processing (https://github.com/handsontable/handsontable/issues/3555)

      if (realTarget === activeElement || getParentNode(0) === activeElement || getParentNode(1) === activeElement) {
        return;
      }

      var cell = this.parentCell(realTarget);

      if ((0, _element.hasClass)(realTarget, 'corner')) {
        this.instance.getSetting('onCellCornerMouseDown', event, realTarget);
      } else if (cell.TD && this.instance.hasSetting('onCellMouseDown')) {
        this.instance.getSetting('onCellMouseDown', event, cell.coords, cell.TD, this.instance);
      }

      if (event.button !== 2 && cell.TD) {
        // if not right mouse button
        priv.dblClickOrigin[0] = cell.TD;
        clearTimeout(priv.dblClickTimeout[0]);
        priv.dblClickTimeout[0] = setTimeout(function () {
          priv.dblClickOrigin[0] = null;
        }, 1000);
      }
    }
    /**
     * onContextMenu callback.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onContextMenu",
    value: function onContextMenu(event) {
      if (this.instance.hasSetting('onCellContextMenu')) {
        var cell = this.parentCell(event.realTarget);

        if (cell.TD) {
          this.instance.getSetting('onCellContextMenu', event, cell.coords, cell.TD, this.instance);
        }
      }
    }
    /**
     * onMouseOver callback.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onMouseOver",
    value: function onMouseOver(event) {
      if (!this.instance.hasSetting('onCellMouseOver')) {
        return;
      }

      var table = this.instance.wtTable.TABLE;
      var td = (0, _element.closestDown)(event.realTarget, ['TD', 'TH'], table);
      var mainWOT = this.instance.cloneSource || this.instance;

      if (td && td !== mainWOT.lastMouseOver && (0, _element.isChildOf)(td, table)) {
        mainWOT.lastMouseOver = td;
        this.instance.getSetting('onCellMouseOver', event, this.instance.wtTable.getCoords(td), td, this.instance);
      }
    }
    /**
     * onMouseOut callback.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onMouseOut",
    value: function onMouseOut(event) {
      if (!this.instance.hasSetting('onCellMouseOut')) {
        return;
      }

      var table = this.instance.wtTable.TABLE;
      var lastTD = (0, _element.closestDown)(event.realTarget, ['TD', 'TH'], table);
      var nextTD = (0, _element.closestDown)(event.relatedTarget, ['TD', 'TH'], table);

      if (lastTD && lastTD !== nextTD && (0, _element.isChildOf)(lastTD, table)) {
        this.instance.getSetting('onCellMouseOut', event, this.instance.wtTable.getCoords(lastTD), lastTD, this.instance);
      }
    }
    /**
     * onMouseUp callback.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onMouseUp",
    value: function onMouseUp(event) {
      if (event.button === 2) {
        return;
      } // if not right mouse button


      var priv = privatePool.get(this);
      var cell = this.parentCell(event.realTarget);

      if (cell.TD && this.instance.hasSetting('onCellMouseUp')) {
        this.instance.getSetting('onCellMouseUp', event, cell.coords, cell.TD, this.instance);
      }

      if (cell.TD === priv.dblClickOrigin[0] && cell.TD === priv.dblClickOrigin[1]) {
        if ((0, _element.hasClass)(event.realTarget, 'corner')) {
          this.instance.getSetting('onCellCornerDblClick', event, cell.coords, cell.TD, this.instance);
        } else {
          this.instance.getSetting('onCellDblClick', event, cell.coords, cell.TD, this.instance);
        }

        priv.dblClickOrigin[0] = null;
        priv.dblClickOrigin[1] = null;
      } else if (cell.TD === priv.dblClickOrigin[0]) {
        priv.dblClickOrigin[1] = cell.TD;
        clearTimeout(priv.dblClickTimeout[1]);
        priv.dblClickTimeout[1] = setTimeout(function () {
          priv.dblClickOrigin[1] = null;
        }, 500);
      }
    }
    /**
     * onTouchStart callback. Simulates mousedown event.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onTouchStart",
    value: function onTouchStart(event) {
      var priv = privatePool.get(this);
      priv.selectedCellBeforeTouchEnd = this.instance.selections.getCell().cellRange;
      this.instance.touchApplied = true;
      this.onMouseDown(event);
    }
    /**
     * onTouchEnd callback. Simulates mouseup event.
     *
     * @private
     * @param {MouseEvent} event
     */

  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(event) {
      var excludeTags = ['A', 'BUTTON', 'INPUT'];
      var target = event.target;
      this.instance.touchApplied = false; // When the standard event was performed on the link element (a cell which contains HTML `a` element) then here
      // we check if it should be canceled. Click is blocked in a situation when the element is rendered outside
      // selected cells. This prevents accidentally page reloads while selecting adjacent cells.

      if (this.selectedCellWasTouched(target) === false && excludeTags.includes(target.tagName)) {
        event.preventDefault();
      }

      this.onMouseUp(event);
    }
    /**
     * Clears double-click timeouts and destroys the internal eventManager instance.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      var priv = privatePool.get(this);
      clearTimeout(priv.dblClickTimeout[0]);
      clearTimeout(priv.dblClickTimeout[1]);
      this.eventManager.destroy();
    }
  }]);

  return Event;
}();

var _default = Event;
exports.default = _default;