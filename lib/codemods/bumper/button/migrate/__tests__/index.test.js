'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'basic',
  'imports',
  'propsRemoval',
  'variantMapping',
  'typeMapping',
  'iconLeft',
  'iconRight',
  'iconOnly',
  'loadingPattern',
  'loadingNoFallback',
  'loadingWithDisabled',
  'responsiveStretch',
  'selfClosing',
  'actionsButton',
  'timerAttrs',
  'alreadyBumper',
  'combined',
];

describe('Button migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
