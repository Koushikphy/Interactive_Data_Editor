"use strict";

exports.__esModule = true;
exports.registerPhraseFormatter = exports.register = register;
exports.getPhraseFormatters = exports.getAll = getAll;

var _staticRegister2 = _interopRequireDefault(require("./../../utils/staticRegister"));

var _pluralize = _interopRequireDefault(require("./pluralize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _staticRegister = (0, _staticRegister2.default)('phraseFormatters'),
    registerGloballyPhraseFormatter = _staticRegister.register,
    getGlobalPhraseFormatters = _staticRegister.getValues;
/**
 * Register phrase formatter.
 *
 * @param {String} name Name of formatter.
 * @param {Function} formatterFn Function which will be applied on phrase propositions. It will transform them if it's possible.
 */


function register(name, formatterFn) {
  registerGloballyPhraseFormatter(name, formatterFn);
}
/**
 * Get all registered previously formatters.
 *
 * @returns {Array}
 */


function getAll() {
  return getGlobalPhraseFormatters();
}

register('pluralize', _pluralize.default);