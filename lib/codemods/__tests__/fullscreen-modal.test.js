'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = ['basic', 'withExpressions', 'wrongOrder'];

describe('FullscreenModal', () => {
  tests.forEach((test) => defineTest(__dirname, 'fullscreen-modal', null, `fullscreen-modal/${test}`));
});
