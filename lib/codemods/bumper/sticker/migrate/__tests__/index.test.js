'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'basic',
  'imports',
  'colorRenames',
  'disabledColor',
  'disabledConditional',
  'dynamicColorExpression',
  'stretchProp',
  'alreadyBumper',
  'combined',
];

describe('Sticker migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
