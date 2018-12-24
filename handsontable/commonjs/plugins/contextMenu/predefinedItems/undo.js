"use strict";

exports.__esModule = true;
exports.default = undoItem;
exports.KEY = void 0;

var C = _interopRequireWildcard(require("./../../../i18n/constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var KEY = 'undo';
exports.KEY = KEY;

function undoItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_UNDO);
    },
    callback: function callback() {
      this.undo();
    },
    disabled: function disabled() {
      return this.undoRedo && !this.undoRedo.isUndoAvailable();
    }
  };
}