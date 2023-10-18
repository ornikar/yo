'use strict';

const Generator = require('yeoman-generator');
const { expectedNodeVersion } = require('../../config/nodeVersions');

module.exports = class NvmRCGenerator extends Generator {
  writing() {
    // Note that nvmrc is also updated via the postinstall script in @ornikar/repo-config.
    // Before updating here, update repo-config.
    this.fs.write(this.destinationPath('.nvmrc'), `${expectedNodeVersion}\n`);
  }
};
