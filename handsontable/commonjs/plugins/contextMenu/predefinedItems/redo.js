"use strict";

exports.__esModule = true;
exports.default = redoItem;
exports.KEY = void 0;

var C = _interopRequireWildcard(require("./../../../i18n/constants"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

var KEY = 'redo';
exports.KEY = KEY;

function redoItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_REDO);
    },
    callback: function callback() {
      this.redo();
    },
    disabled: function disabled() {
      return this.undoRedo && !this.undoRedo.isRedoAvailable();
    }
  };
}