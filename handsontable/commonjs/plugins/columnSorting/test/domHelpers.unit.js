"use strict";

var _columnStatesManager = require("handsontable/plugins/columnSorting/columnStatesManager");

var _utils = require("handsontable/plugins/columnSorting/utils");

var _domHelpers = require("handsontable/plugins/columnSorting/domHelpers");

describe('ColumnSorting DOM helpers', function () {
  describe('getClassesToAdd', function () {
    it('should add `columnSorting` CSS class by default', function () {
      var columnStatesManager = new _columnStatesManager.ColumnStatesManager();
      columnStatesManager.setSortStates([{
        column: 1,
        sortOrder: _utils.DESC_SORT_STATE
      }]);
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0).includes('columnSorting')).toBeTruthy();
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1).includes('columnSorting')).toBeTruthy();
    });
    it('should add `sortAction` CSS class for clickable header', function () {
      var columnStatesManager = new _columnStatesManager.ColumnStatesManager();
      columnStatesManager.setSortStates([{
        column: 1,
        sortOrder: _utils.DESC_SORT_STATE
      }]);
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, void 0, true).includes('sortAction')).toBeTruthy();
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, void 0, false).includes('sortAction')).toBeFalsy();
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, void 0, true).includes('sortAction')).toBeTruthy();
      expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, void 0, false).includes('sortAction')).toBeFalsy();
    });
    describe('should add proper CSS classes for enabled / disabled indicator', function () {
      it('single sorted column', function () {
        var columnStatesManager = new _columnStatesManager.ColumnStatesManager();
        columnStatesManager.setSortStates([{
          column: 1,
          sortOrder: _utils.DESC_SORT_STATE
        }]);
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, false).includes('ascending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, false).includes('descending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, false).includes('indicatorDisabled')).toBeTruthy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, true).includes('ascending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, true).includes('descending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 0, true).includes('indicatorDisabled')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, false).includes('ascending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, false).includes('descending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, false).includes('indicatorDisabled')).toBeTruthy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, true).includes('ascending')).toBeFalsy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, true).includes('descending')).toBeTruthy();
        expect((0, _domHelpers.getClassesToAdd)(columnStatesManager, 1, true).includes('indicatorDisabled')).toBeFalsy();
      });
    });
  });
  describe('getClassedToRemove', function () {
    it('should return all calculated classes', function () {
      var columnStatesManager = new _columnStatesManager.ColumnStatesManager();
      columnStatesManager.setSortStates([{
        column: 3,
        sortOrder: _utils.ASC_SORT_STATE
      }]);
      var htmlElementMock = {
        className: 'columnSorting sortAction'
      };
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).length).toEqual(5);
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).includes('columnSorting')).toBeTruthy();
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).includes('indicatorDisabled')).toBeTruthy();
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).includes('sortAction')).toBeTruthy();
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).includes('ascending')).toBeTruthy();
      expect((0, _domHelpers.getClassedToRemove)(htmlElementMock).includes('descending')).toBeTruthy();
    });
  });
});