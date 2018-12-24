function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

import { arrayReduce, arrayMap, arrayMax } from './../helpers/array';
import { defineGetter } from './../helpers/object';
import { rangeEach } from './../helpers/number';
var MIXIN_NAME = 'arrayMapper';
/**
 * @type {Object}
 */

var arrayMapper = {
  _arrayMap: [],

  /**
   * Get translated index by its physical index.
   *
   * @param {Number} physicalIndex Physical index.
   * @return {Number|null} Returns translated index mapped by passed physical index.
   */
  getValueByIndex: function getValueByIndex(physicalIndex) {
    var length = this._arrayMap.length;
    var translatedIndex = null;

    if (physicalIndex < length) {
      translatedIndex = this._arrayMap[physicalIndex];
    }

    return translatedIndex;
  },

  /**
   * Get physical index by its translated index.
   *
   * @param {*} translatedIndex Value to search.
   * @returns {Number|null} Returns a physical index of the array mapper.
   */
  getIndexByValue: function getIndexByValue(translatedIndex) {
    var physicalIndex; // eslint-disable-next-line no-cond-assign, no-return-assign

    return (physicalIndex = this._arrayMap.indexOf(translatedIndex)) === -1 ? null : physicalIndex;
  },

  /**
   * Insert new items to array mapper starting at passed index. New entries will be a continuation of last value in the array.
   *
   * @param {Number} physicalIndex Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   * @returns {Array} Returns added items.
   */
  insertItems: function insertItems(physicalIndex) {
    var _this = this;

    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var newIndex = arrayMax(this._arrayMap) + 1;
    var addedItems = [];
    rangeEach(amount - 1, function (count) {
      addedItems.push(_this._arrayMap.splice(physicalIndex + count, 0, newIndex + count));
    });
    return addedItems;
  },

  /**
   * Remove items from array mapper.
   *
   * @param {Number} physicalIndex Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   * @returns {Array} Returns removed items.
   */
  removeItems: function removeItems(physicalIndex) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var removedItems = [];

    if (Array.isArray(physicalIndex)) {
      var mapCopy = [].concat(this._arrayMap); // Sort descending

      physicalIndex.sort(function (a, b) {
        return b - a;
      });

      for (var i = 0, length = physicalIndex.length; i < length; i++) {
        var indexToRemove = physicalIndex[i];

        this._arrayMap.splice(indexToRemove, 1);

        removedItems.push(mapCopy[indexToRemove]);
      }
    } else {
      removedItems = this._arrayMap.splice(physicalIndex, amount);
    }

    return removedItems;
  },

  /**
   * Unshift items (remove and shift chunk of array to the left).
   *
   * @param {Number|Array} physicalIndex Array index or Array of indexes to unshift.
   * @param {Number} [amount=1] Defines how many items will be removed from an array (when index is passed as number).
   */
  unshiftItems: function unshiftItems(physicalIndex) {
    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    var removedItems = this.removeItems(physicalIndex, amount);

    function countRowShift(logicalRow) {
      // Todo: compare perf between reduce vs sort->each->brake
      return arrayReduce(removedItems, function (count, removedLogicalRow) {
        var result = count;

        if (logicalRow > removedLogicalRow) {
          result += 1;
        }

        return result;
      }, 0);
    }

    this._arrayMap = arrayMap(this._arrayMap, function (logicalRow) {
      var logicalRowIndex = logicalRow;
      var rowShift = countRowShift(logicalRowIndex);

      if (rowShift) {
        logicalRowIndex -= rowShift;
      }

      return logicalRowIndex;
    });
  },

  /**
   * Shift (right shifting) items starting at passed index.
   *
   * @param {Number} physicalIndex Array index.
   * @param {Number} [amount=1] Defines how many items will be created to an array.
   */
  shiftItems: function shiftItems(physicalIndex) {
    var _this2 = this;

    var amount = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
    this._arrayMap = arrayMap(this._arrayMap, function (row) {
      var physicalRowIndex = row;

      if (physicalRowIndex >= physicalIndex) {
        physicalRowIndex += amount;
      }

      return physicalRowIndex;
    });
    rangeEach(amount - 1, function (count) {
      _this2._arrayMap.splice(physicalIndex + count, 0, physicalIndex + count);
    });
  },

  /**
   * Swap indexes in arrayMapper.
   *
   * @param {Number} physicalIndexFrom index to move.
   * @param {Number} physicalIndexTo index to.
   */
  swapIndexes: function swapIndexes(physicalIndexFrom, physicalIndexTo) {
    var _this$_arrayMap;

    (_this$_arrayMap = this._arrayMap).splice.apply(_this$_arrayMap, [physicalIndexTo, 0].concat(_toConsumableArray(this._arrayMap.splice(physicalIndexFrom, 1))));
  },

  /**
   * Clear all stored index<->value information from an array.
   */
  clearMap: function clearMap() {
    this._arrayMap.length = 0;
  }
};
defineGetter(arrayMapper, 'MIXIN_NAME', MIXIN_NAME, {
  writable: false,
  enumerable: false
});
export default arrayMapper;