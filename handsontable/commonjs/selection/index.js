"use strict";

exports.__esModule = true;

var _highlight = _interopRequireDefault(require("./highlight/highlight"));

exports.Highlight = _highlight.default;

var _selection = _interopRequireDefault(require("./selection"));

exports.Selection = _selection.default;

var _mouseEventHandler = require("./mouseEventHandler");

exports.handleMouseEvent = _mouseEventHandler.handleMouseEvent;

var _utils = require("./utils");

exports.detectSelectionType = _utils.detectSelectionType;
exports.normalizeSelectionFactory = _utils.normalizeSelectionFactory;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }