"use strict";

exports.__esModule = true;
exports.default = void 0;

var _base = _interopRequireDefault(require("./../_base"));

var _array = require("./../../helpers/array");

var _feature = require("./../../helpers/feature");

var _element = require("./../../helpers/dom/element");

var _ghostTable = _interopRequireDefault(require("./../../utils/ghostTable"));

var _object = require("./../../helpers/object");

var _number = require("./../../helpers/number");

var _plugins = require("./../../plugins");

var _samplesGenerator = _interopRequireDefault(require("./../../utils/samplesGenerator"));

var _string = require("./../../helpers/string");

var _src = require("./../../3rdparty/walkontable/src");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

var privatePool = new WeakMap();
/**
 * @plugin AutoColumnSize
 *
 * @description
 * This plugin allows to set column widths based on their widest cells.
 *
 * By default, the plugin is declared as `undefined`, which makes it enabled (same as if it was declared as `true`).
 * Enabling this plugin may decrease the overall table performance, as it needs to calculate the widths of all cells to
 * resize the columns accordingly.
 * If you experience problems with the performance, try turning this feature off and declaring the column widths manually.
 *
 * Column width calculations are divided into sync and async part. Each of this parts has their own advantages and
 * disadvantages. Synchronous calculations are faster but they block the browser UI, while the slower asynchronous
 * operations don't block the browser UI.
 *
 * To configure the sync/async distribution, you can pass an absolute value (number of columns) or a percentage value to a config object:
 * ```js
 * // as a number (300 columns in sync, rest async)
 * autoColumnSize: {syncLimit: 300},
 *
 * // as a string (percent)
 * autoColumnSize: {syncLimit: '40%'},
 * ```
 *
 * To configure this plugin see {@link Options#autoColumnSize}.
 *
 * @example
 * ```js
 * const hot = new Handsontable(document.getElementById('example'), {
 *   date: getData(),
 *   autoColumnSize: true
 * });
 * // Access to plugin instance:
 * const plugin = hot.getPlugin('autoColumnSize');
 *
 * plugin.getColumnWidth(4);
 *
 * if (plugin.isEnabled()) {
 *   // code...
 * }
 * ```
 */

var AutoColumnSize =
/*#__PURE__*/
function (_BasePlugin) {
  _inherits(AutoColumnSize, _BasePlugin);

  _createClass(AutoColumnSize, null, [{
    key: "CALCULATION_STEP",
    get: function get() {
      return 50;
    }
  }, {
    key: "SYNC_CALCULATION_LIMIT",
    get: function get() {
      return 50;
    }
  }]);

  function AutoColumnSize(hotInstance) {
    var _this;

    _classCallCheck(this, AutoColumnSize);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AutoColumnSize).call(this, hotInstance));
    privatePool.set(_assertThisInitialized(_assertThisInitialized(_this)), {
      /**
       * Cached column header names. It is used to diff current column headers with previous state and detect which
       * columns width should be updated.
       *
       * @private
       * @type {Array}
       */
      cachedColumnHeaders: []
    });
    /**
     * Cached columns widths.
     *
     * @type {Number[]}
     */

    _this.widths = [];
    /**
     * Instance of {@link GhostTable} for rows and columns size calculations.
     *
     * @private
     * @type {GhostTable}
     */

    _this.ghostTable = new _ghostTable.default(_this.hot);
    /**
     * Instance of {@link SamplesGenerator} for generating samples necessary for columns width calculations.
     *
     * @private
     * @type {SamplesGenerator}
     */

    _this.samplesGenerator = new _samplesGenerator.default(function (row, column) {
      var cellMeta = _this.hot.getCellMeta(row, column);

      var cellValue = '';

      if (!cellMeta.spanned) {
        cellValue = _this.hot.getDataAtCell(row, column);
      }

      var bundleCountSeed = 0;

      if (cellMeta.label) {
        var _cellMeta$label = cellMeta.label,
            labelValue = _cellMeta$label.value,
            labelProperty = _cellMeta$label.property;
        var labelText = '';

        if (labelValue) {
          labelText = typeof labelValue === 'function' ? labelValue(row, column, _this.hot.colToProp(column), cellValue) : labelValue;
        } else if (labelProperty) {
          labelText = _this.hot.getDataAtRowProp(row, labelProperty);
        }

        bundleCountSeed = labelText.length;
      }

      return {
        value: cellValue,
        bundleCountSeed: bundleCountSeed
      };
    });
    /**
     * `true` only if the first calculation was performed
     *
     * @private
     * @type {Boolean}
     */

    _this.firstCalculation = true;
    /**
     * `true` if the size calculation is in progress.
     *
     * @type {Boolean}
     */

    _this.inProgress = false; // moved to constructor to allow auto-sizing the columns when the plugin is disabled

    _this.addHook('beforeColumnResize', function (col, size, isDblClick) {
      return _this.onBeforeColumnResize(col, size, isDblClick);
    });

    return _this;
  }
  /**
   * Checks if the plugin is enabled in the handsontable settings. This method is executed in {@link Hooks#beforeInit}
   * hook and if it returns `true` than the {@link AutoColumnSize#enablePlugin} method is called.
   *
   * @returns {Boolean}
   */


  _createClass(AutoColumnSize, [{
    key: "isEnabled",
    value: function isEnabled() {
      return this.hot.getSettings().autoColumnSize !== false && !this.hot.getSettings().colWidths;
    }
    /**
     * Enables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: "enablePlugin",
    value: function enablePlugin() {
      var _this2 = this;

      if (this.enabled) {
        return;
      }

      var setting = this.hot.getSettings().autoColumnSize;

      if (setting && setting.useHeaders !== null && setting.useHeaders !== void 0) {
        this.ghostTable.setSetting('useHeaders', setting.useHeaders);
      }

      this.setSamplingOptions();
      this.addHook('afterLoadData', function () {
        return _this2.onAfterLoadData();
      });
      this.addHook('beforeChange', function (changes) {
        return _this2.onBeforeChange(changes);
      });
      this.addHook('beforeRender', function (force) {
        return _this2.onBeforeRender(force);
      });
      this.addHook('modifyColWidth', function (width, col) {
        return _this2.getColumnWidth(col, width);
      });
      this.addHook('afterInit', function () {
        return _this2.onAfterInit();
      });

      _get(_getPrototypeOf(AutoColumnSize.prototype), "enablePlugin", this).call(this);
    }
    /**
     * Updates the plugin state. This method is executed when {@link Core#updateSettings} is invoked.
     */

  }, {
    key: "updatePlugin",
    value: function updatePlugin() {
      var changedColumns = this.findColumnsWhereHeaderWasChanged();

      if (changedColumns.length) {
        this.clearCache(changedColumns);
      }

      _get(_getPrototypeOf(AutoColumnSize.prototype), "updatePlugin", this).call(this);
    }
    /**
     * Disables the plugin functionality for this Handsontable instance.
     */

  }, {
    key: "disablePlugin",
    value: function disablePlugin() {
      _get(_getPrototypeOf(AutoColumnSize.prototype), "disablePlugin", this).call(this);
    }
    /**
     * Calculates a columns width.
     *
     * @param {Number|Object} colRange Column index or an object with `from` and `to` indexes as a range.
     * @param {Number|Object} rowRange Row index or an object with `from` and `to` indexes as a range.
     * @param {Boolean} [force=false] If `true` the calculation will be processed regardless of whether the width exists in the cache.
     */

  }, {
    key: "calculateColumnsWidth",
    value: function calculateColumnsWidth() {
      var _this3 = this;

      var colRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        from: 0,
        to: this.hot.countCols() - 1
      };
      var rowRange = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        from: 0,
        to: this.hot.countRows() - 1
      };
      var force = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
      var columnsRange = typeof colRange === 'number' ? {
        from: colRange,
        to: colRange
      } : colRange;
      var rowsRange = typeof rowRange === 'number' ? {
        from: rowRange,
        to: rowRange
      } : rowRange;
      (0, _number.rangeEach)(columnsRange.from, columnsRange.to, function (col) {
        if (force || _this3.widths[col] === void 0 && !_this3.hot._getColWidthFromSettings(col)) {
          var samples = _this3.samplesGenerator.generateColumnSamples(col, rowsRange);

          (0, _array.arrayEach)(samples, function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                column = _ref2[0],
                sample = _ref2[1];

            return _this3.ghostTable.addColumn(column, sample);
          });
        }
      });

      if (this.ghostTable.columns.length) {
        this.ghostTable.getWidths(function (col, width) {
          _this3.widths[col] = width;
        });
        this.ghostTable.clean();
      }
    }
    /**
     * Calculates all columns width. The calculated column will be cached in the {@link AutoColumnSize#widths} property.
     * To retrieve width for specyfied column use {@link AutoColumnSize#getColumnWidth} method.
     *
     * @param {Object|Number} rowRange Row index or an object with `from` and `to` properties which define row range.
     */

  }, {
    key: "calculateAllColumnsWidth",
    value: function calculateAllColumnsWidth() {
      var _this4 = this;

      var rowRange = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {
        from: 0,
        to: this.hot.countRows() - 1
      };
      var current = 0;
      var length = this.hot.countCols() - 1;
      var timer = null;
      this.inProgress = true;

      var loop = function loop() {
        // When hot was destroyed after calculating finished cancel frame
        if (!_this4.hot) {
          (0, _feature.cancelAnimationFrame)(timer);
          _this4.inProgress = false;
          return;
        }

        _this4.calculateColumnsWidth({
          from: current,
          to: Math.min(current + AutoColumnSize.CALCULATION_STEP, length)
        }, rowRange);

        current = current + AutoColumnSize.CALCULATION_STEP + 1;

        if (current < length) {
          timer = (0, _feature.requestAnimationFrame)(loop);
        } else {
          (0, _feature.cancelAnimationFrame)(timer);
          _this4.inProgress = false; // @TODO Should call once per render cycle, currently fired separately in different plugins

          _this4.hot.view.wt.wtOverlays.adjustElementsSize(true); // tmp


          if (_this4.hot.view.wt.wtOverlays.leftOverlay.needFullRender) {
            _this4.hot.view.wt.wtOverlays.leftOverlay.clone.draw();
          }
        }
      };

      var syncLimit = this.getSyncCalculationLimit(); // sync

      if (this.firstCalculation && syncLimit >= 0) {
        this.calculateColumnsWidth({
          from: 0,
          to: syncLimit
        }, rowRange);
        this.firstCalculation = false;
        current = syncLimit + 1;
      } // async


      if (current < length) {
        loop();
      } else {
        this.inProgress = false;
      }
    }
    /**
     * Sets the sampling options.
     *
     * @private
     */

  }, {
    key: "setSamplingOptions",
    value: function setSamplingOptions() {
      var setting = this.hot.getSettings().autoColumnSize;
      var samplingRatio = setting && (0, _object.hasOwnProperty)(setting, 'samplingRatio') ? this.hot.getSettings().autoColumnSize.samplingRatio : void 0;
      var allowSampleDuplicates = setting && (0, _object.hasOwnProperty)(setting, 'allowSampleDuplicates') ? this.hot.getSettings().autoColumnSize.allowSampleDuplicates : void 0;

      if (samplingRatio && !isNaN(samplingRatio)) {
        this.samplesGenerator.setSampleCount(parseInt(samplingRatio, 10));
      }

      if (allowSampleDuplicates) {
        this.samplesGenerator.setAllowDuplicates(allowSampleDuplicates);
      }
    }
    /**
     * Recalculates all columns width (overwrite cache values).
     */

  }, {
    key: "recalculateAllColumnsWidth",
    value: function recalculateAllColumnsWidth() {
      if (this.hot.view && (0, _element.isVisible)(this.hot.view.wt.wtTable.TABLE)) {
        this.clearCache();
        this.calculateAllColumnsWidth();
      }
    }
    /**
     * Gets value which tells how many columns should be calculated synchronously (rest of the columns will be calculated
     * asynchronously). The limit is calculated based on `syncLimit` set to `autoColumnSize` option (see {@link Options#autoColumnSize}).
     *
     * @returns {Number}
     */

  }, {
    key: "getSyncCalculationLimit",
    value: function getSyncCalculationLimit() {
      /* eslint-disable no-bitwise */
      var limit = AutoColumnSize.SYNC_CALCULATION_LIMIT;
      var colsLimit = this.hot.countCols() - 1;

      if ((0, _object.isObject)(this.hot.getSettings().autoColumnSize)) {
        limit = this.hot.getSettings().autoColumnSize.syncLimit;

        if ((0, _string.isPercentValue)(limit)) {
          limit = (0, _number.valueAccordingPercent)(colsLimit, limit);
        } else {
          // Force to Number
          limit >>= 0;
        }
      }

      return Math.min(limit, colsLimit);
    }
    /**
     * Gets the calculated column width.
     *
     * @param {Number} column Column index.
     * @param {Number} [defaultWidth] Default column width. It will be picked up if no calculated width found.
     * @param {Boolean} [keepMinimum=true] If `true` then returned value won't be smaller then 50 (default column width).
     * @returns {Number}
     */

  }, {
    key: "getColumnWidth",
    value: function getColumnWidth(column) {
      var defaultWidth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : void 0;
      var keepMinimum = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var width = defaultWidth;

      if (width === void 0) {
        width = this.widths[column];

        if (keepMinimum && typeof width === 'number') {
          width = Math.max(width, _src.ViewportColumnsCalculator.DEFAULT_WIDTH);
        }
      }

      return width;
    }
    /**
     * Gets the first visible column.
     *
     * @returns {Number|null} Returns column index, -1 if table is not rendered or null if there are no columns to base the the calculations on.
     */

  }, {
    key: "getFirstVisibleColumn",
    value: function getFirstVisibleColumn() {
      var wot = this.hot.view.wt;

      if (wot.wtViewport.columnsVisibleCalculator) {
        return wot.wtTable.getFirstVisibleColumn();
      }

      if (wot.wtViewport.columnsRenderCalculator) {
        return wot.wtTable.getFirstRenderedColumn();
      }

      return -1;
    }
    /**
     * Gets the last visible column.
     *
     * @returns {Number} Returns column index or -1 if table is not rendered.
     */

  }, {
    key: "getLastVisibleColumn",
    value: function getLastVisibleColumn() {
      var wot = this.hot.view.wt;

      if (wot.wtViewport.columnsVisibleCalculator) {
        return wot.wtTable.getLastVisibleColumn();
      }

      if (wot.wtViewport.columnsRenderCalculator) {
        return wot.wtTable.getLastRenderedColumn();
      }

      return -1;
    }
    /**
     * Collects all columns which titles has been changed in comparison to the previous state.
     *
     * @private
     * @returns {Array} It returns an array of physical column indexes.
     */

  }, {
    key: "findColumnsWhereHeaderWasChanged",
    value: function findColumnsWhereHeaderWasChanged() {
      var columnHeaders = this.hot.getColHeader();

      var _privatePool$get = privatePool.get(this),
          cachedColumnHeaders = _privatePool$get.cachedColumnHeaders;

      var changedColumns = (0, _array.arrayReduce)(columnHeaders, function (acc, columnTitle, physicalColumn) {
        var cachedColumnsLength = cachedColumnHeaders.length;

        if (cachedColumnsLength - 1 < physicalColumn || cachedColumnHeaders[physicalColumn] !== columnTitle) {
          acc.push(physicalColumn);
        }

        if (cachedColumnsLength - 1 < physicalColumn) {
          cachedColumnHeaders.push(columnTitle);
        } else {
          cachedColumnHeaders[physicalColumn] = columnTitle;
        }

        return acc;
      }, []);
      return changedColumns;
    }
    /**
     * Clears cache of calculated column widths. If you want to clear only selected columns pass an array with their indexes.
     * Otherwise whole cache will be cleared.
     *
     * @param {Number[]} [columns] List of physical column indexes to clear.
     */

  }, {
    key: "clearCache",
    value: function clearCache() {
      var _this5 = this;

      var columns = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

      if (columns.length) {
        (0, _array.arrayEach)(columns, function (physicalIndex) {
          _this5.widths[physicalIndex] = void 0;
        });
      } else {
        this.widths.length = 0;
      }
    }
    /**
     * Checks if all widths were calculated. If not then return `true` (need recalculate).
     *
     * @returns {Boolean}
     */

  }, {
    key: "isNeedRecalculate",
    value: function isNeedRecalculate() {
      return !!(0, _array.arrayFilter)(this.widths, function (item) {
        return item === void 0;
      }).length;
    }
    /**
     * On before render listener.
     *
     * @private
     */

  }, {
    key: "onBeforeRender",
    value: function onBeforeRender() {
      var force = this.hot.renderCall;
      var rowsCount = this.hot.countRows();
      var firstVisibleColumn = this.getFirstVisibleColumn();
      var lastVisibleColumn = this.getLastVisibleColumn();

      if (firstVisibleColumn === null || lastVisibleColumn === null) {
        return;
      } // Keep last column widths unchanged for situation when all rows was deleted or trimmed (pro #6)


      if (!rowsCount) {
        return;
      }

      this.calculateColumnsWidth({
        from: firstVisibleColumn,
        to: lastVisibleColumn
      }, void 0, force);

      if (this.isNeedRecalculate() && !this.inProgress) {
        this.calculateAllColumnsWidth();
      }
    }
    /**
     * On after load data listener.
     *
     * @private
     */

  }, {
    key: "onAfterLoadData",
    value: function onAfterLoadData() {
      var _this6 = this;

      if (this.hot.view) {
        this.recalculateAllColumnsWidth();
      } else {
        // first load - initialization
        setTimeout(function () {
          if (_this6.hot) {
            _this6.recalculateAllColumnsWidth();
          }
        }, 0);
      }
    }
    /**
     * On before change listener.
     *
     * @private
     * @param {Array} changes
     */

  }, {
    key: "onBeforeChange",
    value: function onBeforeChange(changes) {
      var _this7 = this;

      var changedColumns = (0, _array.arrayMap)(changes, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            column = _ref4[1];

        return _this7.hot.propToCol(column);
      });
      this.clearCache(changedColumns);
    }
    /**
     * On before column resize listener.
     *
     * @private
     * @param {Number} col
     * @param {Number} size
     * @param {Boolean} isDblClick
     * @returns {Number}
     */

  }, {
    key: "onBeforeColumnResize",
    value: function onBeforeColumnResize(col, size, isDblClick) {
      var newSize = size;

      if (isDblClick) {
        this.calculateColumnsWidth(col, void 0, true);
        newSize = this.getColumnWidth(col, void 0, false);
      }

      return newSize;
    }
    /**
     * On after Handsontable init fill plugin with all necessary values.
     *
     * @private
     */

  }, {
    key: "onAfterInit",
    value: function onAfterInit() {
      privatePool.get(this).cachedColumnHeaders = this.hot.getColHeader();
    }
    /**
     * Destroys the plugin instance.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this.ghostTable.clean();

      _get(_getPrototypeOf(AutoColumnSize.prototype), "destroy", this).call(this);
    }
  }]);

  return AutoColumnSize;
}(_base.default);

(0, _plugins.registerPlugin)('autoColumnSize', AutoColumnSize);
var _default = AutoColumnSize;
exports.default = _default;