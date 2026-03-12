'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = ['basic', 'withExpressions', 'wrongOrder'];

describe('NavigationModal', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
