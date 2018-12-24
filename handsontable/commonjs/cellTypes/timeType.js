"use strict";

exports.__esModule = true;
exports.default = void 0;

var _editors = require("./../editors");

var _renderers = require("./../renderers");

var _validators = require("./../validators");

var CELL_TYPE = 'time';
var _default = {
  editor: (0, _editors.getEditor)('text'),
  // displays small gray arrow on right side of the cell
  renderer: (0, _renderers.getRenderer)('text'),
  validator: (0, _validators.getValidator)(CELL_TYPE)
};
exports.default = _default;