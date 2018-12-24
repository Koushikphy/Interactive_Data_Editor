"use strict";

exports.__esModule = true;
exports.getValidator = _getItem;
exports.getRegisteredValidators = exports.getRegisteredValidatorNames = exports.hasValidator = exports.registerValidator = void 0;

var _staticRegister2 = _interopRequireDefault(require("./../utils/staticRegister"));

var _autocompleteValidator = _interopRequireDefault(require("./autocompleteValidator"));

var _dateValidator = _interopRequireDefault(require("./dateValidator"));

var _numericValidator = _interopRequireDefault(require("./numericValidator"));

var _timeValidator = _interopRequireDefault(require("./timeValidator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _staticRegister = (0, _staticRegister2.default)('validators'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem,
    hasItem = _staticRegister.hasItem,
    getNames = _staticRegister.getNames,
    getValues = _staticRegister.getValues;

exports.getRegisteredValidators = getValues;
exports.getRegisteredValidatorNames = getNames;
exports.hasValidator = hasItem;
exports.registerValidator = register;
register('autocomplete', _autocompleteValidator.default);
register('date', _dateValidator.default);
register('numeric', _numericValidator.default);
register('time', _timeValidator.default);
/**
 * Retrieve validator function.
 *
 * @param {String} name Validator identification.
 * @returns {Function} Returns validator function.
 */

function _getItem(name) {
  if (typeof name === 'function') {
    return name;
  }

  if (!hasItem(name)) {
    throw Error("No registered validator found under \"".concat(name, "\" name"));
  }

  return getItem(name);
}