import mergeSort from '../../../utils/sortingAlgorithms/mergeSort';
import { getRootComparator } from './registry';
export var DO_NOT_SWAP = 0;
export var FIRST_BEFORE_SECOND = -1;
export var FIRST_AFTER_SECOND = 1;
export function sort(indexesWithData, rootComparatorId) {
  var rootComparator = getRootComparator(rootComparatorId);

  for (var _len = arguments.length, argsForRootComparator = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    argsForRootComparator[_key - 2] = arguments[_key];
  }

  mergeSort(indexesWithData, rootComparator.apply(void 0, argsForRootComparator));
}