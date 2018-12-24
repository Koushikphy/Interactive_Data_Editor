"use strict";

exports.__esModule = true;
exports.default = void 0;

var _arrayMapper = _interopRequireDefault(require("../../mixins/arrayMapper"));

var _object = require("../../helpers/object");

var _number = require("../../helpers/number");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

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
      (0, _number.rangeEach)(originLength - 1, function (itemIndex) {
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

(0, _object.mixin)(RowsMapper, _arrayMapper.default);
var _default = RowsMapper;
exports.default = _default;