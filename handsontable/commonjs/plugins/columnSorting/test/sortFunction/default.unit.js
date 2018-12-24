"use strict";

var _default = require("handsontable/plugins/columnSorting/sortFunction/default");

it('defaultSort comparing function shouldn\'t change order when comparing empty string, null and undefined', function () {
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(null, null)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(null, null)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})('', '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})('', '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})('', null)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})('', null)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(null, '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(null, '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})('', undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})('', undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('asc', {}, {})(undefined, null)).toEqual(0);
  expect((0, _default.compareFunctionFactory)('desc', {}, {})(undefined, null)).toEqual(0);
});