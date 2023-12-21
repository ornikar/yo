'use strict';

const path = require('node:path');
const { getSyncPackageLocations } = require('@ornikar/monorepo-config');
const Generator = require('yeoman-generator');
const { minimumNodeVersion } = require('../../config/nodeVersions');
const { sortObject } = require('../../utils/sortObject');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

function removeOldDependencies(pkg) {
  if (pkg.devDependencies) {
    delete pkg.devDependencies.chromatic; // see https://github.com/ornikar/orb-frontend/pull/98

    if (pkg.devDependencies['@ornikar/lerna-config']) {
      pkg.devDependencies['@ornikar/monorepo-config'] = '12.0.1';
      delete pkg.devDependencies['@ornikar/lerna-config'];
    }
  }
}

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
    const pkg = this.fs.readJSON('package.json', {});
    const previousEngines = pkg.engines;

    pkg.engines = {
      node: minimumNodeVersion,
    };

    if (previousEngines?.vscode) {
      pkg.engines.vscode = previousEngines.vscode;
    }

    if (!this.options.yarnBerry) {
      pkg.engines.yarn = '>=1.22.15';
    }

    pkg.scripts = {
      ...pkg.scripts,
      'lint:prettier': "prettier --no-error-on-unmatched-pattern --check . '**/.env*' '**/*.env'",
      'lint:prettier:fix': "prettier --no-error-on-unmatched-pattern --write . '**/.env*' '**/*.env'",
      'lint:eslint:fix': 'yarn lint:eslint --fix',
    };

    removeOldDependencies(pkg);
    sortObject(pkg.scripts);

    writeAndFormatJson(this.fs, 'package.json', pkg);

    if (!pkg.repository) {
      console.log('"repository" field is missing. You can set something like `"repository": "ornikar/vitrine"`');
    } else if (pkg.workspaces) {
      const packageLocations = getSyncPackageLocations({ pkg });

      packageLocations.forEach((packageLocation) => {
        const pkgJsonPackageLocation = `${packageLocation}/package.json`;
        const wpkg = this.fs.readJSON(pkgJsonPackageLocation);

        wpkg.engines = {
          node: minimumNodeVersion,
        };
        wpkg.repository = {
          directory: packageLocation,
          type: 'git',
          url: pkg.repository.startsWith('http') ? pkg.repository : `https://github.com/${pkg.repository}.git`,
        };

        wpkg.scripts = {
          ...wpkg.scripts,
          'lint:eslint': `yarn ../.. eslint --report-unused-disable-directives --quiet ${packageLocation}`,
        };

        removeOldDependencies(wpkg);

        if (pkg?.devDependencies?.['@ornikar/rollup-config']) {
          if (wpkg.private) {
            delete wpkg.exports;
          } else if (wpkg.name !== '@ornikar/kitt') {
            const hasPeerDependencyReactNative = !!(wpkg.peerDependencies && wpkg.peerDependencies['react-native']);

            // Read more about exports here: https://ornikar.atlassian.net/wiki/spaces/TECH/pages/3402531190/How+to+configure+library+exports#%E2%80%9Cexports%E2%80%9D
            wpkg.exports = {};

            const { entries = ['index'], extraEntries = [] } = wpkg.ornikar || {};

            const rollupNodeVersion = '20.10';

            // currently used by metro, and supports suffixes (ios, android)
            // when migrating to exports, delete both "browser" and "react-native" here instead (used in kitt-universal for temp fix)
            if (!entries || entries.length === 1) {
              wpkg.browser = `./dist/${entries[0]}.es`;
              wpkg.main = `./dist/${entries[0]}-node-${rollupNodeVersion}.es.${pkg.type === 'module' ? 'js' : 'mjs'}`;
            } else if (entries.length === 0) {
              delete wpkg.browser;
            } else {
              wpkg.browser = Object.fromEntries(
                entries.map((entryName) => {
                  const entryPath = entryName === 'index' ? '.' : `./${entryName}`;
                  return [entryPath, `./dist/${entryName}.es`];
                }),
              );

              if (entries.includes('index')) {
                wpkg.main = `./dist/${entries[0]}-node-${rollupNodeVersion}.es.${pkg.type === 'module' ? 'js' : 'mjs'}`;
              } else {
                delete wpkg.main;
              }
            }

            entries.forEach((entryName) => {
              const entryPath = entryName === 'index' ? '.' : `./${entryName}`;
              wpkg.exports[entryPath] = {
                types: `./dist/definitions/${entryName}.d.ts`,
                node: {
                  import: `./dist/${entryName}-node-${rollupNodeVersion}.es.${pkg.type === 'module' ? 'js' : 'mjs'}`,
                  require: `./dist/${entryName}-node-${rollupNodeVersion}.cjs.${pkg.type === 'module' ? 'cjs' : 'js'}`,
                },
                'react-native': {
                  jest: `./dist/${entryName}-node-${rollupNodeVersion}.cjs.js`,
                },
                browser: {
                  import: `./dist/${entryName}.es${hasPeerDependencyReactNative ? '.web' : ''}.js`,
                },
              };

              // temp fix for linaria-themes. Linaria creates a new context inside webpack bundler and parse/eval the code in cjs format
              if (entryPath === './linaria-themes') {
                wpkg.exports[entryPath].browser.require = `./dist/${entryName}-node-${rollupNodeVersion}.cjs.js`;
              }

              if (hasPeerDependencyReactNative) {
                wpkg.exports[entryPath].node = {
                  web: {
                    require: `./dist/${entryName}-node-${rollupNodeVersion}.cjs.web.js`,
                    import: `./dist/${entryName}-node-${rollupNodeVersion}.es.web.mjs`,
                  },
                  ...wpkg.exports[entryPath].node,
                };

                // https://github.com/facebook/metro/issues/670#issuecomment-1610475827
                // wpkg.exports[entryPath]['react-native'] = {
                // };
              }
            });
            if (hasPeerDependencyReactNative) {
              // https://github.com/facebook/metro/issues/670#issuecomment-1610475827
              // change to "delete wpkg['react-native'];" when react-native exports is used
              wpkg['react-native'] = './dist/index-metro.es';
            }
            wpkg.exports['./package.json'] = './package.json';

            extraEntries.forEach((entryName) => {
              if (entryName === '.') {
                wpkg.exports[entryName] = './index.js';
              } else if (entryName.endsWith('.{mjs,cjs}')) {
                const filepathWithoutExt = entryName.slice(0, -'.{mjs,cjs}'.length);
                wpkg.exports[filepathWithoutExt] = {
                  types: `${filepathWithoutExt}.d.ts`,
                  import: `${filepathWithoutExt}.mjs`,
                  require: `${filepathWithoutExt}.cjs`,
                };
              } else {
                const extName = path.extname(entryName);
                wpkg.exports[entryName] = extName ? entryName : `${entryName}.js`;
              }
            });
          }
        }

        sortObject(wpkg.scripts);

        writeAndFormatJson(this.fs, pkgJsonPackageLocation, wpkg);
      });
    }
  }
};
