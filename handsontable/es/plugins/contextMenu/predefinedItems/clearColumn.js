function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { getValidSelection } from './../utils';
import * as C from './../../../i18n/constants';
export var KEY = 'clear_column';
export default function clearColumnItem() {
  return {
    key: KEY,
    name: function name() {
      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_CLEAR_COLUMN);
    },
    callback: function callback(key, selection) {
      var column = selection[0].start.col;

      if (this.countRows()) {
        this.populateFromArray(0, column, [[null]], Math.max(selection[0].start.row, selection[0].end.row), column, 'ContextMenu.clearColumn');
      }
    },
    disabled: function disabled() {
      var selected = getValidSelection(this);

      if (!selected) {
        return true;
      }

      var _selected$ = _slicedToArray(selected[0], 3),
          startRow = _selected$[0],
          startColumn = _selected$[1],
          endRow = _selected$[2];

      var entireRowSelection = [startRow, 0, endRow, this.countCols() - 1];
      var rowSelected = entireRowSelection.join(',') === selected.join(',');
      return startColumn < 0 || this.countCols() >= this.getSettings().maxCols || rowSelected;
    }
  };
}