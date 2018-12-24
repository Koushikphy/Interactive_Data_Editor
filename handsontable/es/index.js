import '@babel/polyfill/lib/noConflict';
import { getRegisteredEditorNames, registerEditor, getEditor } from './editors';
import { getRegisteredRendererNames, getRenderer, registerRenderer } from './renderers';
import { getRegisteredValidatorNames, getValidator, registerValidator } from './validators';
import { getRegisteredCellTypeNames, getCellType, registerCellType } from './cellTypes';
import Core from './core';
import jQueryWrapper from './helpers/wrappers/jquery';
import EventManager, { getListenersCounter } from './eventManager';
import Hooks from './pluginHooks';
import GhostTable from './utils/ghostTable';
import * as arrayHelpers from './helpers/array';
import * as browserHelpers from './helpers/browser';
import * as dataHelpers from './helpers/data';
import * as dateHelpers from './helpers/date';
import * as featureHelpers from './helpers/feature';
import * as functionHelpers from './helpers/function';
import * as mixedHelpers from './helpers/mixed';
import * as numberHelpers from './helpers/number';
import * as objectHelpers from './helpers/object';
import * as settingHelpers from './helpers/setting';
import * as stringHelpers from './helpers/string';
import * as unicodeHelpers from './helpers/unicode';
import * as domHelpers from './helpers/dom/element';
import * as domEventHelpers from './helpers/dom/event';
import * as plugins from './plugins/index';
import { registerPlugin } from './plugins';
import DefaultSettings from './defaultSettings';
import { rootInstanceSymbol } from './utils/rootInstance';
import { getTranslatedPhrase } from './i18n';
import * as constants from './i18n/constants';
import { registerLanguageDictionary, getLanguagesDictionaries, getLanguageDictionary } from './i18n/dictionariesManager';

function Handsontable(rootElement, userSettings) {
  var instance = new Core(rootElement, userSettings || {}, rootInstanceSymbol);
  instance.init();
  return instance;
}

jQueryWrapper(Handsontable);
Handsontable.Core = Core;
Handsontable.DefaultSettings = DefaultSettings;
Handsontable.EventManager = EventManager;
Handsontable._getListenersCounter = getListenersCounter; // For MemoryLeak tests

Handsontable.buildDate = "19/12/2018 13:16:54";
Handsontable.packageName = "handsontable";
Handsontable.version = "6.2.2";
var baseVersion = "";

if (baseVersion) {
  Handsontable.baseVersion = baseVersion;
} // Export Hooks singleton


Handsontable.hooks = Hooks.getSingleton(); // TODO: Remove this exports after rewrite tests about this module

Handsontable.__GhostTable = GhostTable; //
// Export all helpers to the Handsontable object

var HELPERS = [arrayHelpers, browserHelpers, dataHelpers, dateHelpers, featureHelpers, functionHelpers, mixedHelpers, numberHelpers, objectHelpers, settingHelpers, stringHelpers, unicodeHelpers];
var DOM = [domHelpers, domEventHelpers];
Handsontable.helper = {};
Handsontable.dom = {}; // Fill general helpers.

arrayHelpers.arrayEach(HELPERS, function (helper) {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), function (key) {
    if (key.charAt(0) !== '_') {
      Handsontable.helper[key] = helper[key];
    }
  });
}); // Fill DOM helpers.

arrayHelpers.arrayEach(DOM, function (helper) {
  arrayHelpers.arrayEach(Object.getOwnPropertyNames(helper), function (key) {
    if (key.charAt(0) !== '_') {
      Handsontable.dom[key] = helper[key];
    }
  });
}); // Export cell types.

Handsontable.cellTypes = {};
arrayHelpers.arrayEach(getRegisteredCellTypeNames(), function (cellTypeName) {
  Handsontable.cellTypes[cellTypeName] = getCellType(cellTypeName);
});
Handsontable.cellTypes.registerCellType = registerCellType;
Handsontable.cellTypes.getCellType = getCellType; // Export all registered editors from the Handsontable.

Handsontable.editors = {};
arrayHelpers.arrayEach(getRegisteredEditorNames(), function (editorName) {
  Handsontable.editors["".concat(stringHelpers.toUpperCaseFirst(editorName), "Editor")] = getEditor(editorName);
});
Handsontable.editors.registerEditor = registerEditor;
Handsontable.editors.getEditor = getEditor; // Export all registered renderers from the Handsontable.

Handsontable.renderers = {};
arrayHelpers.arrayEach(getRegisteredRendererNames(), function (rendererName) {
  var renderer = getRenderer(rendererName);

  if (rendererName === 'base') {
    Handsontable.renderers.cellDecorator = renderer;
  }

  Handsontable.renderers["".concat(stringHelpers.toUpperCaseFirst(rendererName), "Renderer")] = renderer;
});
Handsontable.renderers.registerRenderer = registerRenderer;
Handsontable.renderers.getRenderer = getRenderer; // Export all registered validators from the Handsontable.

Handsontable.validators = {};
arrayHelpers.arrayEach(getRegisteredValidatorNames(), function (validatorName) {
  Handsontable.validators["".concat(stringHelpers.toUpperCaseFirst(validatorName), "Validator")] = getValidator(validatorName);
});
Handsontable.validators.registerValidator = registerValidator;
Handsontable.validators.getValidator = getValidator; // Export all registered plugins from the Handsontable.

Handsontable.plugins = {};
arrayHelpers.arrayEach(Object.getOwnPropertyNames(plugins), function (pluginName) {
  var plugin = plugins[pluginName];

  if (pluginName === 'Base') {
    Handsontable.plugins["".concat(pluginName, "Plugin")] = plugin;
  } else {
    Handsontable.plugins[pluginName] = plugin;
  }
});
Handsontable.plugins.registerPlugin = registerPlugin;
Handsontable.languages = {};
Handsontable.languages.dictionaryKeys = constants;
Handsontable.languages.getLanguageDictionary = getLanguageDictionary;
Handsontable.languages.getLanguagesDictionaries = getLanguagesDictionaries;
Handsontable.languages.registerLanguageDictionary = registerLanguageDictionary; // Alias to `getTranslatedPhrase` function, for more information check it API.

Handsontable.languages.getTranslatedPhrase = function () {
  return getTranslatedPhrase.apply(void 0, arguments);
};

export default Handsontable;