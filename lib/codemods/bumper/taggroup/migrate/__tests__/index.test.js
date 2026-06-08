'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'directChildren',
  'mapChildren',
  'fragments',
  'conditional',
  'singleChildInline',
  'nonTagChild',
  'noSize',
  'imports',
  'spreadProps',
  'alreadyBumper',
];

describe('TagGroup migration (kitt-universal GroupTags → bumper TagGroup)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
