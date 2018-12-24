"use strict";

exports.__esModule = true;
exports.default = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _pikaday = _interopRequireDefault(require("pikaday"));

var _element = require("./../helpers/dom/element");

var _object = require("./../helpers/object");

var _eventManager = _interopRequireDefault(require("./../eventManager"));

var _unicode = require("./../helpers/unicode");

var _event = require("./../helpers/dom/event");

var _textEditor = _interopRequireDefault(require("./textEditor"));

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
 * @editor DateEditor
 * @class DateEditor
 * @dependencies TextEditor
 */
var DateEditor =
/*#__PURE__*/
function (_TextEditor) {
  _inherits(DateEditor, _TextEditor);

  /**
   * @param {Core} hotInstance Handsontable instance
   * @private
   */
  function DateEditor(hotInstance) {
    var _this;

    _classCallCheck(this, DateEditor);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DateEditor).call(this, hotInstance)); // TODO: Move this option to general settings

    _this.defaultDateFormat = 'DD/MM/YYYY';
    _this.isCellEdited = false;
    _this.parentDestroyed = false;
    return _this;
  }

  _createClass(DateEditor, [{
    key: "init",
    value: function init() {
      var _this2 = this;

      if (typeof _moment.default !== 'function') {
        throw new Error('You need to include moment.js to your project.');
      }

      if (typeof _pikaday.default !== 'function') {
        throw new Error('You need to include Pikaday to your project.');
      }

      _get(_getPrototypeOf(DateEditor.prototype), "init", this).call(this);

      this.instance.addHook('afterDestroy', function () {
        _this2.parentDestroyed = true;

        _this2.destroyElements();
      });
    }
    /**
     * Create data picker instance
     */

  }, {
    key: "createElements",
    value: function createElements() {
      _get(_getPrototypeOf(DateEditor.prototype), "createElements", this).call(this);

      this.datePicker = document.createElement('DIV');
      this.datePickerStyle = this.datePicker.style;
      this.datePickerStyle.position = 'absolute';
      this.datePickerStyle.top = 0;
      this.datePickerStyle.left = 0;
      this.datePickerStyle.zIndex = 9999;
      (0, _element.addClass)(this.datePicker, 'htDatepickerHolder');
      document.body.appendChild(this.datePicker);
      this.$datePicker = new _pikaday.default(this.getDatePickerConfig());
      var eventManager = new _eventManager.default(this);
      /**
       * Prevent recognizing clicking on datepicker as clicking outside of table
       */

      eventManager.addEventListener(this.datePicker, 'mousedown', function (event) {
        return (0, _event.stopPropagation)(event);
      });
      this.hideDatepicker();
    }
    /**
     * Destroy data picker instance
     */

  }, {
    key: "destroyElements",
    value: function destroyElements() {
      this.$datePicker.destroy();
    }
    /**
     * Prepare editor to appear
     *
     * @param {Number} row Row index
     * @param {Number} col Column index
     * @param {String} prop Property name (passed when datasource is an array of objects)
     * @param {HTMLTableCellElement} td Table cell element
     * @param {*} originalValue Original value
     * @param {Object} cellProperties Object with cell properties ({@see Core#getCellMeta})
     */

  }, {
    key: "prepare",
    value: function prepare(row, col, prop, td, originalValue, cellProperties) {
      _get(_getPrototypeOf(DateEditor.prototype), "prepare", this).call(this, row, col, prop, td, originalValue, cellProperties);
    }
    /**
     * Open editor
     *
     * @param {Event} [event=null]
     */

  }, {
    key: "open",
    value: function open() {
      var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

      _get(_getPrototypeOf(DateEditor.prototype), "open", this).call(this);

      this.showDatepicker(event);
    }
    /**
     * Close editor
     */

  }, {
    key: "close",
    value: function close() {
      var _this3 = this;

      this._opened = false;

      this.instance._registerTimeout(function () {
        _this3.instance._refreshBorders();
      });

      _get(_getPrototypeOf(DateEditor.prototype), "close", this).call(this);
    }
    /**
     * @param {Boolean} [isCancelled=false]
     * @param {Boolean} [ctrlDown=false]
     */

  }, {
    key: "finishEditing",
    value: function finishEditing() {
      var isCancelled = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;
      var ctrlDown = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

      if (isCancelled) {
        // pressed ESC, restore original value
        // var value = this.instance.getDataAtCell(this.row, this.col);
        var value = this.originalValue;

        if (value !== void 0) {
          this.setValue(value);
        }
      }

      this.hideDatepicker();

      _get(_getPrototypeOf(DateEditor.prototype), "finishEditing", this).call(this, isCancelled, ctrlDown);
    }
    /**
     * Show data picker
     *
     * @param {Event} event
     */

  }, {
    key: "showDatepicker",
    value: function showDatepicker(event) {
      this.$datePicker.config(this.getDatePickerConfig());
      var offset = this.TD.getBoundingClientRect();
      var dateFormat = this.cellProperties.dateFormat || this.defaultDateFormat;
      var datePickerConfig = this.$datePicker.config();
      var dateStr;
      var isMouseDown = this.instance.view.isMouseDown();
      var isMeta = event ? (0, _unicode.isMetaKey)(event.keyCode) : false;
      this.datePickerStyle.top = "".concat(window.pageYOffset + offset.top + (0, _element.outerHeight)(this.TD), "px");
      this.datePickerStyle.left = "".concat(window.pageXOffset + offset.left, "px");

      this.$datePicker._onInputFocus = function () {};

      datePickerConfig.format = dateFormat;

      if (this.originalValue) {
        dateStr = this.originalValue;

        if ((0, _moment.default)(dateStr, dateFormat, true).isValid()) {
          this.$datePicker.setMoment((0, _moment.default)(dateStr, dateFormat), true);
        } // workaround for date/time cells - pikaday resets the cell value to 12:00 AM by default, this will overwrite the value.


        if (this.getValue() !== this.originalValue) {
          this.setValue(this.originalValue);
        }

        if (!isMeta && !isMouseDown) {
          this.setValue('');
        }
      } else if (this.cellProperties.defaultDate) {
        dateStr = this.cellProperties.defaultDate;
        datePickerConfig.defaultDate = dateStr;

        if ((0, _moment.default)(dateStr, dateFormat, true).isValid()) {
          this.$datePicker.setMoment((0, _moment.default)(dateStr, dateFormat), true);
        }

        if (!isMeta && !isMouseDown) {
          this.setValue('');
        }
      } else {
        // if a default date is not defined, set a soft-default-date: display the current day and month in the
        // datepicker, but don't fill the editor input
        this.$datePicker.gotoToday();
      }

      this.datePickerStyle.display = 'block';
      this.$datePicker.show();
    }
    /**
     * Hide data picker
     */

  }, {
    key: "hideDatepicker",
    value: function hideDatepicker() {
      this.datePickerStyle.display = 'none';
      this.$datePicker.hide();
    }
    /**
     * Get date picker options.
     *
     * @returns {Object}
     */

  }, {
    key: "getDatePickerConfig",
    value: function getDatePickerConfig() {
      var _this4 = this;

      var htInput = this.TEXTAREA;
      var options = {};

      if (this.cellProperties && this.cellProperties.datePickerConfig) {
        (0, _object.deepExtend)(options, this.cellProperties.datePickerConfig);
      }

      var origOnSelect = options.onSelect;
      var origOnClose = options.onClose;
      options.field = htInput;
      options.trigger = htInput;
      options.container = this.datePicker;
      options.bound = false;
      options.format = options.format || this.defaultDateFormat;
      options.reposition = options.reposition || false;

      options.onSelect = function (value) {
        var dateStr = value;

        if (!isNaN(dateStr.getTime())) {
          dateStr = (0, _moment.default)(dateStr).format(_this4.cellProperties.dateFormat || _this4.defaultDateFormat);
        }

        _this4.setValue(dateStr);

        _this4.hideDatepicker();

        if (origOnSelect) {
          origOnSelect();
        }
      };

      options.onClose = function () {
        if (!_this4.parentDestroyed) {
          _this4.finishEditing(false);
        }

        if (origOnClose) {
          origOnClose();
        }
      };

      return options;
    }
  }]);

  return DateEditor;
}(_textEditor.default);

var _default = DateEditor;
exports.default = _default;