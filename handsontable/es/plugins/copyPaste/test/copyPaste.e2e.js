function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

describe('CopyPaste', function () {
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

  var DataTransferObject =
  /*#__PURE__*/
  function () {
    function DataTransferObject() {
      _classCallCheck(this, DataTransferObject);

      this.data = {
        'text/plain': '',
        'text/html': ''
      };
    }

    _createClass(DataTransferObject, [{
      key: "getData",
      value: function getData() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text/plain';
        return this.data[type];
      }
    }, {
      key: "setData",
      value: function setData() {
        var type = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'text/plain';
        var value = arguments.length > 1 ? arguments[1] : undefined;
        this.data[type] = value;
      }
    }]);

    return DataTransferObject;
  }();

  function getClipboardEvent() {
    var event = {};
    event.clipboardData = new DataTransferObject();

    event.preventDefault = function () {};

    return event;
  }

  var arrayOfArrays = function arrayOfArrays() {
    return [['', 'Kia', 'Nissan', 'Toyota', 'Honda'], ['2008', 10, 11, 12, 13], ['2009', 20, 11, 14, 13], ['2010', 30, 15, 12, 13]];
  };

  describe('enabling/disabing plugin', function () {
    it('should copyPaste be set enabled as default', function () {
      var hot = handsontable();
      expect(hot.getSettings().copyPaste).toBeTruthy();
      expect(hot.getPlugin('CopyPaste').focusableElement).toBeDefined();
    });
    it('should do not create textarea element if copyPaste is disabled on initialization', function () {
      handsontable({
        copyPaste: false
      });
      expect($('#HandsontableCopyPaste').length).toEqual(0);
    });
  });
  it('should reuse focusable element by borrowing an element from cell editor',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    handsontable();
    selectCell(0, 0);
    yield sleep(10);
    expect(document.activeElement).toBe(getActiveEditor().TEXTAREA);
    expect($('#HandsontableCopyPaste').length).toBe(0);
  }));
  it('should create focusable element when cell editor doesn\'t exist', function () {
    handsontable({
      editor: false
    });
    selectCell(0, 0);
    expect($('#HandsontableCopyPaste').length).toEqual(1);
  });
  it('should keep focusable element if updateSettings occurred after the end of the selection', function () {
    handsontable();
    selectCell(0, 0, 2, 2);
    updateSettings({});
    expect(getPlugin('CopyPaste').focusableElement.mainElement).not.toBe(null);
  });
  describe('working with multiple tables', function () {
    beforeEach(function () {
      this.$container2 = $("<div id=\"".concat(id, "2\"></div>")).appendTo('body');
    });
    afterEach(function () {
      if (this.$container2) {
        this.$container2.handsontable('destroy');
        this.$container2.remove();
      }
    });
    it('should disable copyPaste only in particular table', function () {
      var hot1 = handsontable();
      var hot2 = spec().$container2.handsontable({
        copyPaste: false
      }).handsontable('getInstance');
      expect(hot1.getPlugin('CopyPaste').focusableElement).toBeDefined();
      expect(hot2.getPlugin('CopyPaste').focusableElement).toBeUndefined();
    });
    it('should not create HandsontableCopyPaste element until the table will be selected', function () {
      handsontable();
      spec().$container2.handsontable();
      expect($('#HandsontableCopyPaste').length).toBe(0);
    });
    it('should use focusable element from cell editor of the lastly selected table',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var hot1 = handsontable();
      var hot2 = spec().$container2.handsontable().handsontable('getInstance');
      hot1.selectCell(0, 0);
      hot2.selectCell(1, 1);
      yield sleep(0);
      expect($('#HandsontableCopyPaste').length).toBe(0);
      expect(document.activeElement).toBe(hot2.getActiveEditor().TEXTAREA);
    }));
    it('should destroy HandsontableCopyPaste element as long as at least one table has copyPaste enabled', function () {
      var hot1 = handsontable({
        editor: false
      });
      var hot2 = spec().$container2.handsontable({
        editor: false
      }).handsontable('getInstance');
      hot1.selectCell(0, 0);
      hot2.selectCell(0, 0);
      expect($('#HandsontableCopyPaste').length).toBe(1);
      hot1.updateSettings({
        copyPaste: false
      });
      expect($('#HandsontableCopyPaste').length).toBe(1);
      hot2.updateSettings({
        copyPaste: false
      });
      expect($('#HandsontableCopyPaste').length).toBe(0);
    });
    it('should not touch focusable element borrowed from cell editors', function () {
      var hot1 = handsontable();
      var hot2 = spec().$container2.handsontable().handsontable('getInstance');
      hot1.selectCell(0, 0);
      hot2.selectCell(0, 0);
      expect($('.handsontableInput').length).toBe(2);
      hot1.updateSettings({
        copyPaste: false
      });
      expect($('.handsontableInput').length).toBe(2);
      hot2.updateSettings({
        copyPaste: false
      });
      expect($('.handsontableInput').length).toBe(2);
    });
  });
  describe('copy', function () {
    xit('should be possible to copy data by keyboard shortcut', function () {// simulated keyboard shortcuts doesn't run the true events
    });
    xit('should be possible to copy data by contextMenu option', function () {// simulated mouse events doesn't run the true browser event
    });
    it('should be possible to copy data by API', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(1, 0);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toBe('A2');
      expect(copyEvent.clipboardData.getData('text/html')).toBe('<table><tbody><tr><td>A2</td></tr></tbody></table>');
    });
    it('should call beforeCopy and afterCopy during copying operation', function () {
      var beforeCopySpy = jasmine.createSpy('beforeCopy');
      var afterCopySpy = jasmine.createSpy('afterCopy');
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy: beforeCopySpy,
        afterCopy: afterCopySpy
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(0, 0);
      plugin.onCopy(copyEvent);
      expect(beforeCopySpy.calls.count()).toEqual(1);
      expect(beforeCopySpy).toHaveBeenCalledWith([['A1']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
      expect(afterCopySpy.calls.count()).toEqual(1);
      expect(afterCopySpy).toHaveBeenCalledWith([['A1']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
    });
    it('should be possible to block copying', function () {
      var beforeCopySpy = jasmine.createSpy('beforeCopy');
      var afterCopySpy = jasmine.createSpy('afterCopy');
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy: function beforeCopy() {
          beforeCopySpy();
          return false;
        },
        afterCopy: afterCopySpy
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(0, 0);
      plugin.onCopy(copyEvent);
      expect(beforeCopySpy.calls.count()).toEqual(1);
      expect(afterCopySpy.calls.count()).toEqual(0);
    });
    it('should be possible modification of changes during copying', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCopy: function beforeCopy(changes) {
          changes.splice(0, 1);
        }
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(0, 0, 1, 0);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toEqual('A2');
      expect(copyEvent.clipboardData.getData('text/html')).toEqual('<table><tbody><tr><td>A2</td></tr></tbody></table>');
    });
    it('should be possible to copy multiline text', function () {
      handsontable({
        data: [['A\nB', 'C']]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 0, 1);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toEqual('"A\nB"\tC');
      expect(copyEvent.clipboardData.getData('text/html')).toEqual('<table><tbody><tr><td>A<br>B</td><td>C</td></tr></tbody></table>');
    });
    it('should be possible to copy special chars', function () {
      handsontable({
        data: [['!@#$%^&*()_+-={[', ']};:\'"\\|,<.>/?~']]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 0, 1);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toEqual('!@#$%^&*()_+-={[\t]};:\'"\\|,<.>/?~');
      expect(copyEvent.clipboardData.getData('text/html')).toEqual(['<table><tbody><tr><td>!@#$%^&amp;*()_+-={[</td>', '<td>]};:\'"\\|,&lt;.&gt;/?~</td></tr></tbody></table>'].join(''));
    });
    it('should be possible to copy text in quotes', function () {
      handsontable({
        data: [['{"test": "value"}'], ['{"test2": {"testtest": ""}}'], ['{"test3": ""}']]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 2, 0);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toEqual('{"test": "value"}\n{"test2": {"testtest": ""}}\n{"test3": ""}');
      expect(copyEvent.clipboardData.getData('text/html')).toEqual(['<table><tbody><tr><td>{"test": "value"}</td></tr><tr><td>{"test2": {"testtest": ""}}</td>', '</tr><tr><td>{"test3": ""}</td></tr></tbody></table>'].join(''));
    });
    it('should be possible to copy 0 and false', function () {
      handsontable({
        data: [[''], [0], [false], [undefined], [null]]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 4, 0);
      plugin.onCopy(copyEvent);
      expect(copyEvent.clipboardData.getData('text/plain')).toEqual('\n0\nfalse\n\n');
      expect(copyEvent.clipboardData.getData('text/html')).toEqual(['<table><tbody><tr><td></td></tr><tr><td>0</td></tr><tr><td>false</td></tr>', '<tr><td></td></tr><tr><td></td></tr></tbody></table>'].join(''));
    });
  });
  describe('cut', function () {
    xit('should be possible to cut data by keyboard shortcut', function () {// simulated keyboard shortcuts doesn't run the true events
    });
    xit('should be possible to cut data by contextMenu option', function () {// simulated mouse events doesn't run the true browser event
    });
    it('should be possible to cut data by API', function () {
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2)
      });
      var cutEvent = getClipboardEvent('cut');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(1, 0);
      plugin.onCut(cutEvent);
      expect(cutEvent.clipboardData.getData('text/plain')).toBe('A2');
      expect(cutEvent.clipboardData.getData('text/html')).toEqual('<table><tbody><tr><td>A2</td></tr></tbody></table>');
      expect(hot.getDataAtCell(1, 0)).toBe('');
    });
    it('should call beforeCut and afterCut during cutting out operation', function () {
      var beforeCutSpy = jasmine.createSpy('beforeCut');
      var afterCutSpy = jasmine.createSpy('afterCut');
      var hot = handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforeCut: beforeCutSpy,
        afterCut: afterCutSpy
      });
      var cutEvent = getClipboardEvent('cut');
      var plugin = hot.getPlugin('CopyPaste');
      selectCell(0, 0);
      plugin.onCut(cutEvent);
      expect(beforeCutSpy.calls.count()).toEqual(1);
      expect(beforeCutSpy).toHaveBeenCalledWith([['A1']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
      expect(afterCutSpy.calls.count()).toEqual(1);
      expect(afterCutSpy).toHaveBeenCalledWith([['A1']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
    });
  });
  describe('paste', function () {
    it('should not create new rows or columns when allowInsertRow and allowInsertColumn equal false',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down'
        },
        allowInsertRow: false,
        allowInsertColumn: false
      });
      selectCell(3, 4); // selectAll

      triggerPaste('Kia\tNissan\tToyota');
      yield sleep(60);
      var expected = arrayOfArrays();
      expected[3][4] = 'Kia';
      expect(getData()).toEqual(expected);
    }));
    it('should shift data down instead of overwrite when paste (when allowInsertRow = false)',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down'
        },
        allowInsertRow: false
      });
      selectCell(1, 0); // selectAll

      triggerPaste('Kia\tNissan\tToyota');
      yield sleep(60);
      expect(getData().length).toEqual(4);
      expect(getData(0, 0, 2, 4)).toEqual([['', 'Kia', 'Nissan', 'Toyota', 'Honda'], ['Kia', 'Nissan', 'Toyota', 12, 13], ['2008', 10, 11, 14, 13]]);
    }));
    it('should shift data down instead of overwrite when paste (minSpareRows > 0)',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_down'
        },
        minSpareRows: 1
      });
      selectCell(1, 0); // selectAll

      triggerPaste('Kia\tNissan\tToyota');
      yield sleep(60);
      expect(getData().length).toEqual(6);
      expect(getData(0, 0, 2, 4)).toEqual([['', 'Kia', 'Nissan', 'Toyota', 'Honda'], ['Kia', 'Nissan', 'Toyota', 12, 13], ['2008', 10, 11, 14, 13]]);
    }));
    it('should shift right insert instead of overwrite when paste',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_right'
        },
        allowInsertColumn: false
      });
      selectCell(1, 0); // selectAll

      triggerPaste('Kia\tNissan\tToyota');
      yield sleep(60);
      expect(getData()[0].length).toEqual(5);
      expect(getDataAtRow(1)).toEqual(['Kia', 'Nissan', 'Toyota', '2008', 10]);
    }));
    it('should shift right insert instead of overwrite when paste (minSpareCols > 0)', function (done) {
      handsontable({
        data: arrayOfArrays(),
        copyPaste: {
          pasteMode: 'shift_right'
        },
        minSpareCols: 1
      });
      selectCell(1, 0); // selectAll

      triggerPaste('Kia\tNissan\tToyota');
      setTimeout(function () {
        expect(getData()[0].length).toEqual(9);
        expect(getDataAtRow(1)).toEqual(['Kia', 'Nissan', 'Toyota', '2008', 10, 11, 12, 13, null]);
        done();
      }, 60);
    });
    it('should not throw an error when changes are null in `once` hook',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var errors = 0;

      try {
        handsontable({
          data: arrayOfArrays(),
          afterChange: function afterChange(changes, source) {
            if (source === 'loadData') {
              return;
            }

            loadData(arrayOfArrays());
          }
        });
        selectCell(1, 0); // selectAll

        triggerPaste('Kia\tNissan\tToyota');
      } catch (e) {
        errors += 1;
      }

      yield sleep(60);
      expect(errors).toEqual(0);
    }));
    it('should not paste any data, if no cell is selected', function (done) {
      var copiedData1 = 'foo';
      var copiedData2 = 'bar';
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(3, 1)
      });
      expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
      expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
      expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
      expect(getSelected()).toBeUndefined();
      triggerPaste(copiedData1);
      setTimeout(function () {
        expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
        expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
        expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
      }, 100);
      setTimeout(function () {
        selectCell(1, 0, 2, 0);
        triggerPaste(copiedData2);
      }, 200);
      setTimeout(function () {
        expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
        expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual(copiedData2);
        expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual(copiedData2);
        done();
      }, 300);
    });
    it('should not paste any data, if no cell is selected (select/deselect cell using mouse)',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var copiedData = 'foo';
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(3, 1)
      });
      expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
      expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
      expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
      spec().$container.find('tbody tr:eq(1) td:eq(0)').simulate('mousedown');
      spec().$container.find('tbody tr:eq(1) td:eq(0)').simulate('mouseup');
      expect(getSelected()).toEqual([[1, 0, 1, 0]]);
      $('html').simulate('mousedown').simulate('mouseup');
      expect(getSelected()).toBeUndefined();
      triggerPaste(copiedData);
      yield sleep(100);
      expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('A1');
      expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
      expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('A3');
    }));
    it('should call beforePaste and afterPaste during pasting operation',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var beforePasteSpy = jasmine.createSpy('beforePaste');
      var afterPasteSpy = jasmine.createSpy('afterPaste');
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforePaste: beforePasteSpy,
        afterPaste: afterPasteSpy
      });
      selectCell(0, 0);
      keyDown('ctrl');
      triggerPaste('Kia');
      yield sleep(60);
      expect(beforePasteSpy.calls.count()).toEqual(1);
      expect(beforePasteSpy).toHaveBeenCalledWith([['Kia']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
      expect(afterPasteSpy.calls.count()).toEqual(1);
      expect(afterPasteSpy).toHaveBeenCalledWith([['Kia']], [{
        startRow: 0,
        startCol: 0,
        endRow: 0,
        endCol: 0
      }], void 0, void 0, void 0, void 0);
    }));
    it('should be possible to block pasting',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      var afterPasteSpy = jasmine.createSpy('afterPaste');
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforePaste: function beforePaste() {
          return false;
        },
        afterPaste: afterPasteSpy
      });
      selectCell(0, 0);
      keyDown('ctrl');
      triggerPaste('Kia');
      yield sleep(60);
      expect(afterPasteSpy.calls.count()).toEqual(0);
    }));
    it('should be possible modification of changes',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        beforePaste: function beforePaste(changes) {
          changes.splice(0, 1);
        }
      });
      selectCell(0, 0);
      keyDown('ctrl');
      triggerPaste('Kia\nToyota');
      yield sleep(60);
      expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('Toyota');
      expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('A2');
    }));
    it('should be possible to paste copied data from the same instance',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: Handsontable.helper.createSpreadsheetData(5, 5)
      });
      expect(getDataAtCell(3, 1, 3, 1)).toEqual('B4');
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 1, 4);
      plugin.onCopy(copyEvent);
      selectCell(4, 1);
      plugin.onPaste(copyEvent);
      expect(getDataAtCell(4, 1)).toEqual('A1');
      expect(countCols()).toEqual(6);
      expect(countRows()).toEqual(6);
    }));
    it('should properly paste empty cells',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: [['A', ''], ['B', ''], ['C', ''], ['D', '']]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 1, 2, 1);
      plugin.onCopy(copyEvent);
      selectCell(2, 0);
      plugin.onPaste(copyEvent);
      expect(getDataAtCol(0)).toEqual(['A', 'B', '', '', '']);
    }));
    it('should properly paste data with special chars',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: [['{""""}', ''], ['{""""}{""""}', ''], ['{""""}{""""}{""""}', '']]
      });
      var copyEvent = getClipboardEvent('copy');
      var plugin = getPlugin('CopyPaste');
      selectCell(0, 0, 2, 0);
      plugin.onCopy(copyEvent);
      selectCell(0, 1);
      plugin.onPaste(copyEvent);
      expect(getDataAtCol(1)).toEqual(['{""""}', '{""""}{""""}', '{""""}{""""}{""""}']);
    }));
    it('should properly parse newline in text/plain on Windows', function () {
      var afterChangeSpy = jasmine.createSpy('afterChange');
      handsontable({
        afterChange: afterChangeSpy
      });
      selectCell(0, 0);
      triggerPaste('Kia\r\nNissan\r\nToyota');
      expect(afterChangeSpy).toHaveBeenCalledWith([[0, 0, null, 'Kia'], [1, 0, null, 'Nissan'], [2, 0, null, 'Toyota']], 'CopyPaste.paste', void 0, void 0, void 0, void 0);
    });
  });
});