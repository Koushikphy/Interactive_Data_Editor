"use strict";

exports.__esModule = true;
exports.default = void 0;

var _element = require("./../../helpers/dom/element");

var _array = require("./../../helpers/array");

var _base = _interopRequireDefault(require("./../_base"));

var _plugins = require("./../../plugins");

var _feature = require("./../../helpers/feature");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

/**
 * @private
 * @plugin TouchScroll
 * @class TouchScroll
 */
var TouchScroll =
/*#__PURE__*/
function (_BasePlugin) {
  _inherits(TouchScroll, _BasePlugin);

  function TouchScroll(hotInstance) {
    var _this;

    _classCallCheck(this, TouchScroll);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TouchScroll).call(this, hotInstance));
    /**
     * Collection of scrollbars to update.
     *
     * @type {Array}
     */

    _this.scrollbars = [];
    /**
     * Collection of overlays to update.
     *
     * @type {Array}
     */

    _this.clones = [];
    /**
     * Flag which determines if collection of overlays should be refilled on every table render.
     *
     * @type {Boolean}
     * @default false
     */

    _this.lockedCollection = false;
    /**
     * Flag which determines if walkontable should freeze overlays while scrolling.
     *
     * @type {Boolean}
     * @default false
     */

    _this.freezeOverlays = false;
    return _this;
  }
  /**
   * Check if plugin is enabled.
   *
   * @returns {Boolean}
   */


  _createClass(TouchScroll, [{
    key: "isEnabled",
    value: function isEnabled() {
      return (0, _feature.isTouchSupported)();
    }
    /**
     * Enable the plugin.
     */

  }, {
    key: "enablePlugin",
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }

      this.addHook('afterRender', function () {
        return _this2.onAfterRender();
      });
      this.registerEvents();

      _get(_getPrototypeOf(TouchScroll.prototype), "enablePlugin", this).call(this);
    }
    /**
     * Updates the plugin to use the latest options you have specified.
     */

  }, {
    key: "updatePlugin",
    value: function updatePlugin() {
      this.lockedCollection = false;

      _get(_getPrototypeOf(TouchScroll.prototype), "updatePlugin", this).call(this);
    }
    /**
     * Disable plugin for this Handsontable instance.
     */

  }, {
    key: "disablePlugin",
    value: function disablePlugin() {
      _get(_getPrototypeOf(TouchScroll.prototype), "disablePlugin", this).call(this);
    }
    /**
     * Register all necessary events.
     *
     * @private
     */

  }, {
    key: "registerEvents",
    value: function registerEvents() {
      var _this3 = this;

      this.addHook('beforeTouchScroll', function () {
        return _this3.onBeforeTouchScroll();
      });
      this.addHook('afterMomentumScroll', function () {
        return _this3.onAfterMomentumScroll();
      });
    }
    /**
     * After render listener.
     *
     * @private
     */

  }, {
    key: "onAfterRender",
    value: function onAfterRender() {
      if (this.lockedCollection) {
        return;
      }

      var _this$hot$view$wt$wtO = this.hot.view.wt.wtOverlays,
          topOverlay = _this$hot$view$wt$wtO.topOverlay,
          bottomOverlay = _this$hot$view$wt$wtO.bottomOverlay,
          leftOverlay = _this$hot$view$wt$wtO.leftOverlay,
          topLeftCornerOverlay = _this$hot$view$wt$wtO.topLeftCornerOverlay,
          bottomLeftCornerOverlay = _this$hot$view$wt$wtO.bottomLeftCornerOverlay;
      this.lockedCollection = true;
      this.scrollbars.length = 0;
      this.scrollbars.push(topOverlay);

      if (bottomOverlay.clone) {
        this.scrollbars.push(bottomOverlay);
      }

      this.scrollbars.push(leftOverlay);

      if (topLeftCornerOverlay) {
        this.scrollbars.push(topLeftCornerOverlay);
      }

      if (bottomLeftCornerOverlay && bottomLeftCornerOverlay.clone) {
        this.scrollbars.push(bottomLeftCornerOverlay);
      }

      this.clones.length = 0;

      if (topOverlay.needFullRender) {
        this.clones.push(topOverlay.clone.wtTable.holder.parentNode);
      }

      if (bottomOverlay.needFullRender) {
        this.clones.push(bottomOverlay.clone.wtTable.holder.parentNode);
      }

      if (leftOverlay.needFullRender) {
        this.clones.push(leftOverlay.clone.wtTable.holder.parentNode);
      }

      if (topLeftCornerOverlay) {
        this.clones.push(topLeftCornerOverlay.clone.wtTable.holder.parentNode);
      }

      if (bottomLeftCornerOverlay && bottomLeftCornerOverlay.clone) {
        this.clones.push(bottomLeftCornerOverlay.clone.wtTable.holder.parentNode);
      }
    }
    /**
     * Touch scroll listener.
     *
     * @private
     */

  }, {
    key: "onBeforeTouchScroll",
    value: function onBeforeTouchScroll() {
      this.freezeOverlays = true;
      (0, _array.arrayEach)(this.clones, function (clone) {
        (0, _element.addClass)(clone, 'hide-tween');
      });
    }
    /**
     * After momentum scroll listener.
     *
     * @private
     */

  }, {
    key: "onAfterMomentumScroll",
    value: function onAfterMomentumScroll() {
      var _this4 = this;

      this.freezeOverlays = false;
      (0, _array.arrayEach)(this.clones, function (clone) {
        (0, _element.removeClass)(clone, 'hide-tween');
        (0, _element.addClass)(clone, 'show-tween');
      });
      setTimeout(function () {
        (0, _array.arrayEach)(_this4.clones, function (clone) {
          (0, _element.removeClass)(clone, 'show-tween');
        });
      }, 400);
      (0, _array.arrayEach)(this.scrollbars, function (scrollbar) {
        scrollbar.refresh();
        scrollbar.resetFixedPosition();
      });
      this.hot.view.wt.wtOverlays.syncScrollWithMaster();
    }
  }]);

  return TouchScroll;
}(_base.default);

(0, _plugins.registerPlugin)('touchScroll', TouchScroll);
var _default = TouchScroll;
exports.default = _default;