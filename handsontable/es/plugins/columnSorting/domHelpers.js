/* eslint-disable import/prefer-default-export */
import { ASC_SORT_STATE, DESC_SORT_STATE } from './utils';
var HEADER_CLASS_ASC_SORT = 'ascending';
var HEADER_CLASS_DESC_SORT = 'descending';
var HEADER_CLASS_INDICATOR_DISABLED = 'indicatorDisabled';
var HEADER_SORT_CLASS = 'columnSorting';
var HEADER_ACTION_CLASS = 'sortAction';
var orderToCssClass = new Map([[ASC_SORT_STATE, HEADER_CLASS_ASC_SORT], [DESC_SORT_STATE, HEADER_CLASS_DESC_SORT]]);
/**
 * Get CSS classes which should be added to particular column header.
 * @param {Object} columnStatesManager Instance of column state manager.
 * @param {Number} column Physical column index.
 * @param {Boolean} showSortIndicator Indicates if indicator should be shown for the particular column.
 * @param {Boolean} headerAction Indicates if header click to sort should be possible.
 * @returns {Array} Array of CSS classes.
 */

export function getClassesToAdd(columnStatesManager, column, showSortIndicator, headerAction) {
  var cssClasses = [HEADER_SORT_CLASS];

  if (headerAction) {
    cssClasses.push(HEADER_ACTION_CLASS);
  }

  if (showSortIndicator === false) {
    cssClasses.push(HEADER_CLASS_INDICATOR_DISABLED);
  } else if (columnStatesManager.isColumnSorted(column)) {
    var columnOrder = columnStatesManager.getSortOrderOfColumn(column);
    cssClasses.push(orderToCssClass.get(columnOrder));
  }

  return cssClasses;
}
/**
 * Get CSS classes which should be removed from column header.
 *
 * @returns {Array} Array of CSS classes.
 */

export function getClassedToRemove() {
  return Array.from(orderToCssClass.values()).concat(HEADER_ACTION_CLASS, HEADER_CLASS_INDICATOR_DISABLED, HEADER_SORT_CLASS);
}