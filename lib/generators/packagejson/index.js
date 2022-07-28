'use strict';

const { getSyncPackageLocations } = require('@ornikar/lerna-config');
const Generator = require('yeoman-generator');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

module.exports = class PackageJsonGenerator extends Generator {
  writing() {
    const pkg = this.fs.readJSON('package.json');

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

        writeAndFormatJson(this.fs, pkgJsonPackageLocation, wpkg);
      });
    }
  }
};
