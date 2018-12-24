"use strict";

exports.__esModule = true;
exports.default = void 0;

var _editors = require("./../editors");

var _renderers = require("./../renderers");

var _validators = require("./../validators");

var CELL_TYPE = 'numeric';
var _default = {
  editor: (0, _editors.getEditor)(CELL_TYPE),
  renderer: (0, _renderers.getRenderer)(CELL_TYPE),
  validator: (0, _validators.getValidator)(CELL_TYPE),
  dataType: 'number'
};
exports.default = _default;