"use strict";

exports.__esModule = true;
exports.default = void 0;

require("@babel/polyfill/lib/noConflict");

var _editors = require("./editors");

var _renderers = require("./renderers");

var _validators = require("./validators");

var _cellTypes = require("./cellTypes");

var _core = _interopRequireDefault(require("./core"));

var _jquery = _interopRequireDefault(require("./helpers/wrappers/jquery"));

var _eventManager = _interopRequireWildcard(require("./eventManager"));

var _pluginHooks = _interopRequireDefault(require("./pluginHooks"));

var _ghostTable = _interopRequireDefault(require("./utils/ghostTable"));

var arrayHelpers = _interopRequireWildcard(require("./helpers/array"));

var browserHelpers = _interopRequireWildcard(require("./helpers/browser"));

var dataHelpers = _interopRequireWildcard(require("./helpers/data"));

var dateHelpers = _interopRequireWildcard(require("./helpers/date"));

var featureHelpers = _interopRequireWildcard(require("./helpers/feature"));

var functionHelpers = _interopRequireWildcard(require("./helpers/function"));

var mixedHelpers = _interopRequireWildcard(require("./helpers/mixed"));

var numberHelpers = _interopRequireWildcard(require("./helpers/number"));

var objectHelpers = _interopRequireWildcard(require("./helpers/object"));

var settingHelpers = _interopRequireWildcard(require("./helpers/setting"));

var stringHelpers = _interopRequireWildcard(require("./helpers/string"));

var unicodeHelpers = _interopRequireWildcard(require("./helpers/unicode"));

var domHelpers = _interopRequireWildcard(require("./helpers/dom/element"));

var domEventHelpers = _interopRequireWildcard(require("./helpers/dom/event"));

var plugins = _interopRequireWildcard(require("./plugins/index"));

var _plugins = require("./plugins");

var _defaultSettings = _interopRequireDefault(require("./defaultSettings"));

var _rootInstance = require("./utils/rootInstance");

var _i18n = require("./i18n");

var constants = _interopRequireWildcard(require("./i18n/constants"));

var _dictionariesManager = require("./i18n/dictionariesManager");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function Handsontable(rootElement, userSettings) {
  var instance = new _core.default(rootElement, userSettings || {}, _rootInstance.rootInstanceSymbol);
  instance.init();
  return instance;
}

(0, _jquery.default)(Handsontable);
Handsontable.Core = _core.default;
Handsontable.DefaultSettings = _defaultSettings.default;
Handsontable.EventManager = _eventManager.default;
Handsontable._getListenersCounter = _eventManager.getListenersCounter; // For MemoryLeak tests

Handsontable.buildDate = "19/12/2018 13:16:42";
Handsontable.packageName = "handsontable";
Handsontable.version = "6.2.2";
var baseVersion = "";

if (baseVersion) {
  Handsontable.baseVersion = baseVersion;
} // Export Hooks singleton


Handsontable.hooks = _pluginHooks.default.getSingleton(); // TODO: Remove this exports after rewrite tests about this module

Handsontable.__GhostTable = _ghostTable.default; //
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
arrayHelpers.arrayEach((0, _cellTypes.getRegisteredCellTypeNames)(), function (cellTypeName) {
  Handsontable.cellTypes[cellTypeName] = (0, _cellTypes.getCellType)(cellTypeName);
});
Handsontable.cellTypes.registerCellType = _cellTypes.registerCellType;
Handsontable.cellTypes.getCellType = _cellTypes.getCellType; // Export all registered editors from the Handsontable.

Handsontable.editors = {};
arrayHelpers.arrayEach((0, _editors.getRegisteredEditorNames)(), function (editorName) {
  Handsontable.editors["".concat(stringHelpers.toUpperCaseFirst(editorName), "Editor")] = (0, _editors.getEditor)(editorName);
});
Handsontable.editors.registerEditor = _editors.registerEditor;
Handsontable.editors.getEditor = _editors.getEditor; // Export all registered renderers from the Handsontable.

Handsontable.renderers = {};
arrayHelpers.arrayEach((0, _renderers.getRegisteredRendererNames)(), function (rendererName) {
  var renderer = (0, _renderers.getRenderer)(rendererName);

  if (rendererName === 'base') {
    Handsontable.renderers.cellDecorator = renderer;
  }

  Handsontable.renderers["".concat(stringHelpers.toUpperCaseFirst(rendererName), "Renderer")] = renderer;
});
Handsontable.renderers.registerRenderer = _renderers.registerRenderer;
Handsontable.renderers.getRenderer = _renderers.getRenderer; // Export all registered validators from the Handsontable.

Handsontable.validators = {};
arrayHelpers.arrayEach((0, _validators.getRegisteredValidatorNames)(), function (validatorName) {
  Handsontable.validators["".concat(stringHelpers.toUpperCaseFirst(validatorName), "Validator")] = (0, _validators.getValidator)(validatorName);
});
Handsontable.validators.registerValidator = _validators.registerValidator;
Handsontable.validators.getValidator = _validators.getValidator; // Export all registered plugins from the Handsontable.

Handsontable.plugins = {};
arrayHelpers.arrayEach(Object.getOwnPropertyNames(plugins), function (pluginName) {
  var plugin = plugins[pluginName];

  if (pluginName === 'Base') {
    Handsontable.plugins["".concat(pluginName, "Plugin")] = plugin;
  } else {
    Handsontable.plugins[pluginName] = plugin;
  }
});
Handsontable.plugins.registerPlugin = _plugins.registerPlugin;
Handsontable.languages = {};
Handsontable.languages.dictionaryKeys = constants;
Handsontable.languages.getLanguageDictionary = _dictionariesManager.getLanguageDictionary;
Handsontable.languages.getLanguagesDictionaries = _dictionariesManager.getLanguagesDictionaries;
Handsontable.languages.registerLanguageDictionary = _dictionariesManager.registerLanguageDictionary; // Alias to `getTranslatedPhrase` function, for more information check it API.

Handsontable.languages.getTranslatedPhrase = function () {
  return _i18n.getTranslatedPhrase.apply(void 0, arguments);
};

var _default = Handsontable;
exports.default = _default;