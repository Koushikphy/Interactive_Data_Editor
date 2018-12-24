"use strict";

var _date = require("handsontable/plugins/columnSorting/sortFunction/date");

it('dateSort comparing function shouldn\'t change order when comparing empty string, null and undefined', function () {
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(null, null)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(null, null)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})('', '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})('', '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(undefined, undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})('', null)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})('', null)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(null, '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(null, '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})('', undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})('', undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(undefined, '')).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(null, undefined)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('asc', {}, {})(undefined, null)).toEqual(0);
  expect((0, _date.compareFunctionFactory)('desc', {}, {})(undefined, null)).toEqual(0);
});