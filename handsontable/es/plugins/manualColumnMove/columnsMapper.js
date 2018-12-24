function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import arrayMapper from './../../mixins/arrayMapper';
import { arrayFilter } from './../../helpers/array';
import { mixin } from './../../helpers/object';
import { rangeEach } from './../../helpers/number';
/**
 * @class ColumnsMapper
 * @plugin ManualColumnMove
 */

var ColumnsMapper =
/*#__PURE__*/
function () {
  function ColumnsMapper(manualColumnMove) {
    _classCallCheck(this, ColumnsMapper);

    /**
     * Instance of ManualColumnMove plugin.
     *
     * @type {ManualColumnMove}
     */
    this.manualColumnMove = manualColumnMove;
  }
  /**
   * Reset current map array and create new one.
   *
   * @param {Number} [length] Custom generated map length.
   */


  _createClass(ColumnsMapper, [{
    key: "createMap",
    value: function createMap(length) {
      var _this = this;

      var originLength = length === void 0 ? this._arrayMap.length : length;
      this._arrayMap.length = 0;
      rangeEach(originLength - 1, function (itemIndex) {
        _this._arrayMap[itemIndex] = itemIndex;
      });
    }
    /**
     * Destroy class.
     */

  }, {
    key: "destroy",
    value: function destroy() {
      this._arrayMap = null;
    }
    /**
     * Moving elements in columnsMapper.
     *
     * @param {Number} from Column index to move.
     * @param {Number} to Target index.
     */

  }, {
    key: "moveColumn",
    value: function moveColumn(from, to) {
      var indexToMove = this._arrayMap[from];
      this._arrayMap[from] = null;

      this._arrayMap.splice(to, 0, indexToMove);
    }
    /**
     * Clearing arrayMap from `null` entries.
     */

  }, {
    key: "clearNull",
    value: function clearNull() {
      this._arrayMap = arrayFilter(this._arrayMap, function (i) {
        return i !== null;
      });
    }
  }]);

  return ColumnsMapper;
}();

mixin(ColumnsMapper, arrayMapper);
export default ColumnsMapper;