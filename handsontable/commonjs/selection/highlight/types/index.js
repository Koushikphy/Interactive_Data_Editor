"use strict";

exports.__esModule = true;
exports.createHighlight = createHighlight;

var _staticRegister2 = _interopRequireDefault(require("./../../../utils/staticRegister"));

var _activeHeader = _interopRequireDefault(require("./activeHeader"));

var _area = _interopRequireDefault(require("./area"));

var _cell = _interopRequireDefault(require("./cell"));

var _customSelection = _interopRequireDefault(require("./customSelection"));

var _fill = _interopRequireDefault(require("./fill"));

var _header = _interopRequireDefault(require("./header"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/prefer-default-export */
var _staticRegister = (0, _staticRegister2.default)('highlight/types'),
    register = _staticRegister.register,
    getItem = _staticRegister.getItem;

register('active-header', _activeHeader.default);
register('area', _area.default);
register('cell', _cell.default);
register('custom-selection', _customSelection.default);
register('fill', _fill.default);
register('header', _header.default);

function createHighlight(highlightType, options) {
  return getItem(highlightType)(options);
}