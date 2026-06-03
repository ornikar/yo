'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'imports',
  'basicShape',
  'circle',
  'square',
  'bar',
  'borderRadiusRemoved',
  'isLoadingRemoved',
  'propsStripped',
  'alreadyBumper',
  'combined',
];

describe('Skeleton migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
