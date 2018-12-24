"use strict";

exports.__esModule = true;
exports.default = void 0;

var _element = require("./../helpers/dom/element");

/**
 * Adds appropriate CSS class to table cell, based on cellProperties
 */
function cellDecorator(instance, TD, row, col, prop, value, cellProperties) {
  var classesToAdd = [];
  var classesToRemove = [];

  if (cellProperties.className) {
    if (TD.className) {
      TD.className = "".concat(TD.className, " ").concat(cellProperties.className);
    } else {
      TD.className = cellProperties.className;
    }
  }

  if (cellProperties.readOnly) {
    classesToAdd.push(cellProperties.readOnlyCellClassName);
  }

  if (cellProperties.valid === false && cellProperties.invalidCellClassName) {
    classesToAdd.push(cellProperties.invalidCellClassName);
  } else {
    classesToRemove.push(cellProperties.invalidCellClassName);
  }

  if (cellProperties.wordWrap === false && cellProperties.noWordWrapClassName) {
    classesToAdd.push(cellProperties.noWordWrapClassName);
  }

  if (!value && cellProperties.placeholder) {
    classesToAdd.push(cellProperties.placeholderCellClassName);
  }

  (0, _element.removeClass)(TD, classesToRemove);
  (0, _element.addClass)(TD, classesToAdd);
}

var _default = cellDecorator;
exports.default = _default;