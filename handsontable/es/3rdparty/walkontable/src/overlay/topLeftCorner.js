function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import { outerHeight, outerWidth, setOverlayPosition, resetCssTransform } from './../../../../helpers/dom/element';
import Overlay from './_base';
/**
 * @class TopLeftCornerOverlay
 */

var TopLeftCornerOverlay =
/*#__PURE__*/
function (_Overlay) {
  _inherits(TopLeftCornerOverlay, _Overlay);

  /**
   * @param {Walkontable} wotInstance
   */
  function TopLeftCornerOverlay(wotInstance) {
    var _this;

    _classCallCheck(this, TopLeftCornerOverlay);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TopLeftCornerOverlay).call(this, wotInstance));
    _this.clone = _this.makeClone(Overlay.CLONE_TOP_LEFT_CORNER);
    return _this;
  }
  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */


  _createClass(TopLeftCornerOverlay, [{
    key: "shouldBeRendered",
    value: function shouldBeRendered() {
      return !!((this.wot.getSetting('fixedRowsTop') || this.wot.getSetting('columnHeaders').length) && (this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length));
    }
    /**
     * Updates the corner overlay position
     */

  }, {
    key: "resetFixedPosition",
    value: function resetFixedPosition() {
      this.updateTrimmingContainer();

      if (!this.wot.wtTable.holder.parentNode) {
        // removed from DOM
        return;
      }

      var overlayRoot = this.clone.wtTable.holder.parentNode;
      var tableHeight = outerHeight(this.clone.wtTable.TABLE);
      var tableWidth = outerWidth(this.clone.wtTable.TABLE);
      var preventOverflow = this.wot.getSetting('preventOverflow');

      if (this.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var top = Math.ceil(box.top);
        var left = Math.ceil(box.left);
        var bottom = Math.ceil(box.bottom);
        var right = Math.ceil(box.right);
        var finalLeft = '0';
        var finalTop = '0';

        if (!preventOverflow || preventOverflow === 'vertical') {
          if (left < 0 && right - overlayRoot.offsetWidth > 0) {
            finalLeft = "".concat(-left, "px");
          }
        }

        if (!preventOverflow || preventOverflow === 'horizontal') {
          if (top < 0 && bottom - overlayRoot.offsetHeight > 0) {
            finalTop = "".concat(-top, "px");
          }
        }

        setOverlayPosition(overlayRoot, finalLeft, finalTop);
      } else {
        resetCssTransform(overlayRoot);
      }

      overlayRoot.style.height = "".concat(tableHeight === 0 ? tableHeight : tableHeight + 4, "px");
      overlayRoot.style.width = "".concat(tableWidth === 0 ? tableWidth : tableWidth + 4, "px");
    }
  }]);

  return TopLeftCornerOverlay;
}(Overlay);

Overlay.registerOverlay(Overlay.CLONE_TOP_LEFT_CORNER, TopLeftCornerOverlay);
export default TopLeftCornerOverlay;