"use strict";

exports.__esModule = true;
exports.default = void 0;

var _autocompleteEditor = _interopRequireDefault(require("./autocompleteEditor"));

var _pluginHooks = _interopRequireDefault(require("./../pluginHooks"));

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
 * @editor DropdownEditor
 * @class DropdownEditor
 * @dependencies AutocompleteEditor
 */
var DropdownEditor =
/*#__PURE__*/
function (_AutocompleteEditor) {
  _inherits(DropdownEditor, _AutocompleteEditor);

  function DropdownEditor() {
    _classCallCheck(this, DropdownEditor);

    return _possibleConstructorReturn(this, _getPrototypeOf(DropdownEditor).apply(this, arguments));
  }

  _createClass(DropdownEditor, [{
    key: "prepare",
    value: function prepare(row, col, prop, td, originalValue, cellProperties) {
      _get(_getPrototypeOf(DropdownEditor.prototype), "prepare", this).call(this, row, col, prop, td, originalValue, cellProperties);

      this.cellProperties.filter = false;
      this.cellProperties.strict = true;
    }
  }]);

  return DropdownEditor;
}(_autocompleteEditor.default);

_pluginHooks.default.getSingleton().add('beforeValidate', function (value, row, col) {
  var cellMeta = this.getCellMeta(row, this.propToCol(col));

  if (cellMeta.editor === DropdownEditor) {
    if (cellMeta.strict === void 0) {
      cellMeta.filter = false;
      cellMeta.strict = true;
    }
  }
});

var _default = DropdownEditor;
exports.default = _default;