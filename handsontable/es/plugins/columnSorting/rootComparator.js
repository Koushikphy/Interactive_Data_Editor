function _toArray(arr) { return _arrayWithHoles(arr) || _iterableToArray(arr) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/* eslint-disable import/prefer-default-export */
import { getCompareFunctionFactory } from './sortService';
/**
 * Sort comparator handled by conventional sort algorithm.
 *
 * @param {Array} sortOrders Sort orders (`asc` for ascending, `desc` for descending).
 * @param {Array} columnMetas Column meta objects.
 * @returns {Function}
 */

export function rootComparator(sortingOrders, columnMetas) {
  return function (rowIndexWithValues, nextRowIndexWithValues) {
    // We sort array of arrays. Single array is in form [rowIndex, ...values].
    // We compare just values, stored at second index of array.
    var _rowIndexWithValues = _toArray(rowIndexWithValues),
        values = _rowIndexWithValues.slice(1);

    var _nextRowIndexWithValu = _toArray(nextRowIndexWithValues),
        nextValues = _nextRowIndexWithValu.slice(1);

    return function getCompareResult(column) {
      var sortingOrder = sortingOrders[column];
      var columnMeta = columnMetas[column];
      var value = values[column];
      var nextValue = nextValues[column];
      var pluginSettings = columnMeta.columnSorting;
      var compareFunctionFactory = pluginSettings.compareFunctionFactory ? pluginSettings.compareFunctionFactory : getCompareFunctionFactory(columnMeta.type);
      var compareResult = compareFunctionFactory(sortingOrder, columnMeta, pluginSettings)(value, nextValue); // DIFF - MultiColumnSorting & ColumnSorting: removed iteration through next sorted columns.

      return compareResult;
    }(0);
  };
}