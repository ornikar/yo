'use strict';

const Generator = require('yeoman-generator');
const { copyAndFormatTpl } = require('../../utils/writeAndFormat');


module.exports = class VscodeGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('yarn2', {
      type: Boolean,
      required: true,
      desc: 'Uses yarn 2.',
    });

    this.option('typescript', {
      type: Boolean,
      required: true,
      desc: 'Typescript enabled',
    });

    this.option('isBrowserProject', {
      type: Boolean,
      required: true,
      desc: 'Uses browser',
    });

    this.option('usesStyledComponents', {
      type: Boolean,
      required: true,
      desc: 'Uses styled-components',
    });

    this.option('usesApollo', {
      type: Boolean,
      required: true,
      desc: 'Uses apollo',
    });
  }

  writing() {
    copyAndFormatTpl(
      this.fs,
      this.templatePath('extensions.json.ejs'),
      this.destinationPath('.vscode/extensions.json'),
      {
        yarn2: this.options.yarn2,
        // recommendDebuggers: this.options.isBrowserProject,
        recommendStyledComponents: this.options.usesStyledComponents,
        recommendApollo: this.options.usesApollo,
      },
    );

    copyAndFormatTpl(
      this.fs,
      this.templatePath('settings.json.ejs'),
      this.destinationPath('.vscode/settings.json'),
      {
        yarn2: this.options.yarn2,
        typescript: this.options.typescript,
        searchExcludePaths: this.options.searchExcludePaths.split(',').filter(Boolean),
      },
    );
  }
}