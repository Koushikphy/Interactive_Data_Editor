"use strict";

exports.__esModule = true;
exports.default = void 0;

var _src = require("./../../../3rdparty/walkontable/src");

/**
 * @return {Selection}
 */
function createHighlight(_ref) {
  var activeHeaderClassName = _ref.activeHeaderClassName;
  var s = new _src.Selection({
    highlightHeaderClassName: activeHeaderClassName
  });
  return s;
}

var _default = createHighlight;
exports.default = _default;