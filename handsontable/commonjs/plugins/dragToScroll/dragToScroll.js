"use strict";

exports.__esModule = true;
exports.default = void 0;

var _base = _interopRequireDefault(require("./../_base"));

var _eventManager = _interopRequireDefault(require("./../../eventManager"));

var _plugins = require("./../../plugins");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

/**
 * @description
 * Plugin used to scroll Handsontable by selecting a cell and dragging outside of the visible viewport.
 *
 *
 * @class DragToScroll
 * @plugin DragToScroll
 */
var DragToScroll =
/*#__PURE__*/
function (_BasePlugin) {
  _inherits(DragToScroll, _BasePlugin);

  function DragToScroll(hotInstance) {
    var _this;

    _classCallCheck(this, DragToScroll);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DragToScroll).call(this, hotInstance));
    /**
     * Instance of {@link EventManager}.
     *
     * @private
     * @type {EventManager}
     */

    _this.eventManager = new _eventManager.default(_assertThisInitialized(_assertThisInitialized(_this)));
    /**
     * Size of an element and its position relative to the viewport,
     * e.g. {bottom: 449, height: 441, left: 8, right: 814, top: 8, width: 806, x: 8, y:8}.
     *
     * @type {DOMRect}
     */

    _this.boundaries = null;
    /**
     * Callback function.
     *
     * @private
     * @type {Function}
     */

    _this.callback = null;
    /**
     * Flag indicates mouseDown/mouseUp.
     *
     * @private
     * @type {Boolean}
     */

    _this.listening = false;
    return _this;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link DragToScroll#enablePlugin} method is called.
   *
   * @returns {Boolean}
   */


  _createClass(DragToScroll, [{
    key: "isEnabled",
    value: function isEnabled() {
      return !!this.hot.getSettings().dragToScroll;
    }
    /**
     * Enables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: "enablePlugin",
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }

      this.addHook('afterOnCellMouseDown', function () {
        return _this2.setupListening();
      });
      this.addHook('afterOnCellCornerMouseDown', function () {
        return _this2.setupListening();
      });
      this.registerEvents();

      _get(_getPrototypeOf(DragToScroll.prototype), "enablePlugin", this).call(this);
    }
    /**
     * Updates the plugin state. This method is executed when {@link Core#updateSettings} is invoked.
     */

  }, {
    key: "updatePlugin",
    value: function updatePlugin() {
      this.disablePlugin();
      this.enablePlugin();

      _get(_getPrototypeOf(DragToScroll.prototype), "updatePlugin", this).call(this);
    }
    /**
     * Disables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: "disablePlugin",
    value: function disablePlugin() {
      this.unregisterEvents();

      _get(_getPrototypeOf(DragToScroll.prototype), "disablePlugin", this).call(this);
    }
    /**
     * Sets the value of the visible element.
     *
     * @param boundaries {DOMRect} An object with coordinates compatible with DOMRect.
     */

  }, {
    key: "setBoundaries",
    value: function setBoundaries(boundaries) {
      this.boundaries = boundaries;
    }
    /**
     * Changes callback function.
     *
     * @param callback {Function}
     */

  }, {
    key: "setCallback",
    value: function setCallback(callback) {
      this.callback = callback;
    }
    /**
     * Checks if the mouse position (X, Y) is outside of the viewport and fires a callback with calculated X an Y diffs
     * between passed boundaries.
     *
     * @param {Number} x Mouse X coordinate to check.
     * @param {Number} y Mouse Y coordinate to check.
     */

  }, {
    key: "check",
    value: function check(x, y) {
      var diffX = 0;
      var diffY = 0;

      if (y < this.boundaries.top) {
        // y is less than top
        diffY = y - this.boundaries.top;
      } else if (y > this.boundaries.bottom) {
        // y is more than bottom
        diffY = y - this.boundaries.bottom;
      }

      if (x < this.boundaries.left) {
        // x is less than left
        diffX = x - this.boundaries.left;
      } else if (x > this.boundaries.right) {
        // x is more than right
        diffX = x - this.boundaries.right;
      }

      this.callback(diffX, diffY);
    }
    /**
     * Registers dom listeners.
     *
     * @private
     */

  }, {
    key: "registerEvents",
    value: function registerEvents() {
      var _this3 = this;

      this.eventManager.addEventListener(document, 'mouseup', function () {
        return _this3.onMouseUp();
      });
      this.eventManager.addEventListener(document, 'mousemove', function (event) {
        return _this3.onMouseMove(event);
      });
    }
    /**
     * Unbinds the events used by the plugin.
     *
     * @private
     */

  }, {
    key: "unregisterEvents",
    value: function unregisterEvents() {
      this.eventManager.clear();
    }
    /**
     * On after on cell/cellCorner mouse down listener.
     *
     * @private
     */

  }, {
    key: "setupListening",
    value: function setupListening() {
      var scrollHandler = this.hot.view.wt.wtTable.holder; // native scroll

      if (scrollHandler === window) {
        // not much we can do currently
        return;
      }

      this.setBoundaries(scrollHandler.getBoundingClientRect());
      this.setCallback(function (scrollX, scrollY) {
        if (scrollX < 0) {
          scrollHandler.scrollLeft -= 50;
        } else if (scrollX > 0) {
          scrollHandler.scrollLeft += 50;
        }

        if (scrollY < 0) {
          scrollHandler.scrollTop -= 20;
        } else if (scrollY > 0) {
          scrollHandler.scrollTop += 20;
        }
      });
      this.listening = true;
    }
    /**
     * 'mouseMove' event callback.
     *
     * @private
     * @param {MouseEvent} event `mousemove` event properties.
     */

  }, {
    key: "onMouseMove",
    value: function onMouseMove(event) {
      if (this.listening) {
        this.check(event.clientX, event.clientY);
      }
    }
    /**
     * `onMouseUp` hook callback.
     *
     * @private
     */

  }, {
    key: "onMouseUp",
    value: function onMouseUp() {
      this.listening = false;
    }
    /**
     * Destroys the plugin instance.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      _get(_getPrototypeOf(DragToScroll.prototype), "destroy", this).call(this);
    }
  }]);

  return DragToScroll;
}(_base.default);

(0, _plugins.registerPlugin)('dragToScroll', DragToScroll);
var _default = DragToScroll;
exports.default = _default;