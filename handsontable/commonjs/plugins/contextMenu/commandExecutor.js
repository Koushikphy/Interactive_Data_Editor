"use strict";

exports.__esModule = true;
exports.default = void 0;

var _array = require("./../../helpers/array");

var _object = require("./../../helpers/object");

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/**
 * Command executor for ContextMenu.
 *
 * @class CommandExecutor
 * @plugin ContextMenu
 */
var CommandExecutor =
/*#__PURE__*/
function () {
  function CommandExecutor(hotInstance) {
    _classCallCheck(this, CommandExecutor);

    this.hot = hotInstance;
    this.commands = {};
    this.commonCallback = null;
  }
  /**
   * Register command.
   *
   * @param {String} name Command name.
   * @param {Object} commandDescriptor Command descriptor object with properties like `key` (command id),
   *                                   `callback` (task to execute), `name` (command name), `disabled` (command availability).
   */


  _createClass(CommandExecutor, [{
    key: "registerCommand",
    value: function registerCommand(name, commandDescriptor) {
      this.commands[name] = commandDescriptor;
    }
    /**
     * Set common callback which will be trigger on every executed command.
     *
     * @param {Function} callback Function which will be fired on every command execute.
     */

  }, {
    key: "setCommonCallback",
    value: function setCommonCallback(callback) {
      this.commonCallback = callback;
    }
    /**
     * Execute command by its name.
     *
     * @param {String} commandName Command id.
     * @param {*} params Arguments passed to command task.
     */

  }, {
    key: "execute",
    value: function execute(commandName) {
      var _this = this;

      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      var commandSplit = commandName.split(':');
      var commandNamePrimary = commandSplit[0];
      var subCommandName = commandSplit.length === 2 ? commandSplit[1] : null;
      var command = this.commands[commandNamePrimary];

      if (!command) {
        throw new Error("Menu command '".concat(commandNamePrimary, "' not exists."));
      }

      if (subCommandName && command.submenu) {
        command = findSubCommand(subCommandName, command.submenu.items);
      }

      if (command.disabled === true) {
        return;
      }

      if (typeof command.disabled === 'function' && command.disabled.call(this.hot) === true) {
        return;
      }

      if ((0, _object.hasOwnProperty)(command, 'submenu')) {
        return;
      }

      var callbacks = [];

      if (typeof command.callback === 'function') {
        callbacks.push(command.callback);
      }

      if (typeof this.commonCallback === 'function') {
        callbacks.push(this.commonCallback);
      }

      params.unshift(commandSplit.join(':'));
      (0, _array.arrayEach)(callbacks, function (callback) {
        return callback.apply(_this.hot, params);
      });
    }
  }]);

  return CommandExecutor;
}();

function findSubCommand(subCommandName, subCommands) {
  var command;
  (0, _array.arrayEach)(subCommands, function (cmd) {
    var cmds = cmd.key ? cmd.key.split(':') : null;

    if (Array.isArray(cmds) && cmds[1] === subCommandName) {
      command = cmd;
      return false;
    }
  });
  return command;
}

var _default = CommandExecutor;
exports.default = _default;