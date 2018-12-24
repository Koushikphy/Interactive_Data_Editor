"use strict";

exports.__esModule = true;
exports.default = unfreezeColumnItem;

var C = _interopRequireWildcard(require("./../../../i18n/constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function unfreezeColumnItem(manualColumnFreezePlugin) {
  return {
    key: 'unfreeze_column',
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_UNFREEZE_COLUMN);
    },
    callback: function callback(key, selected) {
      var _selected = _slicedToArray(selected, 1),
          selectedColumn = _selected[0].start.col;

      manualColumnFreezePlugin.unfreezeColumn(selectedColumn);
      this.render();
      this.view.wt.wtOverlays.adjustElementsSize(true);
    },
    hidden: function hidden() {
      var selection = this.getSelectedRange();
      var hide = false;

      if (selection === void 0) {
        hide = true;
      } else if (selection.length > 1) {
        hide = true;
      } else if (selection[0].from.col !== selection[0].to.col || selection[0].from.col >= this.getSettings().fixedColumnsLeft) {
        hide = true;
      }

      return hide;
    }
  };
}