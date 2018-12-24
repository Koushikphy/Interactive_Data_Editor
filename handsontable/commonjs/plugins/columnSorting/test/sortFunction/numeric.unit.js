"use strict";

var _numeric = require("handsontable/plugins/columnSorting/sortFunction/numeric");

it('numericSort comparing function shouldn\'t change order when comparing empty string, null and undefined', function () {
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(null, null)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(null, null)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})('', '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})('', '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})('', null)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})('', null)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(null, '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(null, '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})('', undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})('', undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('asc', {}, {})(undefined, null)).toEqual(0);
  expect((0, _numeric.compareFunctionFactory)('desc', {}, {})(undefined, null)).toEqual(0);
});