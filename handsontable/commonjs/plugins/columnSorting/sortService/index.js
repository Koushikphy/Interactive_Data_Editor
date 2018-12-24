"use strict";

exports.__esModule = true;

var _registry = require("./registry");

exports.registerRootComparator = _registry.registerRootComparator;
exports.getRootComparator = _registry.getRootComparator;
exports.getCompareFunctionFactory = _registry.getCompareFunctionFactory;

var _engine = require("./engine");

exports.FIRST_AFTER_SECOND = _engine.FIRST_AFTER_SECOND;
exports.FIRST_BEFORE_SECOND = _engine.FIRST_BEFORE_SECOND;
exports.DO_NOT_SWAP = _engine.DO_NOT_SWAP;
exports.sort = _engine.sort;