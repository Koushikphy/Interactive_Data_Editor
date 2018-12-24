"use strict";

exports.__esModule = true;
exports.default = void 0;

var _base = _interopRequireDefault(require("./../_base"));

var _plugins = require("./../../plugins");

var _storage = _interopRequireDefault(require("./storage"));

var _pluginHooks = _interopRequireDefault(require("./../../pluginHooks"));

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

_pluginHooks.default.getSingleton().register('persistentStateSave');

_pluginHooks.default.getSingleton().register('persistentStateLoad');

_pluginHooks.default.getSingleton().register('persistentStateReset');
/**
 * @plugin PersistentState
 *
 * @description
 * Save the state of column sorting, column positions and column sizes in local storage to preserve table state
 * between page reloads.
 *
 * In order to enable data storage mechanism, {@link Options#persistentState} option must be set to `true`.
 *
 * When persistentState is enabled it exposes 3 hooks:
 * - {@link Hooks#persistentStateSave} - Saves value under given key in browser local storage.
 * - {@link Hooks#persistentStateLoad} - Loads value, saved under given key, from browser local storage. The loaded
 * value will be saved in `saveTo.value`.
 * - {@link Hooks#persistentStateReset} - Clears the value saved under key. If no key is given, all values associated
 * with table will be cleared.
 */


var PersistentState =
/*#__PURE__*/
function (_BasePlugin) {
  _inherits(PersistentState, _BasePlugin);

  function PersistentState(hotInstance) {
    var _this;

    _classCallCheck(this, PersistentState);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(PersistentState).call(this, hotInstance));
    /**
     * Instance of {@link Storage}.
     *
     * @private
     * @type {Storage}
     */

    _this.storage = void 0;
    return _this;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link PersistentState#enablePlugin} method is called.
   *
   * @returns {Boolean}
   */


  _createClass(PersistentState, [{
    key: "isEnabled",
    value: function isEnabled() {
      return !!this.hot.getSettings().persistentState;
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

      if (!this.storage) {
        this.storage = new _storage.default(this.hot.rootElement.id);
      }

      this.addHook('persistentStateSave', function (key, value) {
        return _this2.saveValue(key, value);
      });
      this.addHook('persistentStateLoad', function (key, saveTo) {
        return _this2.loadValue(key, saveTo);
      });
      this.addHook('persistentStateReset', function () {
        return _this2.resetValue();
      });

      _get(_getPrototypeOf(PersistentState.prototype), "enablePlugin", this).call(this);
    }
    /**
     * Disables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: "disablePlugin",
    value: function disablePlugin() {
      this.storage = void 0;

      _get(_getPrototypeOf(PersistentState.prototype), "disablePlugin", this).call(this);
    }
    /**
     * Updates the plugin state. This method is executed when {@link Core#updateSettings} is invoked.
     */

  }, {
    key: "updatePlugin",
    value: function updatePlugin() {
      this.disablePlugin();
      this.enablePlugin();

      _get(_getPrototypeOf(PersistentState.prototype), "updatePlugin", this).call(this);
    }
    /**
     * Loads the value from local storage.
     *
     * @param {String} key Storage key.
     * @param {Object} saveTo Saved value from local storage.
     */

  }, {
    key: "loadValue",
    value: function loadValue(key, saveTo) {
      saveTo.value = this.storage.loadValue(key);
    }
    /**
     * Saves the data to local storage.
     *
     * @param {String} key Storage key.
     * @param {Mixed} value Value to save.
     */

  }, {
    key: "saveValue",
    value: function saveValue(key, value) {
      this.storage.saveValue(key, value);
    }
    /**
     * Resets the data or all data from local storage.
     *
     * @param {String} key [optional] Storage key.
     */

  }, {
    key: "resetValue",
    value: function resetValue(key) {
      if (typeof key === 'undefined') {
        this.storage.resetAll();
      } else {
        this.storage.reset(key);
      }
    }
    /**
     * Destroys the plugin instance.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      _get(_getPrototypeOf(PersistentState.prototype), "destroy", this).call(this);
    }
  }]);

  return PersistentState;
}(_base.default);

(0, _plugins.registerPlugin)('persistentState', PersistentState);
var _default = PersistentState;
exports.default = _default;