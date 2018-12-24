"use strict";

exports.__esModule = true;
exports.compareFunctionFactory = compareFunctionFactory;
exports.COLUMN_DATA_TYPE = void 0;

var _mixed = require("../../../helpers/mixed");

var _sortService = require("../sortService");

/* eslint-disable import/prefer-default-export */

/**
 * Numeric sorting compare function factory. Method get as parameters `sortOrder` and `columnMeta` and return compare function.
 *
 * @param {String} sortOrder Sort order (`asc` for ascending, `desc` for descending).
 * @param {Object} columnMeta Column meta object.
 * @param {Object} columnPluginSettings Plugin settings for the column.
 * @returns {Function} The compare function.
 */
function compareFunctionFactory(sortOrder, columnMeta, columnPluginSettings) {
  return function (value, nextValue) {
    var parsedFirstValue = parseFloat(value);
    var parsedSecondValue = parseFloat(nextValue);
    var sortEmptyCells = columnPluginSettings.sortEmptyCells; // Watch out when changing this part of code! Check below returns 0 (as expected) when comparing empty string, null, undefined

    if (parsedFirstValue === parsedSecondValue || isNaN(parsedFirstValue) && isNaN(parsedSecondValue)) {
      return _sortService.DO_NOT_SWAP;
    }

    if (sortEmptyCells) {
      if ((0, _mixed.isEmpty)(value)) {
        return sortOrder === 'asc' ? _sortService.FIRST_BEFORE_SECOND : _sortService.FIRST_AFTER_SECOND;
      }

      if ((0, _mixed.isEmpty)(nextValue)) {
        return sortOrder === 'asc' ? _sortService.FIRST_AFTER_SECOND : _sortService.FIRST_BEFORE_SECOND;
      }
    }

    if (isNaN(parsedFirstValue)) {
      return _sortService.FIRST_AFTER_SECOND;
    }

    if (isNaN(parsedSecondValue)) {
      return _sortService.FIRST_BEFORE_SECOND;
    }

    if (parsedFirstValue < parsedSecondValue) {
      return sortOrder === 'asc' ? _sortService.FIRST_BEFORE_SECOND : _sortService.FIRST_AFTER_SECOND;
    } else if (parsedFirstValue > parsedSecondValue) {
      return sortOrder === 'asc' ? _sortService.FIRST_AFTER_SECOND : _sortService.FIRST_BEFORE_SECOND;
    }

    return _sortService.DO_NOT_SWAP;
  };
}

var COLUMN_DATA_TYPE = 'numeric';
exports.COLUMN_DATA_TYPE = COLUMN_DATA_TYPE;