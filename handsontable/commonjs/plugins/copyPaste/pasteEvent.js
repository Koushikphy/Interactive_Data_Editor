"use strict";

exports.__esModule = true;
exports.default = void 0;

var _clipboardData = _interopRequireDefault(require("./clipboardData"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PasteEvent = function PasteEvent() {
  _classCallCheck(this, PasteEvent);

  this.clipboardData = new _clipboardData.default();
};

exports.default = PasteEvent;