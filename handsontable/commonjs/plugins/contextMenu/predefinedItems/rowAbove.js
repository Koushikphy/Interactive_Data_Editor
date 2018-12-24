"use strict";

exports.__esModule = true;
exports.default = rowAboveItem;
exports.KEY = void 0;

var _utils = require("./../utils");

var C = _interopRequireWildcard(require("./../../../i18n/constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var KEY = 'row_above';
exports.KEY = KEY;

function rowAboveItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_ROW_ABOVE);
    },
    callback: function callback(key, normalizedSelection) {
      var latestSelection = normalizedSelection[Math.max(normalizedSelection.length - 1, 0)];
      this.alter('insert_row', latestSelection.start.row, 1, 'ContextMenu.rowAbove');
    },
    disabled: function disabled() {
      var selected = (0, _utils.getValidSelection)(this);

      if (!selected) {
        return true;
      }

      return this.selection.isSelectedByColumnHeader() || this.countRows() >= this.getSettings().maxRows;
    },
    hidden: function hidden() {
      return !this.getSettings().allowInsertRow;
    }
  };
}