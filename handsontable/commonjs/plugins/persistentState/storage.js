"use strict";

exports.__esModule = true;
exports.default = void 0;

var _array = require("./../../helpers/array");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * @class Storage
 * @plugin PersistentState
 */
var Storage =
/*#__PURE__*/
function () {
  function Storage(prefix) {
    _classCallCheck(this, Storage);

    /**
     * Prefix for key (id element).
     *
     * @type {String}
     */
    this.prefix = prefix;
    /**
     * Saved keys.
     *
     * @type {Array}
     */

    this.savedKeys = [];
    this.loadSavedKeys();
  }
  /**
   * Save data to localStorage.
   *
   * @param {String} key Key string.
   * @param {Mixed} value Value to save.
   */


  _createClass(Storage, [{
    key: "saveValue",
    value: function saveValue(key, value) {
      window.localStorage.setItem("".concat(this.prefix, "_").concat(key), JSON.stringify(value));

      if (this.savedKeys.indexOf(key) === -1) {
        this.savedKeys.push(key);
        this.saveSavedKeys();
      }
    }
    /**
     * Load data from localStorage.
     *
     * @param {String} key Key string.
     * @param {Object} defaultValue Object containing the loaded data.
     *
     * @returns {}
     */

  }, {
    key: "loadValue",
    value: function loadValue(key, defaultValue) {
      var itemKey = typeof key === 'undefined' ? defaultValue : key;
      var value = window.localStorage.getItem("".concat(this.prefix, "_").concat(itemKey));
      return value === null ? void 0 : JSON.parse(value);
    }
    /**
     * Reset given data from localStorage.
     *
     * @param {String} key Key string.
     */

  }, {
    key: "reset",
    value: function reset(key) {
      window.localStorage.removeItem("".concat(this.prefix, "_").concat(key));
    }
    /**
     * Reset all data from localStorage.
     *
     */

  }, {
    key: "resetAll",
    value: function resetAll() {
      var _this = this;

      (0, _array.arrayEach)(this.savedKeys, function (value, index) {
        window.localStorage.removeItem("".concat(_this.prefix, "_").concat(_this.savedKeys[index]));
      });
      this.clearSavedKeys();
    }
    /**
     * Load and save all keys from localStorage.
     *
     * @private
     */

  }, {
    key: "loadSavedKeys",
    value: function loadSavedKeys() {
      var keysJSON = window.localStorage.getItem("".concat(this.prefix, "__persistentStateKeys"));
      var keys = typeof keysJSON === 'string' ? JSON.parse(keysJSON) : void 0;
      this.savedKeys = keys || [];
    }
    /**
     * Save saved key in localStorage.
     *
     * @private
     */

  }, {
    key: "saveSavedKeys",
    value: function saveSavedKeys() {
      window.localStorage.setItem("".concat(this.prefix, "__persistentStateKeys"), JSON.stringify(this.savedKeys));
    }
    /**
     * Clear saved key from localStorage.
     *
     * @private
     */

  }, {
    key: "clearSavedKeys",
    value: function clearSavedKeys() {
      this.savedKeys.length = 0;
      this.saveSavedKeys();
    }
  }]);

  return Storage;
}();

var _default = Storage;
exports.default = _default;