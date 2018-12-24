"use strict";

exports.__esModule = true;
exports.default = void 0;

var _editors = require("./../editors");

var _renderers = require("./../renderers");

var CELL_TYPE = 'checkbox';
var _default = {
  editor: (0, _editors.getEditor)(CELL_TYPE),
  renderer: (0, _renderers.getRenderer)(CELL_TYPE)
};
exports.default = _default;