'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = ['default', 'decorator', 'parameters', 'multiple-add'];

describe('CSF1-CSF2 Migration', () => {
  tests.forEach((test) => defineTest(__dirname, 'csf1-csf2', null, `csf1-csf2/${test}`, { parser: 'tsx' }));
});
