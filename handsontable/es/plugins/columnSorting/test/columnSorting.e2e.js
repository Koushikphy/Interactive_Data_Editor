function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

describe('ColumnSorting', function () {
  var id = 'testContainer';
  beforeEach(function () {
    var _this = this;

    this.$container = $("<div id=\"".concat(id, "\" style=\"overflow: auto; width: 300px; height: 200px;\"></div>")).appendTo('body');

    this.sortByClickOnColumnHeader = function (columnIndex) {
      var hot = _this.$container.data('handsontable');

      var $columnHeader = $(hot.view.wt.wtTable.getColumnHeader(columnIndex));
      var $spanInsideHeader = $columnHeader.find('.columnSorting');

      if ($spanInsideHeader.length === 0) {
        throw Error('Please check the test scenario. The header doesn\'t exist.');
      }

      $spanInsideHeader.simulate('mousedown');
      $spanInsideHeader.simulate('mouseup');
      $spanInsideHeader.simulate('click');
    };
  });
  afterEach(function () {
    if (this.$container) {
      destroy();
      this.$container.remove();
    }
  });

  var arrayOfObjects = function arrayOfObjects() {
    return [{
      id: 1,
      name: 'Ted',
      lastName: 'Right'
    }, {
      id: 2,
      name: 'Frank',
      lastName: 'Honest'
    }, {
      id: 3,
      name: 'Joan',
      lastName: 'Well'
    }, {
      id: 4,
      name: 'Sid',
      lastName: 'Strong'
    }, {
      id: 5,
      name: 'Jane',
      lastName: 'Neat'
    }, {
      id: 6,
      name: 'Chuck',
      lastName: 'Jackson'
    }, {
      id: 7,
      name: 'Meg',
      lastName: 'Jansen'
    }, {
      id: 8,
      name: 'Rob',
      lastName: 'Norris'
    }, {
      id: 9,
      name: 'Sean',
      lastName: 'O\'Hara'
    }, {
      id: 10,
      name: 'Eve',
      lastName: 'Branson'
    }];
  };

  var arrayOfArrays = function arrayOfArrays() {
    return [['Mary', 'Brown', '01/14/2017', 6999.95, 'aa'], ['Henry', 'Jones', '12/01/2018', 8330, 'aaa'], ['Ann', 'Evans', '07/24/2021', 30500, null], ['Robert', 'Evans', '07/24/2019', 12464, 'abaa'], ['Ann', 'Williams', '01/14/2017', 33.9, 'aab'], ['David', 'Taylor', '02/02/2020', 7000, 'bbbb'], ['John', 'Brown', '07/24/2020', 2984, null], ['Mary', 'Brown', '01/14/2017', 4000, ''], ['Robert', 'Evans', '07/24/2020', 30500, undefined]];
  };

  it('should sort table by first visible column', function () {
    handsontable({
      data: [[1, 9, 3, 4, 5, 6, 7, 8, 9], [9, 8, 7, 6, 5, 4, 3, 2, 1], [8, 7, 6, 5, 4, 3, 3, 1, 9], [0, 3, 0, 5, 6, 7, 8, 9, 1]],
      colHeaders: true,
      columnSorting: true
    });
    var htCore = getHtCore();
    spec().sortByClickOnColumnHeader(0);
    expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('3');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual('0');
    expect(htCore.find('tbody tr:eq(0) td:eq(3)').text()).toEqual('5');
  });
  it('should not change row indexes in the sorted table after using `disablePlugin` until next render is called', function () {
    handsontable({
      data: [[1, 9, 3, 4, 5, 6, 7, 8, 9], [9, 8, 7, 6, 5, 4, 3, 2, 1], [8, 7, 6, 5, 4, 3, 3, 1, 9], [0, 3, 0, 5, 6, 7, 8, 9, 1]],
      colHeaders: true,
      columnSorting: true
    });
    var htCore = getHtCore();
    spec().sortByClickOnColumnHeader(0);
    getPlugin('columnSorting').disablePlugin();
    expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('3');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual('0');
    expect(htCore.find('tbody tr:eq(0) td:eq(3)').text()).toEqual('5');
    render();
    expect(htCore.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
    expect(htCore.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('9');
    expect(htCore.find('tbody tr:eq(0) td:eq(2)').text()).toEqual('3');
    expect(htCore.find('tbody tr:eq(0) td:eq(3)').text()).toEqual('4');
  });
  it('should clear the sort performed on the table by the `clearSort` method', function () {
    handsontable({
      data: arrayOfArrays(),
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    getPlugin('columnSorting').clearSort();
    expect(getData()).toEqual(arrayOfArrays());
  });
  it('should return sorting state with visual column index under `column` key by the `getSortConfig` method', function () {
    var predefinedSortQueue = [{
      column: 0,
      sortOrder: 'asc'
    }];

    var modification = function modification(column) {
      if (column === 0) {
        return 1;
      } else if (column === 1) {
        return 0;
      }

      return column;
    };

    handsontable({
      data: arrayOfArrays(),
      columns: [{}, {}, {
        type: 'date',
        dateFormat: 'MM/DD/YYYY'
      }, {
        type: 'numeric'
      }, {}],
      columnSorting: {
        initialConfig: predefinedSortQueue
      }
    });
    expect(getPlugin('columnSorting').getSortConfig()).toEqual(predefinedSortQueue);
    expect(getPlugin('columnSorting').getSortConfig(0)).toEqual({
      column: 0,
      sortOrder: 'asc'
    }); // changing column sequence: 0 <-> 1

    updateSettings({
      modifyCol: modification,
      unmodifyCol: modification
    });
    expect(getPlugin('columnSorting').getSortConfig()).toEqual([{
      column: 1,
      sortOrder: 'asc'
    }]);
    expect(getPlugin('columnSorting').getSortConfig(1)).toEqual({
      column: 1,
      sortOrder: 'asc'
    });
  });
  it('should set properly sort config by the `setSortConfig` method', function () {
    var sortQueue = [{
      column: 0,
      sortOrder: 'asc'
    }];

    var modification = function modification(column) {
      if (column === 0) {
        return 1;
      } else if (column === 1) {
        return 0;
      }

      return column;
    };

    handsontable({
      data: arrayOfArrays(),
      columns: [{}, {}, {
        type: 'date',
        dateFormat: 'MM/DD/YYYY'
      }, {
        type: 'numeric'
      }, {}],
      columnSorting: true
    });
    getPlugin('columnSorting').setSortConfig(sortQueue);
    expect(getPlugin('columnSorting').getSortConfig()).toEqual(sortQueue);
    expect(getPlugin('columnSorting').getSortConfig(0)).toEqual({
      column: 0,
      sortOrder: 'asc'
    }); // changing column sequence: 0 <-> 1

    updateSettings({
      modifyCol: modification,
      unmodifyCol: modification
    });
    expect(getPlugin('columnSorting').getSortConfig()).toEqual([{
      column: 1,
      sortOrder: 'asc'
    }]);
    expect(getPlugin('columnSorting').getSortConfig(1)).toEqual({
      column: 1,
      sortOrder: 'asc'
    });
  });
  it('should display indicator properly after changing sorted column sequence', function () {
    var modification = function modification(column) {
      if (column === 0) {
        return 1;
      } else if (column === 1) {
        return 0;
      }

      return column;
    };

    handsontable({
      data: [[1, 9, 3, 4, 5, 6, 7, 8, 9], [9, 8, 7, 6, 5, 4, 3, 2, 1], [8, 7, 6, 5, 4, 3, 3, 1, 9], [0, 3, 0, 5, 6, 7, 8, 9, 1]],
      colHeaders: true,
      columnSorting: {
        indicator: true
      }
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    }); // changing column sequence: 0 <-> 1

    updateSettings({
      modifyCol: modification,
      unmodifyCol: modification
    });
    var sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
  });
  it('should clear indicator after disabling plugin', function () {
    handsontable({
      data: arrayOfObjects(),
      colHeaders: true,
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        },
        indicator: true
      }
    });
    updateSettings({
      columnSorting: false
    });
    var sortedColumn = spec().$container.find('th span')[0];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).not.toMatch(/url/);
  });
  it('should render a correct number of TD elements after sorting',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    handsontable({
      data: [['1\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n\n'], ['2']],
      height: 100,
      colHeaders: true,
      columnSorting: true
    });
    var htCore = getHtCore();
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'desc'
    });
    yield sleep(300);
    expect(htCore.find('td').length).toEqual(2);
  }));
  it('should apply stable sort function #3606', function () {
    handsontable({
      data: [['mercedes1', 'Mercedes', 'A 160', '01/14/2007'], ['citroen1', 'Citroen', 'C4 Coupe', '12/01/2007'], ['opel1', 'Opel', 'Astra', '02/02/2006'], ['bmw1', 'BMW', '320i Coupe', '07/24/2009'], ['citroen2', 'Citroen', 'C4 Coupe', '12/01/2012'], ['opel2', 'Opel', 'Astra', '02/02/2004'], ['mercedes2', 'Mercedes', 'A 160', '01/14/2008'], ['citroen3', 'Citroen', 'C4 Coupe', '12/01/2007'], ['mercedes3', 'Mercedes', 'A 160', '01/14/2009'], ['opel3', 'Opel', 'Astra', '02/02/2006'], ['bmw2', 'BMW', '320i Coupe', '07/24/2013'], ['bmw3', 'BMW', '320i Coupe', '07/24/2012']],
      columns: [{}, {}, {
        type: 'date',
        dateFormat: 'mm/dd/yy'
      }, {
        type: 'numeric'
      }],
      columnSorting: true
    });
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'asc'
    }); // ASC

    expect(getDataAtCol(0)).toEqual(['bmw1', 'bmw2', 'bmw3', 'citroen1', 'citroen2', 'citroen3', 'mercedes1', 'mercedes2', 'mercedes3', 'opel1', 'opel2', 'opel3']);
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'desc'
    }); // DESC

    expect(getDataAtCol(0)).toEqual(['opel1', 'opel2', 'opel3', 'mercedes1', 'mercedes2', 'mercedes3', 'citroen1', 'citroen2', 'citroen3', 'bmw1', 'bmw2', 'bmw3']);
  });
  it('should not throw an exception when clicked on the top-left corner',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    var onErrorSpy = spyOn(window, 'onerror');
    handsontable({
      colHeaders: true,
      rowHeaders: true,
      data: arrayOfObjects(),
      columnSorting: true
    });
    $('.ht_clone_top_left_corner .htCore span').simulate('mousedown');
    $('.ht_clone_top_left_corner .htCore span').simulate('click');
    $('.ht_clone_top_left_corner .htCore span').simulate('mouseup');
    expect(onErrorSpy).not.toHaveBeenCalled();
  }));
  it('should not throw error when trying run handsontable with columnSorting and autoRowSize in the same time.', function () {
    var errors = 0;

    try {
      handsontable({
        data: arrayOfObjects(),
        autoRowSize: true,
        columnSorting: true
      });
    } catch (e) {
      errors += 1;
    }

    expect(errors).toBe(0);
  });
  it('should sort numbers descending after 2 clicks on table header', function () {
    handsontable({
      data: arrayOfObjects(),
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    spec().sortByClickOnColumnHeader(0);
    expect(spec().$container.find('tr td').first().html()).toEqual('10');
  });
  it('should place empty strings, null and undefined values at proper position (stability of default comparing function)', function () {
    handsontable({
      data: [[null, 'Ted Right'], [undefined, 'Jane Neat'], [null, 'Meg Jansen'], ['', 'Sean Hara'], ['', 'Eve Branson'], [6, 'Frank Honest'], [7, 'Joan Well'], [8, 'Sid Strong'], [9, 'Chuck Jackson'], [10, 'Rob Norris'], [11, 'Eve Well']],
      columnSorting: true
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    }); // ASC

    expect(getDataAtCol(1)).toEqual(['Frank Honest', 'Joan Well', 'Sid Strong', 'Chuck Jackson', 'Rob Norris', 'Eve Well', // empty cells below
    'Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson']);
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'desc'
    }); // DESC

    expect(getDataAtCol(1)).toEqual(['Eve Well', 'Rob Norris', 'Chuck Jackson', 'Sid Strong', 'Joan Well', 'Frank Honest', // empty cells below
    'Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson']);
  });
  it('should place empty strings, null and undefined values at proper position when `sortEmptyCells` option is enabled ' + '(API call, data type: default)', function () {
    handsontable({
      data: [[6, 'Frank Honest'], [null, 'Ted Right'], [7, 'Joan Well'], [8, 'Sid Strong'], [undefined, 'Jane Neat'], [9, 'Chuck Jackson'], [null, 'Meg Jansen'], [10, 'Rob Norris'], ['', 'Sean Hara'], ['', 'Eve Branson']],
      columnSorting: {
        sortEmptyCells: true
      }
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    }); // ASC

    expect(getDataAtCol(1)).toEqual(['Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson', // empty cells above
    'Frank Honest', 'Joan Well', 'Sid Strong', 'Chuck Jackson', 'Rob Norris']);
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'desc'
    }); // DESC

    expect(getDataAtCol(1)).toEqual(['Rob Norris', 'Chuck Jackson', 'Sid Strong', 'Joan Well', 'Frank Honest', // empty cells below
    'Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson']);
  });
  it('should place empty strings, null and undefined values at proper position when `sortEmptyCells` ' + 'option is enabled and `column` property of `columnSorting` option is set (data type: default)', function () {
    handsontable({
      data: [[6, 'Frank Honest'], [null, 'Ted Right'], [7, 'Joan Well'], [8, 'Sid Strong'], [undefined, 'Jane Neat'], [9, 'Chuck Jackson'], [null, 'Meg Jansen'], [10, 'Rob Norris'], ['', 'Sean Hara'], ['', 'Eve Branson']],
      columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    }); // ASC

    expect(getDataAtCol(1)).toEqual(['Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson', // empty cells above
    'Frank Honest', 'Joan Well', 'Sid Strong', 'Chuck Jackson', 'Rob Norris']);

    if (spec().$container) {
      destroy();
      spec().$container.remove();
    }

    handsontable({
      data: [[6, 'Frank Honest'], [null, 'Ted Right'], [7, 'Joan Well'], [8, 'Sid Strong'], [undefined, 'Jane Neat'], [9, 'Chuck Jackson'], [null, 'Meg Jansen'], [10, 'Rob Norris'], ['', 'Sean Hara'], ['', 'Eve Branson']],
      columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
          column: 0,
          sortOrder: 'desc'
        }
      }
    }); // DESC

    expect(getDataAtCol(1)).toEqual(['Rob Norris', 'Chuck Jackson', 'Sid Strong', 'Joan Well', 'Frank Honest', // empty cells below
    'Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson']);
  });
  it('should place empty strings, null and undefined values at proper position when `sortEmptyCells` ' + 'option is enabled and `column` property of `columnSorting` option is set (data type: numeric)', function () {
    handsontable({
      data: [[6, 'Frank Honest'], [null, 'Ted Right'], [7, 'Joan Well'], [8, 'Sid Strong'], [undefined, 'Jane Neat'], [9, 'Chuck Jackson'], [null, 'Meg Jansen'], [10, 'Rob Norris'], ['', 'Sean Hara'], ['', 'Eve Branson']],
      columns: [{
        type: 'numeric'
      }, {}],
      columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    }); // ASC

    expect(getDataAtCol(1)).toEqual(['Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson', // empty cells above
    'Frank Honest', 'Joan Well', 'Sid Strong', 'Chuck Jackson', 'Rob Norris']);

    if (spec().$container) {
      destroy();
      spec().$container.remove();
    }

    handsontable({
      data: [[6, 'Frank Honest'], [null, 'Ted Right'], [7, 'Joan Well'], [8, 'Sid Strong'], [undefined, 'Jane Neat'], [9, 'Chuck Jackson'], [null, 'Meg Jansen'], [10, 'Rob Norris'], ['', 'Sean Hara'], ['', 'Eve Branson']],
      columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
          column: 0,
          sortOrder: 'desc'
        }
      }
    }); // DESC

    expect(getDataAtCol(1)).toEqual(['Rob Norris', 'Chuck Jackson', 'Sid Strong', 'Joan Well', 'Frank Honest', // empty cells below
    'Ted Right', 'Jane Neat', 'Meg Jansen', 'Sean Hara', 'Eve Branson']);
  });
  it('should clear and generate a new column meta cache after calling `updateSettings` with a new set of data',
  /*#__PURE__*/
  _asyncToGenerator(function* () {
    handsontable({
      data: [['test']],
      columnSorting: true,
      colHeaders: true
    });
    var plugin = getPlugin('columnSorting');
    expect(plugin.columnMetaCache.size).toEqual(1);
    updateSettings({
      data: [['first columns', 'second column', 'third column']]
    });
    expect(plugin.columnMetaCache.size).toEqual(3);
  }));
  describe('isSorted', function () {
    it('should return `false` when plugin is disabled', function () {
      handsontable();
      expect(getPlugin('columnSorting').isSorted()).toBeFalsy();
    });
    it('should return `false` when plugin has been disabled by the `disablePlugin` method', function () {
      handsontable({
        columnSorting: {
          initialConfig: {
            column: 1,
            sortOrder: 'asc'
          }
        }
      });
      getPlugin('columnSorting').disablePlugin();
      expect(getPlugin('columnSorting').isSorted()).toBeFalsy();
    });
    it('should return `false` when plugin is enabled and the table was not sorted #1', function () {
      handsontable({
        columnSorting: true
      });
      expect(getPlugin('columnSorting').isSorted()).toBeFalsy();
    });
    it('should return `false` when plugin is enabled and the table was not sorted #2', function () {
      handsontable({
        data: [['Citroen1', 'C4 Coupe', null], ['Mercedes1', 'A 160', '12/01/2008'], ['Mercedes2', 'A 160', '01/14/2006']],
        columnSorting: {
          indicator: true
        }
      });
      expect(getPlugin('columnSorting').isSorted()).toBeFalsy();
    });
    it('should return `true` when plugin is enabled and the table was sorted', function () {
      handsontable({
        data: [['Citroen1', 'C4 Coupe', null], ['Mercedes1', 'A 160', '12/01/2008'], ['Mercedes2', 'A 160', '01/14/2006']],
        columnSorting: {
          initialConfig: {
            column: 1,
            sortOrder: 'asc'
          }
        }
      });
      expect(getPlugin('columnSorting').isSorted()).toBeTruthy();
    });
    it('should be handled properly when using the `updateSettings`', function () {
      handsontable({
        data: [['Citroen1', 'C4 Coupe', null], ['Mercedes1', 'A 160', '12/01/2008'], ['Mercedes2', 'A 160', '01/14/2006']],
        columnSorting: {
          initialConfig: {
            column: 1,
            sortOrder: 'asc'
          }
        }
      });
      updateSettings({
        columnSorting: true
      });
      expect(getPlugin('columnSorting').isSorted()).toBeTruthy();
      updateSettings({
        columnSorting: {
          initialConfig: {
            column: 1,
            sortOrder: 'desc'
          }
        }
      });
      expect(getPlugin('columnSorting').isSorted()).toBeTruthy();
      updateSettings({
        columnSorting: false
      });
      expect(getPlugin('columnSorting').isSorted()).toBeFalsy();
    });
  });
  describe('data type: date', function () {
    it('should place empty strings, null and undefined values at proper position when `sortEmptyCells` ' + 'option is enabled and `column` property of `columnSorting` option is set', function () {
      handsontable({
        data: [['Citroen1', 'C4 Coupe', null], ['Mercedes1', 'A 160', '12/01/2008'], ['Mercedes2', 'A 160', '01/14/2006'], ['Citroen2', 'C4 Coupe', undefined], ['Audi1', 'A4 Avant', '11/19/2011'], ['Opel1', 'Astra', '02/02/2004'], ['Citroen3', 'C4 Coupe', null], ['BMW1', '320i Coupe', '07/24/2011'], ['Citroen4', 'C4 Coupe', ''], ['Citroen5', 'C4 Coupe', '']],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }],
        columnSorting: {
          sortEmptyCells: true,
          initialConfig: {
            column: 2,
            sortOrder: 'asc'
          }
        }
      }); // ASC

      expect(getDataAtCol(0)).toEqual(['Citroen1', 'Citroen2', 'Citroen3', 'Citroen4', 'Citroen5', // empty cells above
      'Opel1', 'Mercedes2', 'Mercedes1', 'BMW1', 'Audi1']);

      if (spec().$container) {
        destroy();
        spec().$container.remove();
      }

      handsontable({
        data: [['Citroen1', 'C4 Coupe', null], ['Mercedes1', 'A 160', '12/01/2008'], ['Mercedes2', 'A 160', '01/14/2006'], ['Citroen2', 'C4 Coupe', undefined], ['Audi1', 'A4 Avant', '11/19/2011'], ['Opel1', 'Astra', '02/02/2004'], ['Citroen3', 'C4 Coupe', null], ['BMW1', '320i Coupe', '07/24/2011'], ['Citroen4', 'C4 Coupe', ''], ['Citroen5', 'C4 Coupe', '']],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }],
        columnSorting: {
          sortEmptyCells: true,
          initialConfig: {
            column: 2,
            sortOrder: 'desc'
          }
        }
      }); // DESC

      expect(getDataAtCol(0)).toEqual(['Audi1', 'BMW1', 'Mercedes1', 'Mercedes2', 'Opel1', // empty cells below
      'Citroen1', 'Citroen2', 'Citroen3', 'Citroen4', 'Citroen5']);
    });
    it('should sort date columns (MM/DD/YYYY)', function () {
      handsontable({
        data: [['Mercedes', 'A 160', '01/14/2006', 6999.9999], ['Citroen', 'C4 Coupe', '12/01/2008', 8330], ['Audi', 'A4 Avant', '11/19/2011', 33900], ['Opel', 'Astra', '02/02/2004', 7000], ['BMW', '320i Coupe', '07/24/2011', 30500]],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }, {
          type: 'numeric'
        }],
        colHeaders: true,
        columnSorting: true
      });
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'asc'
      }); // ASC

      expect(getDataAtRow(0)).toEqual(['Opel', 'Astra', '02/02/2004', 7000]);
      expect(getDataAtRow(1)).toEqual(['Mercedes', 'A 160', '01/14/2006', 6999.9999]);
      expect(getDataAtRow(2)).toEqual(['Citroen', 'C4 Coupe', '12/01/2008', 8330]);
      expect(getDataAtRow(3)).toEqual(['BMW', '320i Coupe', '07/24/2011', 30500]);
      expect(getDataAtRow(4)).toEqual(['Audi', 'A4 Avant', '11/19/2011', 33900]);
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'desc'
      }); // DESC

      expect(getDataAtRow(0)).toEqual(['Audi', 'A4 Avant', '11/19/2011', 33900]);
      expect(getDataAtRow(1)).toEqual(['BMW', '320i Coupe', '07/24/2011', 30500]);
      expect(getDataAtRow(2)).toEqual(['Citroen', 'C4 Coupe', '12/01/2008', 8330]);
      expect(getDataAtRow(3)).toEqual(['Mercedes', 'A 160', '01/14/2006', 6999.9999]);
      expect(getDataAtRow(4)).toEqual(['Opel', 'Astra', '02/02/2004', 7000]);
    });
    it('should sort date columns (DD/MM/YYYY)', function () {
      handsontable({
        data: [['Mercedes', 'A 160', '01/12/2012', 6999.9999], ['Citroen', 'C4 Coupe', '12/01/2013', 8330], ['Audi', 'A4 Avant', '11/10/2014', 33900], ['Opel', 'Astra', '02/02/2015', 7000], ['BMW', '320i Coupe', '07/02/2013', 30500]],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'DD/MM/YYYY'
        }, {
          type: 'numeric'
        }],
        colHeaders: true,
        columnSorting: true
      });
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'asc'
      }); // ASC

      expect(getDataAtRow(0)).toEqual(['Mercedes', 'A 160', '01/12/2012', 6999.9999]);
      expect(getDataAtRow(1)).toEqual(['Citroen', 'C4 Coupe', '12/01/2013', 8330]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', '07/02/2013', 30500]);
      expect(getDataAtRow(3)).toEqual(['Audi', 'A4 Avant', '11/10/2014', 33900]);
      expect(getDataAtRow(4)).toEqual(['Opel', 'Astra', '02/02/2015', 7000]);
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'desc'
      }); // DESC

      expect(getDataAtRow(0)).toEqual(['Opel', 'Astra', '02/02/2015', 7000]);
      expect(getDataAtRow(1)).toEqual(['Audi', 'A4 Avant', '11/10/2014', 33900]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', '07/02/2013', 30500]);
      expect(getDataAtRow(3)).toEqual(['Citroen', 'C4 Coupe', '12/01/2013', 8330]);
      expect(getDataAtRow(4)).toEqual(['Mercedes', 'A 160', '01/12/2012', 6999.9999]);
    });
    it('should sort date columns (MMMM Do YYYY)', function () {
      handsontable({
        data: [['Mercedes', 'A 160', 'October 28th 2016', 6999.9999], ['Citroen', 'C4 Coupe', 'October 27th 2001', 8330], ['Audi', 'A4 Avant', 'July 8th 1999', 33900], ['Opel', 'Astra', 'June 1st 2001', 7000], ['BMW', '320i Coupe', 'August 3rd 2001', 30500]],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'MMMM Do YYYY'
        }, {
          type: 'numeric'
        }],
        colHeaders: true,
        columnSorting: true
      });
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'asc'
      }); // ASC

      expect(getDataAtRow(0)).toEqual(['Audi', 'A4 Avant', 'July 8th 1999', 33900]);
      expect(getDataAtRow(1)).toEqual(['Opel', 'Astra', 'June 1st 2001', 7000]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', 'August 3rd 2001', 30500]);
      expect(getDataAtRow(3)).toEqual(['Citroen', 'C4 Coupe', 'October 27th 2001', 8330]);
      expect(getDataAtRow(4)).toEqual(['Mercedes', 'A 160', 'October 28th 2016', 6999.9999]);
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'desc'
      }); // DESC

      expect(getDataAtRow(0)).toEqual(['Mercedes', 'A 160', 'October 28th 2016', 6999.9999]);
      expect(getDataAtRow(1)).toEqual(['Citroen', 'C4 Coupe', 'October 27th 2001', 8330]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', 'August 3rd 2001', 30500]);
      expect(getDataAtRow(3)).toEqual(['Opel', 'Astra', 'June 1st 2001', 7000]);
      expect(getDataAtRow(4)).toEqual(['Audi', 'A4 Avant', 'July 8th 1999', 33900]);
    });
    it('should sort date columns along with empty and null values', function () {
      handsontable({
        data: [['Mercedes', 'A 160', '01/14/2006', 6999.9999], ['Citroen', 'C4 Coupe', '12/01/2008', 8330], ['Citroen', 'C4 Coupe null', null, 8330], ['Citroen', 'C4 Coupe empty', '', 8330], ['Audi', 'A4 Avant', '11/19/2011', 33900], ['Opel', 'Astra', '02/02/2004', 7000], ['BMW', '320i Coupe', '07/24/2011', 30500]],
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'mm/dd/yy'
        }, {
          type: 'numeric'
        }],
        colHeaders: true,
        columnSorting: true
      });
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'asc'
      }); // ASC

      expect(getDataAtRow(0)).toEqual(['Mercedes', 'A 160', '01/14/2006', 6999.9999]);
      expect(getDataAtRow(1)).toEqual(['Opel', 'Astra', '02/02/2004', 7000]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', '07/24/2011', 30500]);
      expect(getDataAtRow(3)).toEqual(['Audi', 'A4 Avant', '11/19/2011', 33900]);
      expect(getDataAtRow(4)).toEqual(['Citroen', 'C4 Coupe', '12/01/2008', 8330]);
      getPlugin('columnSorting').sort({
        column: 2,
        sortOrder: 'desc'
      }); // DESC

      expect(getDataAtRow(0)).toEqual(['Citroen', 'C4 Coupe', '12/01/2008', 8330]);
      expect(getDataAtRow(1)).toEqual(['Audi', 'A4 Avant', '11/19/2011', 33900]);
      expect(getDataAtRow(2)).toEqual(['BMW', '320i Coupe', '07/24/2011', 30500]);
      expect(getDataAtRow(3)).toEqual(['Opel', 'Astra', '02/02/2004', 7000]);
      expect(getDataAtRow(4)).toEqual(['Mercedes', 'A 160', '01/14/2006', 6999.9999]);
    });
  });
  describe('data type: time', function () {
    it('should properly rewrite time into correct format after sort',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        data: [['0:00:01 am'], ['5:30:14 pm'], ['8:00:00 pm'], ['11:15:05 am'], ['4:07:48 am']],
        columns: [{
          type: 'time',
          dateFormat: 'h:mm:ss a',
          correctFormat: true
        }],
        colHeaders: true,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      yield sleep(100);
      setDataAtCell(0, 0, '19:55', 'edit');
      yield sleep(100);
      expect(getDataAtCell(0, 0)).toEqual('7:55:00 pm');
    }));
  });
  it('should properly sort numeric data', function () {
    handsontable({
      data: [['Mercedes', 'A 160', '01/14/2006', '6999.9999'], ['Citroen', 'C4 Coupe', '12/01/2008', 8330], ['Citroen', 'C4 Coupe null', null, '8330'], ['Citroen', 'C4 Coupe empty', '', 8333], ['Audi', 'A4 Avant', '11/19/2011', '33900'], ['Opel', 'Astra', '02/02/2004', '7000'], ['BMW', '320i Coupe', '07/24/2011', 30500]],
      columns: [{}, {}, {}, {
        type: 'numeric'
      }],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(3);
    expect(getDataAtCol(3)).toEqual(['6999.9999', '7000', 8330, '8330', 8333, 30500, '33900']);
    spec().sortByClickOnColumnHeader(3);
    expect(getDataAtCol(3)).toEqual(['33900', 30500, 8333, 8330, '8330', '7000', '6999.9999']);
    spec().sortByClickOnColumnHeader(3);
    expect(getDataAtCol(3)).toEqual(['6999.9999', 8330, '8330', 8333, '33900', '7000', 30500]);
  });
  it('should sort table with multiple row headers', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      columns: [{}, {}, {
        type: 'date',
        dateFormat: 'mm/dd/yy'
      }, {
        type: 'numeric'
      }],
      colHeaders: true,
      columnSorting: true
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
    spec().sortByClickOnColumnHeader(0); // sort by first column

    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(spec().$container.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('D');
    spec().sortByClickOnColumnHeader(1); // sort by second column

    expect(spec().$container.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('A');
  });
  it('should allow to define sorting column and order during initialization', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      colHeaders: true,
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(spec().$container.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('D');
  });
  it('should allow to change sorting column with updateSettings', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      colHeaders: true,
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(spec().$container.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('D');
    updateSettings({
      columnSorting: {
        initialConfig: {
          column: 1,
          sortOrder: 'asc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('3');
    expect(spec().$container.find('tbody tr:eq(0) td:eq(1)').text()).toEqual('A');
  });
  it('should allow to change sort order with updateSettings', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      colHeaders: true,
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    updateSettings({
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'desc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('3');
  });
  it('should allow to change if sorting empty cells with updateSettings', function () {
    handsontable({
      data: [[1, 'B'], [2, ''], [3, 'A'], [4, ''], [6, 'E'], [7, ''], [8, 'F']],
      colHeaders: true,
      columnSorting: {
        sortEmptyCells: false,
        initialConfig: {
          column: 1,
          sortOrder: 'desc'
        }
      }
    });
    updateSettings({
      columnSorting: {
        sortEmptyCells: true,
        initialConfig: {
          column: 1,
          sortOrder: 'asc'
        }
      }
    }); // ASC with empty cells sorting

    expect(getDataAtCol(0)).toEqual([2, 4, 7, 3, 1, 6, 8]);
    updateSettings({
      columnSorting: {
        sortEmptyCells: false,
        initialConfig: {
          column: 1,
          sortOrder: 'asc'
        }
      }
    }); // ASC without empty cells sorting

    expect(getDataAtCol(0)).toEqual([3, 1, 6, 8, 2, 4, 7]);
  });
  it('should NOT sort spare rows', function () {
    var myData = [{
      a: 'aaa',
      b: 2,
      c: 3
    }, {
      a: 'z',
      b: 11,
      c: -4
    }, {
      a: 'dddd',
      b: 13,
      c: 13
    }, {
      a: 'bbbb',
      b: 10,
      c: 11
    }];

    function customIsEmptyRow(row) {
      var data = this.getSourceData();
      return data[row].isNew;
    }

    handsontable({
      data: myData,
      rowHeaders: true,
      colHeaders: ['A', 'B', 'C'],
      columns: [{
        data: 'a',
        type: 'text'
      }, {
        data: 'b',
        type: 'text'
      }, {
        data: 'c',
        type: 'text'
      }],
      dataSchema: {
        isNew: true,
        a: false
      },
      // default for a to avoid #bad value#
      columnSorting: true,
      minSpareRows: 3,
      isEmptyRow: customIsEmptyRow
    }); // ASC

    updateSettings({
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    expect(getData()).toEqual([['aaa', 2, 3], ['bbbb', 10, 11], ['dddd', 13, 13], ['z', 11, -4], [false, null, null], [false, null, null], [false, null, null]]);
    updateSettings({
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'desc'
        }
      }
    });
    expect(getData()).toEqual([['z', 11, -4], ['dddd', 13, 13], ['bbbb', 10, 11], ['aaa', 2, 3], [false, null, null], [false, null, null], [false, null, null]]);
  });
  it('should reset column sorting with updateSettings', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      colHeaders: true,
      columnSorting: {
        initialConfig: {
          column: 0,
          sortOrder: 'asc'
        }
      }
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    updateSettings({
      columnSorting: void 0
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
  });
  it('should sort table using plugin API method', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      columnSorting: true
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('1');
    expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('0');
    expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('3');
    expect(spec().$container.find('tbody tr:eq(3) td:eq(0)').text()).toEqual('2');
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('0');
    expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('1');
    expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('2');
    expect(spec().$container.find('tbody tr:eq(3) td:eq(0)').text()).toEqual('3');
  });
  it('should fire beforeColumnSort event before sorting data', function () {
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true
    });
    var beforeColumnSortHandler = jasmine.createSpy('beforeColumnSortHandler');
    addHook('beforeColumnSort', beforeColumnSortHandler);
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(beforeColumnSortHandler.calls.count()).toEqual(1);
    expect(beforeColumnSortHandler).toHaveBeenCalledWith([], [{
      column: 0,
      sortOrder: 'asc'
    }], true, void 0, void 0, void 0);
  });
  it('should not sorting column when beforeColumnSort returns false', function (done) {
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true,
      beforeColumnSort: function beforeColumnSort() {
        return false;
      }
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    setTimeout(function () {
      expect(spec().$container.find('tbody tr:eq(0) td:eq(0)').text()).toEqual('2');
      expect(spec().$container.find('tbody tr:eq(1) td:eq(0)').text()).toEqual('4');
      expect(spec().$container.find('tbody tr:eq(2) td:eq(0)').text()).toEqual('1');
      expect(spec().$container.find('tbody tr:eq(3) td:eq(0)').text()).toEqual('3');
      done();
    }, 200);
  });
  it('should add beforeColumnSort event listener in constructor', function () {
    var beforeColumnSortCallback = jasmine.createSpy('beforeColumnSortHandler');
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true,
      beforeColumnSort: beforeColumnSortCallback
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(beforeColumnSortCallback.calls.count()).toEqual(1);
    expect(beforeColumnSortCallback).toHaveBeenCalledWith([], [{
      column: 0,
      sortOrder: 'asc'
    }], true, void 0, void 0, void 0);
  });
  it('should fire afterColumnSort event after data has been sorted', function () {
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true
    });
    var afterColumnSortHandler = jasmine.createSpy('afterColumnSortHandler');
    addHook('afterColumnSort', afterColumnSortHandler);
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(afterColumnSortHandler.calls.count()).toBe(1);
    expect(afterColumnSortHandler).toHaveBeenCalledWith([], [{
      column: 0,
      sortOrder: 'asc'
    }], true, void 0, void 0, void 0);
  });
  it('should add afterColumnSort event listener in constructor', function () {
    var afterColumnSortCallback = jasmine.createSpy('afterColumnSortHandler');
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true,
      afterColumnSort: afterColumnSortCallback
    });
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(afterColumnSortCallback.calls.count()).toEqual(1);
    expect(afterColumnSortCallback).toHaveBeenCalledWith([], [{
      column: 0,
      sortOrder: 'asc'
    }], true, void 0, void 0, void 0);
  });
  it('should fire hooks with proper hook argument when sorting is not possible', function () {
    var beforeColumnSortCallback = jasmine.createSpy('beforeColumnSort');
    var afterColumnSortCallback = jasmine.createSpy('afterColumnSort');
    handsontable({
      data: [[2], [4], [1], [3]],
      columnSorting: true,
      beforeColumnSort: beforeColumnSortCallback,
      afterColumnSort: afterColumnSortCallback
    });
    getPlugin('columnSorting').sort({
      column: 1000,
      sortOrder: 'asc'
    });
    expect(beforeColumnSortCallback).toHaveBeenCalledWith([], [{
      column: 1000,
      sortOrder: 'asc'
    }], false, void 0, void 0, void 0); // "After" hook always run! Team decision.

    expect(afterColumnSortCallback).toHaveBeenCalledWith([], [], false, void 0, void 0, void 0);
  });
  it('should insert row when plugin is enabled, but table hasn\'t been sorted', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      columnSorting: true
    });
    expect(countRows()).toEqual(4);
    alter('insert_row');
    expect(countRows()).toEqual(5);
  });
  it('should apply sorting when there are two tables and only one has sorting enabled and has been already sorted (#1020)', function () {
    handsontable({
      data: [[1, 'B'], [0, 'D'], [3, 'A'], [2, 'C']],
      columnSorting: {
        initialConfig: {
          column: 1,
          sortOrder: 'asc'
        }
      }
    });
    spec().$container2 = $("<div id='".concat(id, "-2'></div>")).appendTo('body');
    spec().$container2.handsontable();
    selectCell(0, 1);
    keyDown('enter');
    expect($('.handsontableInput').val()).toEqual('A');
    spec().$container2.handsontable('destroy');
    spec().$container2.remove();
  });
  it('should return updated data at specyfied row after sorted', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, 'Frank', 'Honest'], [3, 'Joan', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      rowHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtRow(0)).toEqual([1, 'Ted', 'Right']);
    expect(getDataAtRow(4)).toEqual([5, 'Jane', 'Neat']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtRow(0)).toEqual([5, 'Jane', 'Neat']);
    expect(getDataAtRow(4)).toEqual([1, 'Ted', 'Right']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtRow(0)).toEqual([1, 'Ted', 'Right']);
    expect(getDataAtRow(4)).toEqual([5, 'Jane', 'Neat']);
  });
  it('should return updated data at specyfied col after sorted', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, 'Frank', 'Honest'], [3, 'Joan', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      rowHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([5, 4, 3, 2, 1]);
    expect(getDataAtCol(1)).toEqual(['Jane', 'Sid', 'Joan', 'Frank', 'Ted']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
  });
  it('should return original data source at specified row after sorted', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, 'Frank', 'Honest'], [3, 'Joan', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      rowHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtRow(0)).toEqual([1, 'Ted', 'Right']);
    expect(getDataAtRow(4)).toEqual([5, 'Jane', 'Neat']);
    expect(getSourceDataAtRow(0)).toEqual([1, 'Ted', 'Right']);
    expect(getSourceDataAtRow(4)).toEqual([5, 'Jane', 'Neat']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtRow(0)).toEqual([5, 'Jane', 'Neat']);
    expect(getDataAtRow(4)).toEqual([1, 'Ted', 'Right']);
    expect(getSourceDataAtRow(0)).toEqual([1, 'Ted', 'Right']);
    expect(getSourceDataAtRow(4)).toEqual([5, 'Jane', 'Neat']);
  });
  it('should return original data source at specified col after sorted', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, 'Frank', 'Honest'], [3, 'Joan', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      rowHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
    expect(getSourceDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getSourceDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([5, 4, 3, 2, 1]);
    expect(getDataAtCol(1)).toEqual(['Jane', 'Sid', 'Joan', 'Frank', 'Ted']);
    expect(getSourceDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getSourceDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
    expect(getSourceDataAtCol(0)).toEqual([1, 2, 3, 4, 5]);
    expect(getSourceDataAtCol(1)).toEqual(['Ted', 'Frank', 'Joan', 'Sid', 'Jane']);
  });
  it('should ignore case when sorting', function () {
    handsontable({
      data: [[1, 'albuquerque'], [2, 'Alabama'], [3, 'Missouri']],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(1);
    expect(getDataAtCol(0)).toEqual([2, 1, 3]);
    expect(getDataAtCol(1)).toEqual(['Alabama', 'albuquerque', 'Missouri']);
    spec().sortByClickOnColumnHeader(1);
    expect(getDataAtCol(0)).toEqual([3, 1, 2]);
    expect(getDataAtCol(1)).toEqual(['Missouri', 'albuquerque', 'Alabama']);
  });
  it('should push empty cells to the end of sorted column', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, '', 'Honest'], [3, '', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      rowHeaders: true,
      columnSorting: true,
      minSpareRows: 1
    });
    spec().sortByClickOnColumnHeader(1);
    expect(getDataAtCol(0)).toEqual([5, 4, 1, 2, 3, null]);
    expect(getDataAtCol(1)).toEqual(['Jane', 'Sid', 'Ted', '', '', null]);
    spec().sortByClickOnColumnHeader(1);
    expect(getDataAtCol(0)).toEqual([1, 4, 5, 2, 3, null]);
    expect(getDataAtCol(1)).toEqual(['Ted', 'Sid', 'Jane', '', '', null]);
  });
  it('should push numeric values before non-numeric values, when sorting ascending using the default sorting function', function () {
    handsontable({
      data: [[1, 'Ted', 123], [2, '', 'Some'], [3, '', 321], [4, 'Sid', 'String'], [5, 'Jane', 46]],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(2);
    expect(getDataAtCol(2)).toEqual([46, 123, 321, 'Some', 'String']);
    spec().sortByClickOnColumnHeader(2);
    expect(getDataAtCol(2)).toEqual(['String', 'Some', 321, 123, 46]);
  });
  it('should add a sorting indicator to the column header after it\'s been sorted, if indicator property is set to true (by default)', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, '', 'Honest'], [3, '', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(1);
    var sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/); // ---------------------------------
    // INDICATOR SET FOR THE WHOLE TABLE
    // ---------------------------------

    updateSettings({
      columns: function columns() {
        return {
          columnSorting: {
            indicator: true
          }
        };
      }
    });
    spec().sortByClickOnColumnHeader(1); // descending (updateSettings doesn't reset sorting stack)

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    spec().sortByClickOnColumnHeader(1);
    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).not.toMatch(/url/);
    spec().sortByClickOnColumnHeader(1); // ascending

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/); // ---------------------------------
    // INDICATOR SET FOR A SINGLE COLUMN
    // ---------------------------------

    updateSettings({
      columns: function columns(column) {
        if (column === 2) {
          return {
            columnSorting: {
              indicator: false
            }
          };
        }

        return {};
      }
    });
    spec().sortByClickOnColumnHeader(0);
    sortedColumn = spec().$container.find('th span.columnSorting')[0];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    spec().sortByClickOnColumnHeader(1); // descending

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    spec().sortByClickOnColumnHeader(2);
    sortedColumn = spec().$container.find('th span.columnSorting')[2];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).not.toMatch(/url/);
  });
  it('should change sorting indicator state on every plugin API method (calling for different columns)', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, '', 'Honest'], [3, '', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      columnSorting: {
        indicator: true
      }
    });
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'asc'
    }); // ascending

    var sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 2,
      sortOrder: 'asc'
    }); // ascending

    sortedColumn = spec().$container.find('th span.columnSorting')[2];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'asc'
    }); // ascending

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 2,
      sortOrder: 'desc'
    }); // descending

    sortedColumn = spec().$container.find('th span.columnSorting')[2];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 2,
      sortOrder: 'desc'
    }); // descending

    sortedColumn = spec().$container.find('th span.columnSorting')[2];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 2,
      sortOrder: 'asc'
    }); // ascending

    sortedColumn = spec().$container.find('th span.columnSorting')[2];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
  });
  it('should change sorting indicator state when initial column sorting was provided', function () {
    handsontable({
      data: [[1, 'Ted', 'Right'], [2, '', 'Honest'], [3, '', 'Well'], [4, 'Sid', 'Strong'], [5, 'Jane', 'Neat']],
      colHeaders: true,
      columnSorting: {
        indicator: true,
        initialConfig: {
          column: 1,
          sortOrder: 'desc'
        }
      }
    }); // descending

    var sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort(); // default

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).not.toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'asc'
    }); // ascending

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort({
      column: 1,
      sortOrder: 'desc'
    }); // descending

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).toMatch(/url/);
    getPlugin('columnSorting').sort(); // default

    sortedColumn = spec().$container.find('th span.columnSorting')[1];
    expect(window.getComputedStyle(sortedColumn, ':before').getPropertyValue('background-image')).not.toMatch(/url/);
  });
  it('should properly sort the table, when it\'s scrolled to the far right', function () {
    var data = [['Jasmine Ferguson', 'Britney Carey', 'Kelly Decker', 'Lacey Mcleod', 'Leona Shaffer', 'Kelli Ochoa', 'Adele Roberson', 'Viola Snow', 'Barron Cherry', 'Calhoun Lane', 'Elvia Andrews', 'Katheryn Dale', 'Dorthy Hale', 'Munoz Randall', 'Fields Morse', 'Hubbard Nichols', 'Chang Yang', 'Osborn Anthony', 'Owens Warner', 'Gloria Hampton'], ['Lane Hill', 'Belinda Mathews', 'York Gray', 'Celina Stone', 'Victoria Mays', 'Angelina Lott', 'Joyce Mason', 'Shawn Rodriguez', 'Susanna Mayo', 'Wolf Fuller', 'Long Hester', 'Dudley Doyle', 'Wilder Sutton', 'Oneal Avery', 'James Mclaughlin', 'Lenora Guzman', 'Mcmahon Sullivan', 'Abby Weeks', 'Beverly Joseph', 'Rosalind Church'], ['Myrtle Landry', 'Hays Huff', 'Hernandez Benjamin', 'Mclaughlin Garza', 'Franklin Barton', 'Lara Buchanan', 'Ratliff Beck', 'Rosario Munoz', 'Isabelle Dalton', 'Smith Woodard', 'Marjorie Marshall', 'Spears Stein', 'Brianna Bowman', 'Marci Clay', 'Palmer Harrell', 'Ball Levy', 'Shelley Mendoza', 'Morrow Glass', 'Baker Knox', 'Adrian Holman'], ['Trisha Howell', 'Brooke Harrison', 'Anthony Watkins', 'Ellis Cobb', 'Sheppard Dillon', 'Mathis Bray', 'Foreman Burns', 'Lina Glenn', 'Giles Pollard', 'Weiss Ballard', 'Lynnette Smith', 'Flores Kline', 'Graciela Singleton', 'Santiago Mcclure', 'Claudette Battle', 'Nita Holloway', 'Eula Wolfe', 'Pruitt Stokes', 'Felicia Briggs', 'Melba Bradshaw']];
    var hot = handsontable({
      data: data,
      colHeaders: true,
      columnSorting: true
    });
    hot.view.wt.wtOverlays.leftOverlay.scrollTo(15);
    render();
    getPlugin('columnSorting').sort({
      column: 15,
      sortOrder: 'asc'
    });
    expect(getDataAtCell(0, 15)).toEqual('Ball Levy');
    expect(getDataAtCell(1, 15)).toEqual('Hubbard Nichols');
    expect(getDataAtCell(2, 15)).toEqual('Lenora Guzman');
    expect(getDataAtCell(3, 15)).toEqual('Nita Holloway');
    getPlugin('columnSorting').sort({
      column: 15,
      sortOrder: 'desc'
    });
    expect(getDataAtCell(3, 15)).toEqual('Ball Levy');
    expect(getDataAtCell(2, 15)).toEqual('Hubbard Nichols');
    expect(getDataAtCell(1, 15)).toEqual('Lenora Guzman');
    expect(getDataAtCell(0, 15)).toEqual('Nita Holloway');
    getPlugin('columnSorting').sort();
    expect(getDataAtCell(0, 15)).toEqual('Hubbard Nichols');
    expect(getDataAtCell(1, 15)).toEqual('Lenora Guzman');
    expect(getDataAtCell(2, 15)).toEqual('Ball Levy');
    expect(getDataAtCell(3, 15)).toEqual('Nita Holloway');
  });
  it('should allow specifiyng a custom sorting function', function () {
    var data = [['1 inch'], ['1 yard'], ['2 feet'], ['0.2 miles']];

    var compareFunctionFactory = function compareFunctionFactory(sortOrder) {
      return function (value, nextValue) {
        var unitsRatios = {
          inch: 1,
          yard: 36,
          feet: 12,
          miles: 63360
        };
        Handsontable.helper.objectEach(unitsRatios, function (val, prop) {
          if (value.indexOf(prop) > -1) {
            value = parseFloat(value.replace(prop, '')) * val;
            return false;
          }
        });
        Handsontable.helper.objectEach(unitsRatios, function (val, prop) {
          if (nextValue.indexOf(prop) > -1) {
            nextValue = parseFloat(nextValue.replace(prop, '')) * val;
            return false;
          }
        });

        if (value < nextValue) {
          return sortOrder === 'asc' ? -1 : 1;
        } else if (value > nextValue) {
          return sortOrder === 'asc' ? 1 : -1;
        }

        return 0;
      };
    };

    handsontable({
      data: data,
      columns: [{
        columnSorting: {
          compareFunctionFactory: compareFunctionFactory
        }
      }],
      colHeaders: true,
      columnSorting: true
    });
    expect(getDataAtCell(0, 0)).toEqual('1 inch');
    expect(getDataAtCell(1, 0)).toEqual('1 yard');
    expect(getDataAtCell(2, 0)).toEqual('2 feet');
    expect(getDataAtCell(3, 0)).toEqual('0.2 miles');
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'asc'
    });
    expect(getDataAtCell(0, 0)).toEqual('1 inch');
    expect(getDataAtCell(1, 0)).toEqual('2 feet');
    expect(getDataAtCell(2, 0)).toEqual('1 yard');
    expect(getDataAtCell(3, 0)).toEqual('0.2 miles');
    getPlugin('columnSorting').sort({
      column: 0,
      sortOrder: 'desc'
    });
    expect(getDataAtCell(0, 0)).toEqual('0.2 miles');
    expect(getDataAtCell(1, 0)).toEqual('1 yard');
    expect(getDataAtCell(2, 0)).toEqual('2 feet');
    expect(getDataAtCell(3, 0)).toEqual('1 inch');
    getPlugin('columnSorting').sort();
    expect(getDataAtCell(0, 0)).toEqual('1 inch');
    expect(getDataAtCell(1, 0)).toEqual('1 yard');
    expect(getDataAtCell(2, 0)).toEqual('2 feet');
    expect(getDataAtCell(3, 0)).toEqual('0.2 miles');
  });
  it('should properly sort integers with nulls', function () {
    handsontable({
      data: [['12'], [null], ['10'], ['-5'], [null], ['1000']],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['-5', '10', '12', '1000', null, null]);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['1000', '12', '10', '-5', null, null]);
  });
  it('should properly sort floating points', function () {
    handsontable({
      data: [['0.0561'], ['-10.67'], ['-4.1'], ['-0.01'], ['-127'], ['1000']],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['-127', '-10.67', '-4.1', '-0.01', '0.0561', '1000']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['1000', '0.0561', '-0.01', '-4.1', '-10.67', '-127']);
  });
  it('should properly sort floating points with nulls', function () {
    handsontable({
      data: [['0.0561'], ['-10.67'], [null], ['-4.1'], ['-0.01'], [null], ['-127'], ['1000'], [null]],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['-127', '-10.67', '-4.1', '-0.01', '0.0561', '1000', null, null, null]);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['1000', '0.0561', '-0.01', '-4.1', '-10.67', '-127', null, null, null]);
  });
  it('should properly sort floating points with non-numerical values', function () {
    handsontable({
      data: [['0.0561'], ['-10.67'], ['a'], ['-4.1'], ['-0.01'], ['b'], ['-127'], ['1000'], ['hello']],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['-127', '-10.67', '-4.1', '-0.01', '0.0561', '1000', 'a', 'b', 'hello']);
    spec().sortByClickOnColumnHeader(0);
    expect(getDataAtCol(0)).toEqual(['hello', 'b', 'a', '1000', '0.0561', '-0.01', '-4.1', '-10.67', '-127']);
  });
  it('should modify row translating process when soring is applied (visual to physical and vice versa)', function () {
    var hot = handsontable({
      data: [[2], [4], [1], [3]],
      colHeaders: true,
      columnSorting: true
    });
    spec().sortByClickOnColumnHeader(0);
    expect(hot.toPhysicalRow(0)).toBe(2);
    expect(hot.toPhysicalRow(1)).toBe(0);
    expect(hot.toPhysicalRow(2)).toBe(3);
    expect(hot.toPhysicalRow(3)).toBe(1);
    expect(hot.toVisualRow(0)).toBe(1);
    expect(hot.toVisualRow(1)).toBe(3);
    expect(hot.toVisualRow(2)).toBe(0);
    expect(hot.toVisualRow(3)).toBe(2);
  });
  describe('should return sorted properly data when maxRows or / and minSpareRow options are set', function () {
    it('maxRows < data.length', function () {
      handsontable({
        data: createSpreadsheetData(9, 9),
        maxRows: 6,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      expect(getDataAtCol(0)).toEqual(['A6', 'A5', 'A4', 'A3', 'A2', 'A1']);
    });
    it('maxRows > data.length', function () {
      handsontable({
        data: createSpreadsheetData(9, 9),
        maxRows: 20,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      expect(getDataAtCol(0)).toEqual(['A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1']);
    });
    it('minSpareRows is set; maxRows < data.length', function () {
      handsontable({
        data: createSpreadsheetData(9, 9),
        maxRows: 5,
        minSpareRows: 3,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      expect(getDataAtCol(0)).toEqual(['A5', 'A4', 'A3', 'A2', 'A1']);
    });
    it('minSpareRows is set; maxRows === data.length', function () {
      handsontable({
        data: createSpreadsheetData(6, 6),
        maxRows: 9,
        minSpareRows: 3,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      expect(getDataAtCol(0)).toEqual(['A6', 'A5', 'A4', 'A3', 'A2', 'A1', null, null, null]);
    });
    it('minSpareRows is set; maxRows > data.length', function () {
      handsontable({
        data: createSpreadsheetData(9, 9),
        maxRows: 15,
        minSpareRows: 2,
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      expect(getDataAtCol(0)).toEqual(['A9', 'A8', 'A7', 'A6', 'A5', 'A4', 'A3', 'A2', 'A1', null, null]);
    });
  }); // DIFF - MultiColumnSorting & ColumnSorting: removed group of tests named: "Sorting by multiple columns should reorganize sequence of rows properly".
  // DIFF - MultiColumnSorting & ColumnSorting: removed group of tests named: "Numbers presenting sorting sequence".

  describe('Sorting configuration validation', function () {
    describe('should not change internal state of sorting when wrong configuration was provided', function () {
      // DIFF - MultiColumnSorting & ColumnSorting: change in initial sort config.
      it('when too low column index was passed to the initial config', function () {
        handsontable({
          data: createSpreadsheetData(10, 10),
          colHeaders: true,
          columnSorting: {
            indicator: true,
            initialConfig: {
              column: -1,
              sortOrder: 'asc'
            }
          }
        });
        expect(getPlugin('columnSorting').getSortConfig()).toEqual([]);
      }); // DIFF - MultiColumnSorting & ColumnSorting: change in initial sort config.

      it('when too high column index was passed to the initial config', function () {
        handsontable({
          data: createSpreadsheetData(10, 10),
          colHeaders: true,
          columnSorting: {
            indicator: true,
            initialConfig: {
              column: 100,
              sortOrder: 'asc'
            }
          }
        });
        expect(getPlugin('columnSorting').getSortConfig()).toEqual([]);
      }); // DIFF - MultiColumnSorting & ColumnSorting: change in initial sort config.

      it('when not proper sort order was passed to the initial config', function () {
        handsontable({
          data: createSpreadsheetData(10, 10),
          colHeaders: true,
          columnSorting: {
            indicator: true,
            initialConfig: {
              column: 1,
              sortOrder: 'unknown'
            }
          }
        });
        expect(getPlugin('columnSorting').getSortConfig()).toEqual([]);
      }); // DIFF - MultiColumnSorting & ColumnSorting: change in initial sort config.

      it('when missed sort order was passed to the initial config', function () {
        handsontable({
          data: createSpreadsheetData(10, 10),
          colHeaders: true,
          columnSorting: {
            indicator: true,
            initialConfig: {
              column: 1
            }
          }
        });
        expect(getPlugin('columnSorting').getSortConfig()).toEqual([]);
      }); // DIFF - MultiColumnSorting & ColumnSorting: change in initial sort config.

      it('when missed column index was passed to the initial config', function () {
        handsontable({
          data: createSpreadsheetData(10, 10),
          colHeaders: true,
          columnSorting: {
            indicator: true,
            initialConfig: {
              sortOrder: 'desc'
            }
          }
        });
        expect(getPlugin('columnSorting').getSortConfig()).toEqual([]);
      }); // DIFF - MultiColumnSorting & ColumnSorting: removed test named: "when the same column index was passed twice to the initial config".
    });
  }); // DIFF - MultiColumnSorting & ColumnSorting: removed group of tests named: "Sorting more than one column by clicks".

  describe('Click on the header sort data', function () {
    var HEADER_ACTION_CLASS = 'sortAction';
    it('should block action for specific configuration', function () {
      handsontable({
        data: arrayOfArrays(),
        columns: [{
          columnSorting: {
            headerAction: false
          }
        }, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }, {
          type: 'numeric'
        }, {}],
        colHeaders: true,
        columnSorting: {
          headerAction: true
        }
      });
      var $clickedHeader = spec().$container.find('th span.columnSorting:eq(0)');
      expect($clickedHeader.hasClass(HEADER_ACTION_CLASS)).toBeFalsy();
      spec().sortByClickOnColumnHeader(0);
      expect(getDataAtCol(0)).toEqual(['Mary', 'Henry', 'Ann', 'Robert', 'Ann', 'David', 'John', 'Mary', 'Robert']);
    });
    it('should not sort table by right click', function () {
      var hot = handsontable({
        data: arrayOfArrays(),
        colHeaders: true,
        columnSorting: true
      });
      var $columnHeader = $(hot.view.wt.wtTable.getColumnHeader(0));
      var $spanInsideHeader = $columnHeader.find('.columnSorting');
      $spanInsideHeader.simulate('mousedown', {
        button: 2
      });
      $spanInsideHeader.simulate('click');
      $spanInsideHeader.simulate('mouseup', {
        button: 2
      });
      expect(getData()).toEqual(arrayOfArrays());
    });
    it('should not block action for specific configuration updated by `updateSettings`', function () {
      handsontable({
        data: arrayOfArrays(),
        columns: [{
          columnSorting: {
            headerAction: false
          }
        }, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }, {
          type: 'numeric'
        }, {}],
        colHeaders: true,
        columnSorting: {
          headerAction: true
        }
      });
      var $clickedHeader = spec().$container.find('th span.columnSorting:eq(0)');
      expect($clickedHeader.hasClass(HEADER_ACTION_CLASS)).toBeFalsy();
      updateSettings({
        columns: function columns() {
          return {
            type: 'text'
          };
        }
      });
      $clickedHeader = spec().$container.find('th span.columnSorting:eq(0)');
      expect($clickedHeader.hasClass(HEADER_ACTION_CLASS)).toBeTruthy();
      spec().sortByClickOnColumnHeader(0);
      expect(getDataAtCol(0)).toEqual(['Ann', 'Ann', 'David', 'Henry', 'John', 'Mary', 'Mary', 'Robert', 'Robert']);
    });
    it('should block action for specific configuration updated by `updateSettings`', function () {
      handsontable({
        data: arrayOfArrays(),
        columns: [{}, {}, {
          type: 'date',
          dateFormat: 'MM/DD/YYYY'
        }, {
          type: 'numeric'
        }, {}],
        colHeaders: true,
        columnSorting: true
      });
      var $clickedHeader = spec().$container.find('th span.columnSorting:eq(0)');
      expect($clickedHeader.hasClass(HEADER_ACTION_CLASS)).toBeTruthy();
      updateSettings({
        columnSorting: {
          headerAction: false
        }
      });
      $clickedHeader = spec().$container.find('th span.columnSorting:eq(0)');
      expect($clickedHeader.hasClass(HEADER_ACTION_CLASS)).toBeFalsy();
      spec().sortByClickOnColumnHeader(0);
      expect(getDataAtCol(0)).toEqual(['Mary', 'Henry', 'Ann', 'Robert', 'Ann', 'David', 'John', 'Mary', 'Robert']);
    });
  });
  describe('rendering headers', function () {
    it('should change width of multi-line headers when plugin is enabled / disabled by `updateSettings` and sort indicator is enabled', function () {
      handsontable({
        colHeaders: ['AAA<br>BB']
      });
      var headerWidthAtStart = spec().$container.find('th').eq(0).width();
      updateSettings({
        columnSorting: true
      });
      var newHeaderWidth = spec().$container.find('th').eq(0).width();
      expect(headerWidthAtStart).toBeLessThan(newHeaderWidth);
      updateSettings({
        columnSorting: false
      });
      newHeaderWidth = spec().$container.find('th').eq(0).width();
      expect(headerWidthAtStart).toBe(newHeaderWidth);
      updateSettings({
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'asc'
          }
        }
      });
      newHeaderWidth = spec().$container.find('th').eq(0).width();
      expect(headerWidthAtStart).toBeLessThan(newHeaderWidth);
    });
    it('should work properly also when `rowHeaders` option is set to `true`', function () {
      handsontable({
        colHeaders: ['AAA<br>BB'],
        rowHeaders: true
      });
      spec().$container[0].style.width = 'auto';
      spec().$container[0].style.height = 'auto';
      var wtHiderWidthAtStart = spec().$container.find('.wtHider').eq(0).width();
      var htCoreWidthAtStart = spec().$container.find('.htCore').eq(0).width();
      updateSettings({
        columnSorting: true
      });
      var newWtHiderWidth = spec().$container.find('.wtHider').eq(0).width();
      var newHtCoreWidth = spec().$container.find('.htCore').eq(0).width();
      expect(wtHiderWidthAtStart).toBeLessThan(newWtHiderWidth);
      expect(htCoreWidthAtStart).toBeLessThan(newHtCoreWidth);
      expect(newWtHiderWidth).toBe(newHtCoreWidth);
      updateSettings({
        columnSorting: false
      });
      newWtHiderWidth = spec().$container.find('.wtHider').eq(0).width();
      newHtCoreWidth = spec().$container.find('.htCore').eq(0).width();
      expect(wtHiderWidthAtStart).toBe(newWtHiderWidth);
      expect(htCoreWidthAtStart).toBe(newHtCoreWidth);
      expect(newWtHiderWidth).toBe(newHtCoreWidth);
      updateSettings({
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'asc'
          }
        }
      });
      newWtHiderWidth = spec().$container.find('.wtHider').eq(0).width();
      newHtCoreWidth = spec().$container.find('.htCore').eq(0).width();
      expect(wtHiderWidthAtStart).toBeLessThan(newWtHiderWidth);
      expect(htCoreWidthAtStart).toBeLessThan(newHtCoreWidth);
      expect(newWtHiderWidth).toBe(newHtCoreWidth);
    });
    it('should not change width of multi-line headers when plugin is enabled / disabled and sort indicator is disabled',
    /*#__PURE__*/
    _asyncToGenerator(function* () {
      handsontable({
        colHeaders: ['AAA<br>BB']
      });
      var headerWidthAtStart = spec().$container.find('th').eq(0).width();
      var wtHiderWidthAtStart = spec().$container.find('.wtHider').eq(0).width();
      var htCoreWidthAtStart = spec().$container.find('.htCore').eq(0).width();
      updateSettings({
        columnSorting: {
          indicator: false
        }
      });
      yield sleep(100);
      var newHeaderWidth = spec().$container.find('th').eq(0).width();
      var newWtHiderWidth = spec().$container.find('.wtHider').eq(0).width();
      var newHtCoreWidth = spec().$container.find('.htCore').eq(0).width();
      expect(headerWidthAtStart).toBe(newHeaderWidth);
      expect(wtHiderWidthAtStart).toBe(newWtHiderWidth);
      expect(htCoreWidthAtStart).toBe(newHtCoreWidth);
      updateSettings({
        columnSorting: false
      });
      yield sleep(100);
      newHeaderWidth = spec().$container.find('th').eq(0).width();
      newWtHiderWidth = spec().$container.find('.wtHider').eq(0).width();
      newHtCoreWidth = spec().$container.find('.htCore').eq(0).width();
      expect(headerWidthAtStart).toBe(newHeaderWidth);
      expect(wtHiderWidthAtStart).toBe(newWtHiderWidth);
      expect(htCoreWidthAtStart).toBe(newHtCoreWidth);
    }));
  });
  describe('index mappers', function () {
    it('should not map indexes when already sorted column was set to not sorted', function () {
      var hot = handsontable({
        colHeaders: true,
        data: Handsontable.helper.createSpreadsheetData(3, 3),
        columnSorting: {
          initialConfig: {
            column: 0,
            sortOrder: 'desc'
          }
        }
      });
      updateSettings({
        columnSorting: {
          initialConfig: []
        }
      });
      expect(hot.toVisualRow(0)).toEqual(0);
    });
  }); // TODO: Remove tests when workaround will be removed.

  describe('workaround regression check', function () {
    it('should not break the dataset when inserted new row', function () {
      handsontable({
        colHeaders: true,
        data: Handsontable.helper.createSpreadsheetData(3, 3),
        columnSorting: true
      });
      alter('insert_row', 2);
      expect(getData()).toEqual([['A1', 'B1', 'C1'], ['A2', 'B2', 'C2'], [null, null, null], ['A3', 'B3', 'C3']]);
    });
    it('should add new columns properly when the `columnSorting` plugin is enabled (inheriting of non-primitive cell meta values)', function () {
      spec().$container[0].style.width = 'auto';
      spec().$container[0].style.height = 'auto';
      handsontable({
        colHeaders: true,
        data: Handsontable.helper.createSpreadsheetData(2, 2),
        columnSorting: true
      });
      alter('insert_col', 2, 5);
      expect(getHtCore().find('tbody tr:eq(0) td').length).toEqual(7);
    });
  });
});