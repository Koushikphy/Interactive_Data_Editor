function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _get(target, property, receiver) { if (typeof Reflect !== "undefined" && Reflect.get) { _get = Reflect.get; } else { _get = function _get(target, property, receiver) { var base = _superPropBase(target, property); if (!base) return; var desc = Object.getOwnPropertyDescriptor(base, property); if (desc.get) { return desc.get.call(receiver); } return desc.value; }; } return _get(target, property, receiver || target); }

function _superPropBase(object, property) { while (!Object.prototype.hasOwnProperty.call(object, property)) { object = _getPrototypeOf(object); if (object === null) break; } return object; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

import { getWindowScrollTop, hasClass, getWindowScrollLeft } from './../../helpers/dom/element';
import { isMobileBrowser } from './../../helpers/browser';
import BasePlugin from './../_base';
import EventManager from './../../eventManager';
import { registerPlugin } from './../../plugins';
import { CellCoords } from './../../3rdparty/walkontable/src';
/**
 * @private
 * @plugin MultipleSelectionHandles
 */

var MultipleSelectionHandles =
/*#__PURE__*/
function (_BasePlugin) {
  _inherits(MultipleSelectionHandles, _BasePlugin);

  /**
   * @param {Object} hotInstance
   */
  function MultipleSelectionHandles(hotInstance) {
    var _this2;

    _classCallCheck(this, MultipleSelectionHandles);

    _this2 = _possibleConstructorReturn(this, _getPrototypeOf(MultipleSelectionHandles).call(this, hotInstance));
    /**
     * @type {Array}
     */

    _this2.dragged = [];
    /**
     * Instance of EventManager.
     *
     * @type {EventManager}
     */

    _this2.eventManager = null;
    /**
     * @type {null}
     */

    _this2.lastSetCell = null;
    return _this2;
  }
  /**
   * Check if the plugin is enabled in the handsontable settings.
   *
   * @returns {Boolean}
   */


  _createClass(MultipleSelectionHandles, [{
    key: "isEnabled",
    value: function isEnabled() {
      return isMobileBrowser();
    }
    /**
     * Enable plugin for this Handsontable instance.
     */

  }, {
    key: "enablePlugin",
    value: function enablePlugin() {
      if (this.enabled) {
        return;
      }

      if (!this.eventManager) {
        this.eventManager = new EventManager(this);
      }

      this.registerListeners();

      _get(_getPrototypeOf(MultipleSelectionHandles.prototype), "enablePlugin", this).call(this);
    }
    /**
     * Bind the touch events
     * @private
     */

  }, {
    key: "registerListeners",
    value: function registerListeners() {
      var _this = this;

      function removeFromDragged(query) {
        if (_this.dragged.length === 1) {
          // clear array
          _this.dragged.splice(0, _this.dragged.length);

          return true;
        }

        var entryPosition = _this.dragged.indexOf(query);

        if (entryPosition === -1) {
          return false;
        } else if (entryPosition === 0) {
          _this.dragged = _this.dragged.slice(0, 1);
        } else if (entryPosition === 1) {
          _this.dragged = _this.dragged.slice(-1);
        }
      }

      this.eventManager.addEventListener(this.hot.rootElement, 'touchstart', function (event) {
        var selectedRange;

        if (hasClass(event.target, 'topLeftSelectionHandle-HitArea')) {
          selectedRange = _this.hot.getSelectedRangeLast();

          _this.dragged.push('topLeft');

          _this.touchStartRange = {
            width: selectedRange.getWidth(),
            height: selectedRange.getHeight(),
            direction: selectedRange.getDirection()
          };
          event.preventDefault();
          return false;
        } else if (hasClass(event.target, 'bottomRightSelectionHandle-HitArea')) {
          selectedRange = _this.hot.getSelectedRangeLast();

          _this.dragged.push('bottomRight');

          _this.touchStartRange = {
            width: selectedRange.getWidth(),
            height: selectedRange.getHeight(),
            direction: selectedRange.getDirection()
          };
          event.preventDefault();
          return false;
        }
      });
      this.eventManager.addEventListener(this.hot.rootElement, 'touchend', function (event) {
        if (hasClass(event.target, 'topLeftSelectionHandle-HitArea')) {
          removeFromDragged.call(_this, 'topLeft');
          _this.touchStartRange = void 0;
          event.preventDefault();
          return false;
        } else if (hasClass(event.target, 'bottomRightSelectionHandle-HitArea')) {
          removeFromDragged.call(_this, 'bottomRight');
          _this.touchStartRange = void 0;
          event.preventDefault();
          return false;
        }
      });
      this.eventManager.addEventListener(this.hot.rootElement, 'touchmove', function (event) {
        var scrollTop = getWindowScrollTop();
        var scrollLeft = getWindowScrollLeft();
        var targetCoords;
        var selectedRange;
        var rangeWidth;
        var rangeHeight;
        var rangeDirection;
        var newRangeCoords;

        if (_this.dragged.length === 0) {
          return;
        }

        var endTarget = document.elementFromPoint(event.touches[0].screenX - scrollLeft, event.touches[0].screenY - scrollTop);

        if (!endTarget || endTarget === _this.lastSetCell) {
          return;
        }

        if (endTarget.nodeName === 'TD' || endTarget.nodeName === 'TH') {
          targetCoords = _this.hot.getCoords(endTarget);

          if (targetCoords.col === -1) {
            targetCoords.col = 0;
          }

          selectedRange = _this.hot.getSelectedRangeLast();
          rangeWidth = selectedRange.getWidth();
          rangeHeight = selectedRange.getHeight();
          rangeDirection = selectedRange.getDirection();

          if (rangeWidth === 1 && rangeHeight === 1) {
            _this.hot.selection.setRangeEnd(targetCoords);
          }

          newRangeCoords = _this.getCurrentRangeCoords(selectedRange, targetCoords, _this.touchStartRange.direction, rangeDirection, _this.dragged[0]);

          if (newRangeCoords.start !== null) {
            _this.hot.selection.setRangeStart(newRangeCoords.start);
          }

          _this.hot.selection.setRangeEnd(newRangeCoords.end);

          _this.lastSetCell = endTarget;
        }

        event.preventDefault();
      });
    }
  }, {
    key: "getCurrentRangeCoords",
    value: function getCurrentRangeCoords(selectedRange, currentTouch, touchStartDirection, currentDirection, draggedHandle) {
      var topLeftCorner = selectedRange.getTopLeftCorner();
      var bottomRightCorner = selectedRange.getBottomRightCorner();
      var bottomLeftCorner = selectedRange.getBottomLeftCorner();
      var topRightCorner = selectedRange.getTopRightCorner();
      var newCoords = {
        start: null,
        end: null
      };

      switch (touchStartDirection) {
        case 'NE-SW':
          switch (currentDirection) {
            case 'NE-SW':
            case 'NW-SE':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: new CellCoords(currentTouch.row, selectedRange.highlight.col),
                  end: new CellCoords(bottomLeftCorner.row, currentTouch.col)
                };
              } else {
                newCoords = {
                  start: new CellCoords(selectedRange.highlight.row, currentTouch.col),
                  end: new CellCoords(currentTouch.row, topLeftCorner.col)
                };
              }

              break;

            case 'SE-NW':
              if (draggedHandle === 'bottomRight') {
                newCoords = {
                  start: new CellCoords(bottomRightCorner.row, currentTouch.col),
                  end: new CellCoords(currentTouch.row, topLeftCorner.col)
                };
              }

              break;

            default:
              break;
          }

          break;

        case 'NW-SE':
          switch (currentDirection) {
            case 'NE-SW':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: currentTouch,
                  end: bottomLeftCorner
                };
              } else {
                newCoords.end = currentTouch;
              }

              break;

            case 'NW-SE':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: currentTouch,
                  end: bottomRightCorner
                };
              } else {
                newCoords.end = currentTouch;
              }

              break;

            case 'SE-NW':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: currentTouch,
                  end: topLeftCorner
                };
              } else {
                newCoords.end = currentTouch;
              }

              break;

            case 'SW-NE':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: currentTouch,
                  end: topRightCorner
                };
              } else {
                newCoords.end = currentTouch;
              }

              break;

            default:
              break;
          }

          break;

        case 'SW-NE':
          switch (currentDirection) {
            case 'NW-SE':
              if (draggedHandle === 'bottomRight') {
                newCoords = {
                  start: new CellCoords(currentTouch.row, topLeftCorner.col),
                  end: new CellCoords(bottomLeftCorner.row, currentTouch.col)
                };
              } else {
                newCoords = {
                  start: new CellCoords(topLeftCorner.row, currentTouch.col),
                  end: new CellCoords(currentTouch.row, bottomRightCorner.col)
                };
              }

              break;
            // case 'NE-SW':
            //
            //  break;

            case 'SW-NE':
              if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: new CellCoords(selectedRange.highlight.row, currentTouch.col),
                  end: new CellCoords(currentTouch.row, bottomRightCorner.col)
                };
              } else {
                newCoords = {
                  start: new CellCoords(currentTouch.row, topLeftCorner.col),
                  end: new CellCoords(topLeftCorner.row, currentTouch.col)
                };
              }

              break;

            case 'SE-NW':
              if (draggedHandle === 'bottomRight') {
                newCoords = {
                  start: new CellCoords(currentTouch.row, topRightCorner.col),
                  end: new CellCoords(topLeftCorner.row, currentTouch.col)
                };
              } else if (draggedHandle === 'topLeft') {
                newCoords = {
                  start: bottomLeftCorner,
                  end: currentTouch
                };
              }

              break;

            default:
              break;
          }

          break;

        case 'SE-NW':
          switch (currentDirection) {
            case 'NW-SE':
            case 'NE-SW':
            case 'SW-NE':
              if (draggedHandle === 'topLeft') {
                newCoords.end = currentTouch;
              }

              break;

            case 'SE-NW':
              if (draggedHandle === 'topLeft') {
                newCoords.end = currentTouch;
              } else {
                newCoords = {
                  start: currentTouch,
                  end: topLeftCorner
                };
              }

              break;

            default:
              break;
          }

          break;

        default:
          break;
      }

      return newCoords;
    }
    /**
     * Check if user is currently dragging the handle.
     *
     * @returns {boolean} Dragging state
     */

  }, {
    key: "isDragged",
    value: function isDragged() {
      return this.dragged.length > 0;
    }
  }]);

  return MultipleSelectionHandles;
}(BasePlugin);

registerPlugin('multipleSelectionHandles', MultipleSelectionHandles);
export default MultipleSelectionHandles;