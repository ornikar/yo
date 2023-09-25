'use strict';

const Generator = require('yeoman-generator');
const { expectedNodeVersion } = require('../../config/nodeVersions');

module.exports = class NvmRCGenerator extends Generator {
  writing() {
    this.fs.write(this.destinationPath('.nvmrc'), expectedNodeVersion);
  }
};
