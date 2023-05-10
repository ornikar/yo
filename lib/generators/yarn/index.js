'use strict';

const yarnParsers = require('@yarnpkg/parsers');
const Generator = require('yeoman-generator');
const { writeAndFormat } = require('../../utils/writeAndFormat');

module.exports = class YarnGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('yarnBerry', {
      type: Boolean,
      required: true,
      desc: 'Uses yarn berry (>=2).',
    });
  }

  initializing() {
    if (this.options.yarnBerry) {
      const pkg = this.fs.readJSON('package.json');

      const { stdout } = this.spawnCommandSync('yarn', ['plugin', 'runtime', '--json'], { stdio: 'pipe' });
      const installedPlugins = stdout.split('\n').map(JSON.parse);

      const isPluginInstalled = (name) => installedPlugins.some((plugin) => plugin.name === name);
      const installPlugin = (nameOrUrl) => {
        this.spawnCommandSync('yarn', ['plugin', 'import', nameOrUrl]);
      };
      const removePlugin = (name) => {
        this.spawnCommandSync('yarn', ['plugin', 'remove', name]);
      };

      const workspacesPluginName = '@yarnpkg/plugin-workspace-tools';
      if (pkg.workspaces) {
        if (!isPluginInstalled(workspacesPluginName)) {
          installPlugin(workspacesPluginName);
        }
      } else if (isPluginInstalled(workspacesPluginName)) {
        removePlugin(workspacesPluginName);
      }

      if (!isPluginInstalled('@yarnpkg/plugin-engines')) {
        installPlugin(
          'https://raw.githubusercontent.com/devoto13/yarn-plugin-engines/main/bundles/%40yarnpkg/plugin-engines.js',
        );
      }
    }
  }

  writing() {
    if (this.options.yarnBerry) {
      this.fs.copyTpl(this.templatePath('yarn_gitignore.ejs'), this.destinationPath('.yarn/.gitignore'), {});

      const configString = this.fs.read('.yarnrc.yml');
      const config = yarnParsers.parseSyml(configString);
      config.enableMessageNames = false;
      config.nodeLinker = 'node-modules';
      config.npmRegistryServer = 'https://registry.npmjs.org';
      writeAndFormat(this.fs, '.yarnrc.yml', yarnParsers.stringifySyml(config));
    }
  }

  end() {
    if (this.options.yarnBerry) {
      this.spawnCommandSync('yarn', ['install']);
      this.spawnCommandSync('yarn', ['dedupe']);
    } else {
      this.spawnCommandSync('yarn', ['install']);
    }
  }
};
