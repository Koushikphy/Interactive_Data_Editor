"use strict";

exports.__esModule = true;
exports.compareFunctionFactory = compareFunctionFactory;
exports.COLUMN_DATA_TYPE = void 0;

var _moment = _interopRequireDefault(require("moment"));

var _mixed = require("../../../helpers/mixed");

var _sortService = require("../sortService");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/prefer-default-export */

/**
 * Date sorting compare function factory. Method get as parameters `sortOrder` and `columnMeta` and return compare function.
 *
 * @param {String} sortOrder Sort order (`asc` for ascending, `desc` for descending).
 * @param {Object} columnMeta Column meta object.
 * @param {Object} columnPluginSettings Plugin settings for the column.
 * @returns {Function} The compare function.
 */
function compareFunctionFactory(sortOrder, columnMeta, columnPluginSettings) {
  return function (value, nextValue) {
    var sortEmptyCells = columnPluginSettings.sortEmptyCells;

    if (value === nextValue) {
      return _sortService.DO_NOT_SWAP;
    }

    if ((0, _mixed.isEmpty)(value)) {
      if ((0, _mixed.isEmpty)(nextValue)) {
        return _sortService.DO_NOT_SWAP;
      } // Just fist value is empty and `sortEmptyCells` option was set


      if (sortEmptyCells) {
        return sortOrder === 'asc' ? _sortService.FIRST_BEFORE_SECOND : _sortService.FIRST_AFTER_SECOND;
      }

      return _sortService.FIRST_AFTER_SECOND;
    }

    if ((0, _mixed.isEmpty)(nextValue)) {
      // Just second value is empty and `sortEmptyCells` option was set
      if (sortEmptyCells) {
        return sortOrder === 'asc' ? _sortService.FIRST_AFTER_SECOND : _sortService.FIRST_BEFORE_SECOND;
      }

      return _sortService.FIRST_BEFORE_SECOND;
    }

    var dateFormat = columnMeta.dateFormat;
    var firstDate = (0, _moment.default)(value, dateFormat);
    var nextDate = (0, _moment.default)(nextValue, dateFormat);

    if (!firstDate.isValid()) {
      return _sortService.FIRST_AFTER_SECOND;
    }

    if (!nextDate.isValid()) {
      return _sortService.FIRST_BEFORE_SECOND;
    }

    if (nextDate.isAfter(firstDate)) {
      return sortOrder === 'asc' ? _sortService.FIRST_BEFORE_SECOND : _sortService.FIRST_AFTER_SECOND;
    }

    if (nextDate.isBefore(firstDate)) {
      return sortOrder === 'asc' ? _sortService.FIRST_AFTER_SECOND : _sortService.FIRST_BEFORE_SECOND;
    }

    return _sortService.DO_NOT_SWAP;
  };
}

var COLUMN_DATA_TYPE = 'date';
exports.COLUMN_DATA_TYPE = COLUMN_DATA_TYPE;