import { createCheckPackage } from 'check-package-dependencies';

await createCheckPackage()
  .checkRecommended({
    onlyWarnsForInDependencies: {
      'react-codemod': {
        duplicateDirectDependency: ['jscodeshift', 'eslint'],
      },
    },
  })
  .run();
