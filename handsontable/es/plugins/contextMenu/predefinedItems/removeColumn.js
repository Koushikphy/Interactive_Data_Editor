function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { getValidSelection } from './../utils';
import { transformSelectionToColumnDistance } from './../../../selection/utils';
import * as C from './../../../i18n/constants';
export var KEY = 'remove_col';
export default function removeColumnItem() {
  return {
    key: KEY,
    name: function name() {
      var selection = this.getSelected();
      var pluralForm = 0;

      if (selection) {
        if (selection.length > 1) {
          pluralForm = 1;
        } else {
          var _selection$ = _slicedToArray(selection[0], 4),
              fromColumn = _selection$[1],
              toColumn = _selection$[3];

          if (fromColumn - toColumn !== 0) {
            pluralForm = 1;
          }
        }
      }

      return this.getTranslatedPhrase(C.CONTEXTMENU_ITEMS_REMOVE_COLUMN, pluralForm);
    },
    callback: function callback() {
      this.alter('remove_col', transformSelectionToColumnDistance(this.getSelected()), null, 'ContextMenu.removeColumn');
    },
    disabled: function disabled() {
      var selected = getValidSelection(this);
      var totalColumns = this.countCols();

      if (!selected) {
        return true;
      }

      return this.selection.isSelectedByRowHeader() || this.selection.isSelectedByCorner() || !this.isColumnModificationAllowed() || !totalColumns;
    },
    hidden: function hidden() {
      return !this.getSettings().allowRemoveColumn;
    }
  };
}