'use strict';

const Generator = require('yeoman-generator');

module.exports = class OrnikarGenerator extends Generator {
  default() {
    const pkg = this.fs.readJSON('package.json');
    const yarn2 = this.fs.exists('.yarnrc.yml');
    const typescript = !!(pkg.devDependencies && pkg.devDependencies.typescript);
    const jest = !!(pkg.devDependencies && pkg.devDependencies.jest);
    const isBrowserProject = !!(pkg.devDependencies && pkg.devDependencies.cypress);
    const isReactNativeProject = !!(pkg.dependencies && pkg.dependencies['react-native']);
    const usesStyledComponents = !!(pkg.dependencies && pkg.dependencies['styled-components']);
    const usesApollo = !!(pkg.dependencies && pkg.dependencies['@apollo/client']);
    const searchExcludePaths = [];
    if (pkg.devDependencies) {
      if (
        pkg.devDependencies.jest ||
        pkg.devDependencies['@ornikar/jest-config-react'] ||
        pkg.devDependencies['@ornikar/jest-config-react-native'] ||
        pkg.devDependencies['@ornikar/jest-config-react-native-web']
      ) {
        searchExcludePaths.push('**/*.snap');
      }
      if (pkg.devDependencies['react-scripts']) {
        searchExcludePaths.push('**/build');
      }

      if (pkg.devDependencies['@storybook/react']) {
        searchExcludePaths.push('**/storybook-static');
      }
    }

    this.composeWith(require.resolve('../vscode'), {
      yarn2,
      typescript,
      jest,
      isBrowserProject,
      isReactNativeProject,
      usesStyledComponents,
      usesApollo,
      searchExcludePaths: searchExcludePaths.join(','),
    });
  }
};
