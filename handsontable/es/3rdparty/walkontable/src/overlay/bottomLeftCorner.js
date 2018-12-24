function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import { getScrollbarWidth, outerHeight, outerWidth, resetCssTransform } from './../../../../helpers/dom/element';
import Overlay from './_base';
/**
 * @class TopLeftCornerOverlay
 */

var BottomLeftCornerOverlay =
/*#__PURE__*/
function (_Overlay) {
  _inherits(BottomLeftCornerOverlay, _Overlay);

  /**
   * @param {Walkontable} wotInstance
   */
  function BottomLeftCornerOverlay(wotInstance) {
    var _this;

    _classCallCheck(this, BottomLeftCornerOverlay);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(BottomLeftCornerOverlay).call(this, wotInstance));
    _this.clone = _this.makeClone(Overlay.CLONE_BOTTOM_LEFT_CORNER);
    return _this;
  }
  /**
   * Checks if overlay should be fully rendered
   *
   * @returns {Boolean}
   */


  _createClass(BottomLeftCornerOverlay, [{
    key: "shouldBeRendered",
    value: function shouldBeRendered() {
      /* eslint-disable no-unneeded-ternary */
      return this.wot.getSetting('fixedRowsBottom') && (this.wot.getSetting('fixedColumnsLeft') || this.wot.getSetting('rowHeaders').length) ? true : false;
    }
    /**
     * Reposition the overlay.
     */

  }, {
    key: "repositionOverlay",
    value: function repositionOverlay() {
      var scrollbarWidth = getScrollbarWidth();
      var cloneRoot = this.clone.wtTable.holder.parentNode;

      if (this.wot.wtTable.holder.clientHeight === this.wot.wtTable.holder.offsetHeight) {
        scrollbarWidth = 0;
      }

      cloneRoot.style.top = '';
      cloneRoot.style.bottom = "".concat(scrollbarWidth, "px");
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
      overlayRoot.style.top = '';

      if (this.trimmingContainer === window) {
        var box = this.wot.wtTable.hider.getBoundingClientRect();
        var bottom = Math.ceil(box.bottom);
        var left = Math.ceil(box.left);
        var finalLeft;
        var finalBottom;
        var bodyHeight = document.body.offsetHeight;

        if (left < 0) {
          finalLeft = -left;
        } else {
          finalLeft = 0;
        }

        if (bottom > bodyHeight) {
          finalBottom = bottom - bodyHeight;
        } else {
          finalBottom = 0;
        }

        finalBottom += 'px';
        finalLeft += 'px';
        overlayRoot.style.top = '';
        overlayRoot.style.left = finalLeft;
        overlayRoot.style.bottom = finalBottom;
      } else {
        resetCssTransform(overlayRoot);
        this.repositionOverlay();
      }

      overlayRoot.style.height = "".concat(tableHeight === 0 ? tableHeight : tableHeight, "px");
      overlayRoot.style.width = "".concat(tableWidth === 0 ? tableWidth : tableWidth, "px");
    }
  }]);

  return BottomLeftCornerOverlay;
}(Overlay);

Overlay.registerOverlay(Overlay.CLONE_BOTTOM_LEFT_CORNER, BottomLeftCornerOverlay);
export default BottomLeftCornerOverlay;