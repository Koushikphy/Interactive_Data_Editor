"use strict";

exports.__esModule = true;
exports.RegisteredEditor = RegisteredEditor;
exports.getEditorInstance = exports._getEditorInstance = _getEditorInstance;
exports.registerEditor = _register;
exports.getEditor = _getItem;
exports.getRegisteredEditors = exports.getRegisteredEditorNames = exports.hasEditor = void 0;

var _staticRegister2 = _interopRequireDefault(require("./../utils/staticRegister"));

var _pluginHooks = _interopRequireDefault(require("./../pluginHooks"));

var _baseEditor = _interopRequireDefault(require("./_baseEditor"));

var _autocompleteEditor = _interopRequireDefault(require("./autocompleteEditor"));

var _checkboxEditor = _interopRequireDefault(require("./checkboxEditor"));

var _dateEditor = _interopRequireDefault(require("./dateEditor"));

var _dropdownEditor = _interopRequireDefault(require("./dropdownEditor"));

var _handsontableEditor = _interopRequireDefault(require("./handsontableEditor"));

var _numericEditor = _interopRequireDefault(require("./numericEditor"));

var _passwordEditor = _interopRequireDefault(require("./passwordEditor"));

var _selectEditor = _interopRequireDefault(require("./selectEditor"));

var _textEditor = _interopRequireDefault(require("./textEditor"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Utility to register editors and common namespace for keeping reference to all editor classes
 */
var registeredEditorClasses = new WeakMap();

var _staticRegister = (0, _staticRegister2.default)('editors'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem,
    hasItem = _staticRegister.hasItem,
    getNames = _staticRegister.getNames,
    getValues = _staticRegister.getValues;

exports.getRegisteredEditors = getValues;
exports.getRegisteredEditorNames = getNames;
exports.hasEditor = hasItem;

_register('base', _baseEditor.default);

_register('autocomplete', _autocompleteEditor.default);

_register('checkbox', _checkboxEditor.default);

_register('date', _dateEditor.default);

_register('dropdown', _dropdownEditor.default);

_register('handsontable', _handsontableEditor.default);

_register('numeric', _numericEditor.default);

_register('password', _passwordEditor.default);

_register('select', _selectEditor.default);

_register('text', _textEditor.default);

function RegisteredEditor(editorClass) {
  var instances = {};
  var Clazz = editorClass;

  this.getConstructor = function () {
    return editorClass;
  };

  this.getInstance = function (hotInstance) {
    if (!(hotInstance.guid in instances)) {
      instances[hotInstance.guid] = new Clazz(hotInstance);
    }

    return instances[hotInstance.guid];
  };

  _pluginHooks.default.getSingleton().add('afterDestroy', function () {
    instances[this.guid] = null;
  });
}
/**
 * Returns instance (singleton) of editor class.
 *
 * @param {String} name Name of an editor under which it has been stored.
 * @param {Object} hotInstance Instance of Handsontable.
 * @returns {Function} Returns instance of editor.
 */


function _getEditorInstance(name, hotInstance) {
  var editor;

  if (typeof name === 'function') {
    if (!registeredEditorClasses.get(name)) {
      _register(null, name);
    }

    editor = registeredEditorClasses.get(name);
  } else if (typeof name === 'string') {
    editor = getItem(name);
  } else {
    throw Error('Only strings and functions can be passed as "editor" parameter');
  }

  if (!editor) {
    throw Error("No editor registered under name \"".concat(name, "\""));
  }

  return editor.getInstance(hotInstance);
}
/**
 * Retrieve editor class.
 *
 * @param {String} name Editor identification.
 * @returns {Function} Returns editor class.
 */


function _getItem(name) {
  if (!hasItem(name)) {
    throw Error("No registered editor found under \"".concat(name, "\" name"));
  }

  return getItem(name).getConstructor();
}
/**
 * Register editor class under specified name.
 *
 * @param {String} name Editor identification.
 * @param {Function} editorClass Editor class.
 */


function _register(name, editorClass) {
  var editorWrapper = new RegisteredEditor(editorClass);

  if (typeof name === 'string') {
    register(name, editorWrapper);
  }

  registeredEditorClasses.set(editorClass, editorWrapper);
}