'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'basic',
  'imports',
  'componentRename',
  'colorMapping',
  'variantValues',
  'responsiveShorthand',
  'responsiveTypeObject',
  'booleanProps',
  'platformProps',
  'iconProps',
];

describe('Typography migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
