'use strict';

const { createCheckPackage } = require('check-package-dependencies');

createCheckPackage().checkRecommended({
  onlyWarnsForInDependencies: {
    '@ornikar/lerna-config': {
      missingPeerDependency: ['lerna'],
    },
    'react-codemod': {
      duplicateDirectDependency: ['jscodeshift', 'eslint'],
    },
    'check-package-dependencies': {
      duplicateDirectDependency: ['glob'],
    },
  },
});
