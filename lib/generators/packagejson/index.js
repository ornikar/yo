'use strict';

const { getSyncPackageLocations } = require('@ornikar/lerna-config');
const Generator = require('yeoman-generator');
const { sortObject } = require('../../utils/sortObject');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

module.exports = class PackageJsonGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('yarnBerry', {
      type: Boolean,
      required: true,
      desc: 'Uses yarn berry (>=2).',
    });
  }

  writing() {
    const pkg = this.fs.readJSON('package.json');

    pkg.engines = {
      node: '>=16.10.0',
    };

    if (!this.options.yarnBerry) {
      pkg.engines.yarn = '>=1.22.15';
    }

    pkg.scripts = {
      ...pkg.scripts,
      'lint:prettier': "prettier --no-error-on-unmatched-pattern --check . '**/.env*' '**/*.env'",
      'lint:prettier:fix': "prettier --no-error-on-unmatched-pattern --write . '**/.env*' '**/*.env'",
      'lint:eslint:fix': 'yarn lint:eslint --fix',
    };

    sortObject(pkg.scripts);

    writeAndFormatJson(this.fs, 'package.json', pkg);

    if (!pkg.repository) {
      console.log('"repository" field is missing. You can set something like `"repository": "ornikar/vitrine"`');
    } else if (pkg.workspaces) {
      const packageLocations = getSyncPackageLocations(pkg.workspaces);

      packageLocations.forEach((packageLocation) => {
        const pkgJsonPackageLocation = `${packageLocation}/package.json`;
        const wpkg = this.fs.readJSON(pkgJsonPackageLocation);

        wpkg.repository = {
          directory: packageLocation,
          type: 'git',
          url: pkg.repository.startsWith('http') ? pkg.repository : `https://github.com/${pkg.repository}.git`,
        };

        wpkg.scripts = {
          ...wpkg.scripts,
          'lint:eslint': `yarn ../.. eslint --report-unused-disable-directives --quiet ${packageLocation}`,
        };

        if (pkg?.devDependencies?.['@ornikar/rollup-config']) {
          if (wpkg.private) {
            delete wpkg.exports;
          } else if (wpkg.name !== '@ornikar/kitt') {
            const hasPeerDependencyReactNative = !!(wpkg.peerDependencies && wpkg.peerDependencies['react-native']);
            wpkg.exports = {};

            const { entries = ['index'], extraEntries = [] } = wpkg.ornikar || {};

            // currently used by metro, and supports suffixes (ios, android)
            if (!entries || entries.length === 1) {
              wpkg.browser = `./dist/${entries[0]}-browser-all.es`;
            } else if (entries.length === 0) {
              delete wpkg.browser;
            } else {
              wpkg.browser = Object.fromEntries(
                entries.map((entryName) => {
                  const entryPath = entryName === 'index' ? '.' : `./${entryName}`;
                  return [entryPath, `./dist/${entryName}-browser-all.es`];
                }),
              );
            }

            entries.forEach((entryName) => {
              const entryPath = entryName === 'index' ? '.' : `./${entryName}`;
              wpkg.exports[entryPath] = {
                types: `./dist/definitions/${entryName}.d.ts`,
                node: {
                  require: `./dist/${entryName}-node-14.17.cjs.js`,
                },
                'react-native': {
                  jest: `./dist/${entryName}-node-14.17.cjs.js`,
                },
                browser: {
                  import: `./dist/${entryName}-browser-all.es${hasPeerDependencyReactNative ? '.web' : ''}.js`,
                },
              };

              if (hasPeerDependencyReactNative) {
                wpkg.exports[entryPath].node = {
                  ...wpkg.exports[entryPath].node,
                  web: {
                    require: `./dist/${entryName}-node-14.17.cjs.web.js`,
                  },
                };

                // https://github.com/facebook/metro/issues/670#issuecomment-1610475827
                // wpkg.exports[entryPath]['react-native'] = {
                // };
              }
            });
            wpkg.exports['./package.json'] = './package.json';

            extraEntries.forEach((entryName) => {
              wpkg.exports[entryName] = entryName;
            });
          }
        }

        sortObject(wpkg.scripts);

        writeAndFormatJson(this.fs, pkgJsonPackageLocation, wpkg);
      });
    }
  }
};
