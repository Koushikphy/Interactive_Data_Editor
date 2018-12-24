function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

import arrayMapper from '../../mixins/arrayMapper';
import { mixin } from '../../helpers/object';
import { rangeEach } from '../../helpers/number';
/**
 * @class RowsMapper
 */

var RowsMapper =
/*#__PURE__*/
function () {
  function RowsMapper() {
    _classCallCheck(this, RowsMapper);
  }

  _createClass(RowsMapper, [{
    key: "createMap",

    /**
     * Reset current map array and create new one.
     *
     * @param {Number} [length] Custom generated map length.
     */
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
  }]);

  return RowsMapper;
}();

mixin(RowsMapper, arrayMapper);
export default RowsMapper;