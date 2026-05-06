'use strict';

jest.autoMockOff();
const { defineTest } = require('jscodeshift/dist/testUtils');

const tests = [
  'imports',
  'nakedChildren',
  'multipleNakedChildren',
  'withLeftProp',
  'withRightProp',
  'withLeftAndRightProps',
  'withBordersBottom',
  'withBordersTop',
  'withBordersBoth',
  'withPadding',
  'withOnPress',
  'onPressWithEvent',
  'accessibilityRoleButtonWithOnPress',
  'accessibilityRoleButtonWithoutOnPress',
  'accessibilityRoleOther',
  'contentSubcomponent',
  'sideContentLeftCenter',
  'sideContentRightCenter',
  'sideContentNonCenter',
  'sideContainerLeftSingle',
  'sideContainerLeftMultiple',
  'sideContainerRightSingle',
  'sideContainerRightMultiple',
  'multipleLeftSideContent',
  'mixedNakedAndSlots',
  'viewPropsSpread',
  'backgroundColor',
  'importsCleanup',
  'styledListItem',
  'alreadyBumper',
];

describe('ListItem migration (kitt-universal → bumper)', () => {
  tests.forEach((test) => defineTest(__dirname, 'index', null, test));
});
