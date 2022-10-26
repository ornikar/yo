'use strict';

const { getSyncPackageLocations } = require('@ornikar/lerna-config');
const Generator = require('yeoman-generator');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

function sortObject(obj) {
  if (typeof obj !== 'object') throw new Error('Invalid object passed');
  const objCopy = { ...obj };
  const objKeys = Object.keys(obj);
  // eslint-disable-next-line no-param-reassign
  objKeys.forEach((key) => delete obj[key]);
  [...objKeys.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()))].forEach((key) => {
    // eslint-disable-next-line no-param-reassign
    obj[key] = objCopy[key];
  });
  return obj;
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
    const pkg = this.fs.readJSON('package.json');

    pkg.engines = {
      node: '16.10.0',
    };

    if (!this.options.yarnBerry) {
      pkg.engines.yarn = '>=1.22.15';
    }

    pkg.scripts = {
      ...pkg.scripts,
      'lint:prettier': '$(yarn bin ornikar-prettier-check)',
      'lint:prettier:fix': '$(yarn bin ornikar-prettier-fix)',
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
        sortObject(wpkg.scripts);

        writeAndFormatJson(this.fs, pkgJsonPackageLocation, wpkg);
      });
    }
  }
};
