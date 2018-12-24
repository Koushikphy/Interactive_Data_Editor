"use strict";

exports.__esModule = true;
exports.registerCellType = _register;
exports.getCellType = _getItem;
exports.getRegisteredCellTypes = exports.getRegisteredCellTypeNames = exports.hasCellType = void 0;

var _staticRegister2 = _interopRequireDefault(require("./../utils/staticRegister"));

var _editors = require("./../editors");

var _renderers = require("./../renderers");

var _validators = require("./../validators");

var _autocompleteType = _interopRequireDefault(require("./autocompleteType"));

var _checkboxType = _interopRequireDefault(require("./checkboxType"));

var _dateType = _interopRequireDefault(require("./dateType"));

var _dropdownType = _interopRequireDefault(require("./dropdownType"));

var _handsontableType = _interopRequireDefault(require("./handsontableType"));

var _numericType = _interopRequireDefault(require("./numericType"));

var _passwordType = _interopRequireDefault(require("./passwordType"));

var _textType = _interopRequireDefault(require("./textType"));

var _timeType = _interopRequireDefault(require("./timeType"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _staticRegister = (0, _staticRegister2.default)('cellTypes'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem,
    hasItem = _staticRegister.hasItem,
    getNames = _staticRegister.getNames,
    getValues = _staticRegister.getValues;

exports.getRegisteredCellTypes = getValues;
exports.getRegisteredCellTypeNames = getNames;
exports.hasCellType = hasItem;

_register('autocomplete', _autocompleteType.default);

_register('checkbox', _checkboxType.default);

_register('date', _dateType.default);

_register('dropdown', _dropdownType.default);

_register('handsontable', _handsontableType.default);

_register('numeric', _numericType.default);

_register('password', _passwordType.default);

_register('text', _textType.default);

_register('time', _timeType.default);
/**
 * Retrieve cell type object.
 *
 * @param {String} name Cell type identification.
 * @returns {Object} Returns cell type object.
 */


function _getItem(name) {
  if (!hasItem(name)) {
    throw Error("You declared cell type \"".concat(name, "\" as a string that is not mapped to a known object.\n                 Cell type must be an object or a string mapped to an object registered by \"Handsontable.cellTypes.registerCellType\" method"));
  }

  return getItem(name);
}
/**
 * Register cell type under specified name.
 *
 * @param {String} name Cell type identification.
 * @param {Object} type An object with contains keys (eq: `editor`, `renderer`, `validator`) which describes specified behaviour of the cell.
 */


function _register(name, type) {
  var editor = type.editor,
      renderer = type.renderer,
      validator = type.validator;

  if (editor) {
    (0, _editors.registerEditor)(name, editor);
  }

  if (renderer) {
    (0, _renderers.registerRenderer)(name, renderer);
  }

  if (validator) {
    (0, _validators.registerValidator)(name, validator);
  }

  register(name, type);
}