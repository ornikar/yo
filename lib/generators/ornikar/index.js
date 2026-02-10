'use strict';

const fs = require('node:fs');
const Generator = require('yeoman-generator');

module.exports = class OrnikarGenerator extends Generator {
  default() {
    const pkg = this.fs.readJSON('package.json');
    // don't use this.fs here to avoid precaching the file
    const yarnBerry = fs.existsSync('.yarnrc.yml');

    if (yarnBerry && !pkg.packageManager) {
      throw new Error(
        'yarn berry is not configured correctly, please run `yarn set version stable` and rerun yornikar after',
      );
    }
    const typescript = !!(pkg.devDependencies && pkg.devDependencies.typescript);
    const jest = !!(pkg.devDependencies && pkg.devDependencies.jest);
    const isBrowserProject = !!(pkg.devDependencies && pkg.devDependencies.cypress);
    const isReactNativeProject = !!(pkg.dependencies && pkg.dependencies['react-native']);
    const usesStyledComponents = !!(pkg.dependencies && pkg.dependencies['styled-components']);
    const usesApollo = !!((pkg.dependencies && pkg.dependencies['@apollo/client']) || pkg.devDependencies?.graphql);
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
      yarnBerry,
      typescript,
      jest,
      isBrowserProject,
      isReactNativeProject,
      usesStyledComponents,
      usesApollo,
      searchExcludePaths: searchExcludePaths.join(','),
    });

    this.composeWith(require.resolve('../nvmrc'), {});

    this.composeWith(require.resolve('../circleci'), {});

    this.composeWith(require.resolve('../yarn'), {
      yarnBerry,
    });

    this.composeWith(require.resolve('../packagejson'), {
      yarnBerry,
    });

    this.composeWith(require.resolve('../claude-settings'), {});
  }
};
