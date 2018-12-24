"use strict";

exports.__esModule = true;
exports.default = void 0;

var _jsonPatchDuplex = _interopRequireDefault(require("./../../../lib/jsonpatch/json-patch-duplex"));

var _localHooks = _interopRequireDefault(require("../../mixins/localHooks"));

var _object = require("../../helpers/object");

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @class DataObserver
 * @plugin ObserveChanges
 */
var DataObserver =
/*#__PURE__*/
function () {
  function DataObserver(observedData) {
    _classCallCheck(this, DataObserver);

    /**
     * Observed source data.
     *
     * @type {Array}
     */
    this.observedData = null;
    /**
     * JsonPatch observer.
     *
     * @type {Object}
     */

    this.observer = null;
    /**
     * Flag which determines if observer is paused or not. Paused observer doesn't emit `change` hooks.
     *
     * @type {Boolean}
     * @default false
     */

    this.paused = false;
    this.setObservedData(observedData);
  }
  /**
   * Set data to observe.
   *
   * @param {*} observedData
   */


  _createClass(DataObserver, [{
    key: "setObservedData",
    value: function setObservedData(observedData) {
      var _this = this;

      if (this.observer) {
        _jsonPatchDuplex.default.unobserve(this.observedData, this.observer);
      }

      this.observedData = observedData;
      this.observer = _jsonPatchDuplex.default.observe(this.observedData, function (patches) {
        return _this.onChange(patches);
      });
    }
    /**
     * Check if observer was paused.
     *
     * @returns {Boolean}
     */

  }, {
    key: "isPaused",
    value: function isPaused() {
      return this.paused;
    }
    /**
     * Pause observer (stop emitting all detected changes).
     */

  }, {
    key: "pause",
    value: function pause() {
      this.paused = true;
    }
    /**
     * Resume observer (emit all detected changes).
     */

  }, {
    key: "resume",
    value: function resume() {
      this.paused = false;
    }
    /**
     * JsonPatch on change listener.
     *
     * @private
     * @param {Array} patches An array of object passed from jsonpatch.
     */

  }, {
    key: "onChange",
    value: function onChange(patches) {
      this.runLocalHooks('change', (0, _utils.cleanPatches)(patches));
    }
    /**
     * Destroy observer instance.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      _jsonPatchDuplex.default.unobserve(this.observedData, this.observer);

      this.observedData = null;
      this.observer = null;
    }
  }]);

  return DataObserver;
}();

(0, _object.mixin)(DataObserver, _localHooks.default);
var _default = DataObserver;
exports.default = _default;