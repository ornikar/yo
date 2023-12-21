'use strict';

const yarnParsers = require('@yarnpkg/parsers');
const { gte } = require('semver');
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

    this.option('useCorepack', {
      type: Boolean,
      default: false,
      required: false,
      desc: 'Use corepack.',
    });
  }

  initializing() {
    if (this.options.yarnBerry) {
      const pkg = this.fs.readJSON('package.json');
      const isYarnGte4 = gte(pkg.packageManager.slice('yarn@'.length), '4.0.0');

      const { stdout } = this.spawnCommandSync('yarn', ['plugin', 'runtime', '--json'], { stdio: 'pipe' });
      const installedPlugins = stdout.split('\n').map(JSON.parse);

      const isPluginInstalled = (name) => installedPlugins.some((plugin) => plugin.name === name);
      const installPlugin = (nameOrUrl) => {
        this.spawnCommandSync('yarn', ['plugin', 'import', nameOrUrl]);
      };
      const removePlugin = (name) => {
        this.spawnCommandSync('yarn', ['plugin', 'remove', name]);
      };

      if (!isYarnGte4) {
        const workspacesPluginName = '@yarnpkg/plugin-workspace-tools';
        if (pkg.workspaces) {
          if (!isPluginInstalled(workspacesPluginName)) {
            installPlugin(workspacesPluginName);
          }
        } else if (isPluginInstalled(workspacesPluginName)) {
          removePlugin(workspacesPluginName);
        }
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
      const pkg = this.fs.readJSON('package.json', {});
      if (
        !pkg.packageManager ||
        !pkg.packageManager.startsWith('yarn@')
        // uncomment to upgrade all repositories to yarn 4
        // || lt(pkg.packageManager.slice('yarn@'.length), '4.0.0')
      ) {
        pkg.packageManager = 'yarn@4.0.0';
      }
      const isYarnGte4 = gte(pkg.packageManager.slice('yarn@'.length), '4.0.0');

      const configString = this.fs.read('.yarnrc.yml');
      const config = yarnParsers.parseSyml(configString);
      const disableYarnGitCache = config.enableGlobalCache === true || config.enableGlobalCache === 'true';

      this.fs.copyTpl(this.templatePath('yarn_gitignore.ejs'), this.destinationPath('.yarn/.gitignore'), {
        disableYarnGitCache,
      });

      if (isYarnGte4) {
        config.compressionLevel = disableYarnGitCache ? 'mixed' : 0;
        config.enableGlobalCache = disableYarnGitCache;
      }
      if (this.options.useCorepack) {
        delete config.yarnPath; // corepack now handles yarn versions
      }
      if (isYarnGte4) {
        delete config.enableMessageNames;
      } else {
        config.enableMessageNames = false;
      }
      config.nodeLinker = 'node-modules';
      config.npmRegistryServer = 'https://registry.npmjs.org';
      config.supportedArchitectures = {
        cpu: ['x64', 'arm64'],
        os: ['linux', 'darwin'],
        // https://ornikar.atlassian.net/wiki/spaces/TECH/pages/3828809729/Expo+49
        libc: ['glibc'],
      };
      delete config.nmMode; // should be configured locally to have no impact on CI.
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
