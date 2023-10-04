import { createCheckPackage } from 'check-package-dependencies';

await createCheckPackage()
  .checkRecommended({
    onlyWarnsForInDependencies: {
      '@ornikar/lerna-config': {
        missingPeerDependency: ['lerna'],
      },
      'react-codemod': {
        duplicateDirectDependency: ['jscodeshift', 'eslint'],
      },
    },
  })
  .run();
