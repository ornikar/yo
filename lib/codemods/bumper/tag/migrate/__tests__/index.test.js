'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'basic',
  'colorValues',
  'deepPurple',
  'sizeValues',
  'withWhiteBorder',
  'dynamicColor',
  'dynamicSize',
  'imports',
  'spread',
  'alreadyBumper',
];

describe('Tag migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
