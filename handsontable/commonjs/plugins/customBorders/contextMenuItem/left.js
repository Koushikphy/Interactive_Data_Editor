"use strict";

exports.__esModule = true;
exports.default = left;

var C = _interopRequireWildcard(require("./../../../i18n/constants"));

var _utils = require("./../utils");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function left(customBordersPlugin) {
  return {
    key: 'borders:left',
    name: function name() {
      var label = this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_BORDERS_LEFT);
      var hasBorder = (0, _utils.checkSelectionBorders)(this, 'left');

      if (hasBorder) {
        label = (0, _utils.markSelected)(label);
      }

      return label;
    },
    callback: function callback(key, selected) {
      var hasBorder = (0, _utils.checkSelectionBorders)(this, 'left');
      customBordersPlugin.prepareBorder(selected, 'left', hasBorder);
    }
  };
}