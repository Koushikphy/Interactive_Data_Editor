"use strict";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

describe('manualColumnFreeze', function () {
  var id = 'testContainer';
  beforeEach(function () {
    this.$container = $("<div id=\"".concat(id, "\"></div>")).appendTo('body');
  });
  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });
  describe('freezeColumn', function () {
    it('should increase fixedColumnsLeft setting', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true
      });
      var plugin = hot.getPlugin('manualColumnFreeze');
      plugin.freezeColumn(4);
      expect(hot.getSettings().fixedColumnsLeft).toEqual(1);
    });
    it('should freeze (make fixed) the column provided as an argument', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true
      });
      var plugin = hot.getPlugin('manualColumnFreeze');
      var movePlugin = hot.getPlugin('manualColumnMove');
      plugin.freezeColumn(5);
      expect(movePlugin.columnsMapper.getValueByIndex(0)).toEqual(5);
    });
  });
  describe('unfreezeColumn', function () {
    it('should decrease fixedColumnsLeft setting', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        fixedColumnsLeft: 1
      });
      var plugin = hot.getPlugin('manualColumnFreeze');
      plugin.unfreezeColumn(0);
      expect(hot.getSettings().fixedColumnsLeft).toEqual(0);
    });
    it('should unfreeze (make non-fixed) the column provided as an argument', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        fixedColumnsLeft: 3
      });
      var plugin = hot.getPlugin('manualColumnFreeze');
      var movePlugin = hot.getPlugin('manualColumnMove');
      plugin.unfreezeColumn(0);
      expect(hot.getSettings().fixedColumnsLeft).toEqual(2);
      expect(movePlugin.columnsMapper.getValueByIndex(0)).toEqual(1);
      expect(movePlugin.columnsMapper.getValueByIndex(1)).toEqual(2);
      expect(movePlugin.columnsMapper.getValueByIndex(2)).toEqual(0);
    });
    it('should unfreeze the last column', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true
      });
      var plugin = hot.getPlugin('manualColumnFreeze');
      var movePlugin = hot.getPlugin('manualColumnMove');
      plugin.freezeColumn(9);
      expect(hot.getSettings().fixedColumnsLeft).toEqual(1);
      expect(movePlugin.columnsMapper.getValueByIndex(0)).toEqual(9);
      expect(movePlugin.columnsMapper.getValueByIndex(9)).toEqual(8);
      plugin.unfreezeColumn(0);
      expect(hot.getSettings().fixedColumnsLeft).toEqual(0);
      expect(movePlugin.columnsMapper.getValueByIndex(0)).toEqual(0);
      expect(movePlugin.columnsMapper.getValueByIndex(9)).toEqual(9);
    });
  });
  describe('functionality', function () {
    it('should add a \'freeze column\' context menu entry for non-fixed columns', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        contextMenu: true
      });
      selectCell(1, 1);
      contextMenu();
      var freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        return $(this).text() === 'Freeze column';
      });
      expect(freezeEntry.size()).toEqual(1);
    });
    it('should add a \'unfreeze column\' context menu entry for fixed columns', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        contextMenu: true,
        fixedColumnsLeft: 2
      });
      selectCell(1, 1);
      contextMenu();
      var freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        return $(this).text() === 'Unfreeze column';
      });
      expect(freezeEntry.size()).toEqual(1);
    });
    it('should fix the desired column after clicking the \'freeze column\' context menu entry', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        fixedColumnsLeft: 1,
        contextMenu: true
      });
      selectCell(1, 3);
      var dataAtCell = hot.getDataAtCell(1, 3);
      contextMenu();
      var freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        if ($(this).text() === 'Freeze column') {
          return true;
        }

        return false;
      });
      expect(freezeEntry.size()).toEqual(1);
      freezeEntry.eq(0).simulate('mousedown');
      expect(hot.getSettings().fixedColumnsLeft).toEqual(2);
      expect(hot.getDataAtCell(1, 1)).toEqual(dataAtCell);
    });
    it('should unfix the desired column (and revert it to it\'s original position) after clicking the \'unfreeze column\' context menu entry',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(10, 10),
        manualColumnFreeze: true,
        fixedColumnsLeft: 3,
        manualColumnMove: [0, 2, 5, 3, 4, 1, 6, 7, 8, 9],
        contextMenu: true,
        rowHeaders: true
      });
      var dataAtCell = hot.getDataAtCell(1, 0);
      expect(dataAtCell).toEqual('A2');
      dataAtCell = hot.getDataAtCell(1, 1);
      expect(dataAtCell).toEqual('C2');
      dataAtCell = hot.getDataAtCell(1, 2);
      expect(dataAtCell).toEqual('F2');
      selectCell(1, 1);
      contextMenu();
      var freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        return $(this).text() === 'Unfreeze column';
      });
      freezeEntry.eq(0).simulate('mousedown');
      expect(hot.getSettings().fixedColumnsLeft).toEqual(2);
      dataAtCell = hot.getDataAtCell(1, 0);
      expect(dataAtCell).toEqual('A2');
      dataAtCell = hot.getDataAtCell(1, 1);
      expect(dataAtCell).toEqual('F2');
      dataAtCell = hot.getDataAtCell(1, 2);
      expect(dataAtCell).toEqual('C2');
      selectCell(1, 1);
      contextMenu();
      freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        if ($(this).text() === 'Unfreeze column') {
          return true;
        }

        return false;
      });
      freezeEntry.eq(0).simulate('mousedown');
      expect(hot.getSettings().fixedColumnsLeft).toEqual(1);
      dataAtCell = hot.getDataAtCell(1, 0);
      expect(dataAtCell).toEqual('A2');
      dataAtCell = hot.getDataAtCell(1, 1);
      expect(dataAtCell).toEqual('C2');
      dataAtCell = hot.getDataAtCell(1, 2);
      expect(dataAtCell).toEqual('D2');
      dataAtCell = hot.getDataAtCell(1, 5);
      expect(dataAtCell).toEqual('F2'); // Use the modified columns position.

      hot.updateSettings({
        fixedColumnsLeft: 0,
        manualColumnMove: [0, 2, 5, 3, 4, 1, 6, 7, 8, 9]
      });
      yield sleep(300);
      hot.getSettings().fixedColumnsLeft = 0;
      selectCell(1, 2);
      contextMenu();
      freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        return $(this).text() === 'Freeze column';
      });
      freezeEntry.eq(0).simulate('mousedown');
      expect(hot.getSettings().fixedColumnsLeft).toEqual(1);
      dataAtCell = hot.getDataAtCell(1, 0);
      expect(dataAtCell).toEqual('F2');
      selectCell(1, 0);
      contextMenu();
      freezeEntry = $(hot.getPlugin('contextMenu').menu.container).find('div').filter(function () {
        return $(this).text() === 'Unfreeze column';
      });
      freezeEntry.eq(0).simulate('mousedown');
      expect(hot.getSettings().fixedColumnsLeft).toEqual(0);
      dataAtCell = hot.getDataAtCell(1, 2);
      expect(dataAtCell).toEqual('F2');
    }));
  });
});