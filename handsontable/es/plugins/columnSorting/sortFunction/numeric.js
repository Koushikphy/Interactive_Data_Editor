/* eslint-disable import/prefer-default-export */
import { isEmpty } from '../../../helpers/mixed';
import { DO_NOT_SWAP, FIRST_BEFORE_SECOND, FIRST_AFTER_SECOND } from '../sortService';
/**
 * Numeric sorting compare function factory. Method get as parameters `sortOrder` and `columnMeta` and return compare function.
 *
 * @param {String} sortOrder Sort order (`asc` for ascending, `desc` for descending).
 * @param {Object} columnMeta Column meta object.
 * @param {Object} columnPluginSettings Plugin settings for the column.
 * @returns {Function} The compare function.
 */

export function compareFunctionFactory(sortOrder, columnMeta, columnPluginSettings) {
  return function (value, nextValue) {
    var parsedFirstValue = parseFloat(value);
    var parsedSecondValue = parseFloat(nextValue);
    var sortEmptyCells = columnPluginSettings.sortEmptyCells; // Watch out when changing this part of code! Check below returns 0 (as expected) when comparing empty string, null, undefined

    if (parsedFirstValue === parsedSecondValue || isNaN(parsedFirstValue) && isNaN(parsedSecondValue)) {
      return DO_NOT_SWAP;
    }

    if (sortEmptyCells) {
      if (isEmpty(value)) {
        return sortOrder === 'asc' ? FIRST_BEFORE_SECOND : FIRST_AFTER_SECOND;
      }

      if (isEmpty(nextValue)) {
        return sortOrder === 'asc' ? FIRST_AFTER_SECOND : FIRST_BEFORE_SECOND;
      }
    }

    if (isNaN(parsedFirstValue)) {
      return FIRST_AFTER_SECOND;
    }

    if (isNaN(parsedSecondValue)) {
      return FIRST_BEFORE_SECOND;
    }

    if (parsedFirstValue < parsedSecondValue) {
      return sortOrder === 'asc' ? FIRST_BEFORE_SECOND : FIRST_AFTER_SECOND;
    } else if (parsedFirstValue > parsedSecondValue) {
      return sortOrder === 'asc' ? FIRST_AFTER_SECOND : FIRST_BEFORE_SECOND;
    }

    return DO_NOT_SWAP;
  };
}
export var COLUMN_DATA_TYPE = 'numeric';