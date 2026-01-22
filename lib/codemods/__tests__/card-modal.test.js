'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = ['basic', 'withExpressions', 'wrongOrder'];

describe('CardModal', () => {
  tests.forEach((test) => defineTest(__dirname, 'card-modal', null, `card-modal/${test}`));
});
