'use strict';

const Generator = require('yeoman-generator');

module.exports = class OrnikarGenerator extends Generator {
  default() {
    const pkg = this.fs.readJSON('package.json');
    const yarn2 = this.fs.exists('.yarnrc.yml');
    const typescript = !!(pkg.devDependencies && pkg.devDependencies.typescript);
    const isBrowserProject = !!(pkg.devDependencies && pkg.devDependencies.cypress);
    const searchExcludePaths = [];
    if (pkg.devDependencies) {
      if (pkg.devDependencies.jest || pkg.devDependencies['@ornikar/jest-config-react']) {
        searchExcludePaths.push('**/*.js.snap');
      }
      if (pkg.devDependencies['react-scripts']) {
        searchExcludePaths.push('**/build');
      }

      if (pkg.devDependencies['@storybook/react']) {
        searchExcludePaths.push('**/storybook-static');
      }
    }

    this.composeWith(require.resolve('../vscode'), {
      yarn2: yarn2,
      typescript: typescript,
      isBrowserProject,
      searchExcludePaths: searchExcludePaths.join(','),
    });
  }
}