"use strict";

exports.__esModule = true;
exports.getRenderer = _getItem;
exports.getRegisteredRenderers = exports.getRegisteredRendererNames = exports.hasRenderer = exports.registerRenderer = void 0;

var _staticRegister2 = _interopRequireDefault(require("./../utils/staticRegister"));

var _cellDecorator = _interopRequireDefault(require("./_cellDecorator"));

var _autocompleteRenderer = _interopRequireDefault(require("./autocompleteRenderer"));

var _checkboxRenderer = _interopRequireDefault(require("./checkboxRenderer"));

var _htmlRenderer = _interopRequireDefault(require("./htmlRenderer"));

var _numericRenderer = _interopRequireDefault(require("./numericRenderer"));

var _passwordRenderer = _interopRequireDefault(require("./passwordRenderer"));

var _textRenderer = _interopRequireDefault(require("./textRenderer"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _staticRegister = (0, _staticRegister2.default)('renderers'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem,
    hasItem = _staticRegister.hasItem,
    getNames = _staticRegister.getNames,
    getValues = _staticRegister.getValues;

exports.getRegisteredRenderers = getValues;
exports.getRegisteredRendererNames = getNames;
exports.hasRenderer = hasItem;
exports.registerRenderer = register;
register('base', _cellDecorator.default);
register('autocomplete', _autocompleteRenderer.default);
register('checkbox', _checkboxRenderer.default);
register('html', _htmlRenderer.default);
register('numeric', _numericRenderer.default);
register('password', _passwordRenderer.default);
register('text', _textRenderer.default);
/**
 * Retrieve renderer function.
 *
 * @param {String} name Renderer identification.
 * @returns {Function} Returns renderer function.
 */

function _getItem(name) {
  if (typeof name === 'function') {
    return name;
  }

  if (!hasItem(name)) {
    throw Error("No registered renderer found under \"".concat(name, "\" name"));
  }

  return getItem(name);
}