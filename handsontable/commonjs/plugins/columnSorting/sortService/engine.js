"use strict";

exports.__esModule = true;
exports.sort = sort;
exports.FIRST_AFTER_SECOND = exports.FIRST_BEFORE_SECOND = exports.DO_NOT_SWAP = void 0;

var _mergeSort = _interopRequireDefault(require("../../../utils/sortingAlgorithms/mergeSort"));

var _registry = require("./registry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DO_NOT_SWAP = 0;
exports.DO_NOT_SWAP = DO_NOT_SWAP;
var FIRST_BEFORE_SECOND = -1;
exports.FIRST_BEFORE_SECOND = FIRST_BEFORE_SECOND;
var FIRST_AFTER_SECOND = 1;
exports.FIRST_AFTER_SECOND = FIRST_AFTER_SECOND;

function sort(indexesWithData, rootComparatorId) {
  var rootComparator = (0, _registry.getRootComparator)(rootComparatorId);

  for (var _len = arguments.length, argsForRootComparator = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    argsForRootComparator[_key - 2] = arguments[_key];
  }

  (0, _mergeSort.default)(indexesWithData, rootComparator.apply(void 0, argsForRootComparator));
}