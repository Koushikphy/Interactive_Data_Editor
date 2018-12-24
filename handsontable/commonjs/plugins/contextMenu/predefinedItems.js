"use strict";

exports.__esModule = true;
exports.predefinedItems = predefinedItems;
exports.addItem = addItem;
exports.ITEMS = exports.UNDO = exports.SEPARATOR = exports.ROW_BELOW = exports.ROW_ABOVE = exports.REMOVE_ROW = exports.REMOVE_COLUMN = exports.REDO = exports.READ_ONLY = exports.COLUMN_RIGHT = exports.COLUMN_LEFT = exports.CLEAR_COLUMN = exports.ALIGNMENT = void 0;

var _object = require("./../../helpers/object");

var _alignment = _interopRequireWildcard(require("./predefinedItems/alignment"));

exports.ALIGNMENT = _alignment.KEY;

var _clearColumn = _interopRequireWildcard(require("./predefinedItems/clearColumn"));

exports.CLEAR_COLUMN = _clearColumn.KEY;

var _columnLeft = _interopRequireWildcard(require("./predefinedItems/columnLeft"));

exports.COLUMN_LEFT = _columnLeft.KEY;

var _columnRight = _interopRequireWildcard(require("./predefinedItems/columnRight"));

exports.COLUMN_RIGHT = _columnRight.KEY;

var _readOnly = _interopRequireWildcard(require("./predefinedItems/readOnly"));

exports.READ_ONLY = _readOnly.KEY;

var _redo = _interopRequireWildcard(require("./predefinedItems/redo"));

exports.REDO = _redo.KEY;

var _removeColumn = _interopRequireWildcard(require("./predefinedItems/removeColumn"));

exports.REMOVE_COLUMN = _removeColumn.KEY;

var _removeRow = _interopRequireWildcard(require("./predefinedItems/removeRow"));

exports.REMOVE_ROW = _removeRow.KEY;

var _rowAbove = _interopRequireWildcard(require("./predefinedItems/rowAbove"));

exports.ROW_ABOVE = _rowAbove.KEY;

var _rowBelow = _interopRequireWildcard(require("./predefinedItems/rowBelow"));

exports.ROW_BELOW = _rowBelow.KEY;

var _separator = _interopRequireWildcard(require("./predefinedItems/separator"));

exports.SEPARATOR = _separator.KEY;

var _undo = _interopRequireWildcard(require("./predefinedItems/undo"));

exports.UNDO = _undo.KEY;

var _predefinedItems2;

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ITEMS = [_rowAbove.KEY, _rowBelow.KEY, _columnLeft.KEY, _columnRight.KEY, _clearColumn.KEY, _removeRow.KEY, _removeColumn.KEY, _undo.KEY, _redo.KEY, _readOnly.KEY, _alignment.KEY, _separator.KEY];
exports.ITEMS = ITEMS;

var _predefinedItems = (_predefinedItems2 = {}, _defineProperty(_predefinedItems2, _separator.KEY, _separator.default), _defineProperty(_predefinedItems2, _rowAbove.KEY, _rowAbove.default), _defineProperty(_predefinedItems2, _rowBelow.KEY, _rowBelow.default), _defineProperty(_predefinedItems2, _columnLeft.KEY, _columnLeft.default), _defineProperty(_predefinedItems2, _columnRight.KEY, _columnRight.default), _defineProperty(_predefinedItems2, _clearColumn.KEY, _clearColumn.default), _defineProperty(_predefinedItems2, _removeRow.KEY, _removeRow.default), _defineProperty(_predefinedItems2, _removeColumn.KEY, _removeColumn.default), _defineProperty(_predefinedItems2, _undo.KEY, _undo.default), _defineProperty(_predefinedItems2, _redo.KEY, _redo.default), _defineProperty(_predefinedItems2, _readOnly.KEY, _readOnly.default), _defineProperty(_predefinedItems2, _alignment.KEY, _alignment.default), _predefinedItems2);
/**
 * Gets new object with all predefined menu items.
 *
 * @returns {Object}
 */


function predefinedItems() {
  var items = {};
  (0, _object.objectEach)(_predefinedItems, function (itemFactory, key) {
    items[key] = itemFactory();
  });
  return items;
}
/**
 * Add new predefined menu item to the collection.
 *
 * @param {String} key Menu command id.
 * @param {Object} item Object command descriptor.
 */


function addItem(key, item) {
  if (ITEMS.indexOf(key) === -1) {
    _predefinedItems[key] = item;
  }
}