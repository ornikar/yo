'use strict';

const { getSyncWorkspaces } = require('@ornikar/monorepo-config');
const createEmojiRegex = require('emoji-regex');
const Generator = require('yeoman-generator');
const { readJSON5 } = require('../../utils/json5');
const { sortObject } = require('../../utils/sortObject');
const { copyAndFormatTpl, writeAndFormatJson } = require('../../utils/writeAndFormat');

const emojiRegex = createEmojiRegex();

const extractEmojis = (description) => {
  if (!description) return '';
  let emojis = '';
  for (const match of description.matchAll(emojiRegex)) {
    if (match && description.startsWith(`${emojis}${match[0]}`)) {
      emojis += match[0];
    } else {
      return emojis;
    }
  }
  return emojis;
};

module.exports = class VscodeGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);

    this.option('yarnBerry', {
      type: Boolean,
      required: true,
      desc: 'Uses yarn berry (>=2).',
    });

    this.option('typescript', {
      type: Boolean,
      required: true,
      desc: 'Typescript enabled',
    });

    this.option('jest', {
      type: Boolean,
      required: true,
      desc: 'jest enabled',
    });

    this.option('isBrowserProject', {
      type: Boolean,
      required: true,
      desc: 'Uses browser',
    });

    this.option('isReactNativeProject', {
      type: Boolean,
      required: true,
      desc: 'Uses react-native',
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
    const pkg = this.fs.readJSON('package.json');

    const enableJestVscode = this.options.jest;

    copyAndFormatTpl(
      this.fs,
      this.templatePath('extensions.json.ejs'),
      this.destinationPath('.vscode/extensions.json'),
      {
        yarnBerry: this.options.yarnBerry,
        yarnPnp: false,
        jest: enableJestVscode,
        reactNative: this.options.isReactNativeProject,
        // recommendDebuggers: this.options.isBrowserProject,
        recommendStyledComponents: this.options.usesStyledComponents,
        recommendApollo: this.options.usesApollo,
      },
    );

    copyAndFormatTpl(this.fs, this.templatePath('settings.json.ejs'), this.destinationPath('.vscode/settings.json'), {
      yarnBerry: this.options.yarnBerry,
      yarnPnp: false,
      typescript: this.options.typescript,
      searchExcludePaths: this.options.searchExcludePaths.split(',').filter(Boolean),
      jestCommandLine: false, // nativeRootConfigExists ? undefined : `node_modules/.bin/jest --config jest.config.native.js`
    });

    const tasksConfig = readJSON5(this.fs, this.destinationPath('.vscode/tasks.json'), {});
    copyAndFormatTpl(this.fs, this.templatePath('tasks.json.ejs'), this.destinationPath('.vscode/tasks.json'), {
      typescript: this.options.typescript,
      tasks: JSON.stringify(tasksConfig.tasks || [], null, 2),
    });

    if (pkg.workspaces) {
      const projectName = pkg.name.replace('@ornikar/', '');
      const workspaces = getSyncWorkspaces({ pkg }).slice(1);

      const folders = workspaces.map(({ pkg: wpkg, location }) => ({
        ...wpkg,
        location,
        name: `${extractEmojis(wpkg.description)} ${wpkg.name.replace(/^@ornikar\//, '')}`.trim(),
        packageName: wpkg.name,
      }));
      folders.sort((a, b) => a.packageName.localeCompare(b.packageName, 'en'));

      const extensions = readJSON5(this.fs, this.destinationPath('.vscode/extensions.json'), {});
      const settings = readJSON5(this.fs, this.destinationPath('.vscode/settings.json'), {});

      folders.forEach((workspace) => {
        writeAndFormatJson(this.fs, this.destinationPath(`${workspace.location}/.vscode/settings.json`), {
          'eslint.workingDirectories': ['../../'],
        });
      });

      writeAndFormatJson(this.fs, this.destinationPath(`.vscode/${projectName}.code-workspace`), {
        extensions: {
          // jest extension currently not working with vscode workspace. Disabling while waiting for a fix / workaround if we keep supporting vscode workspace.
          recommendations: extensions.recommendations.filter((extension) => extension !== 'Orta.vscode-jest'),
          unwantedRecommendations: extensions.unwantedRecommendations,
        },
        settings: sortObject({
          ...settings,
          ...(settings['typescript.tsdk'] ? { 'typescript.tsdk': '✨ root/node_modules/typescript/lib' } : {}),
          ...(this.options.jest
            ? {
                // disable all folders to enable only root.
                'jest.disabledWorkspaceFolders': folders.map((folder) => folder.name),
              }
            : {}),
        }),
        folders: [
          {
            name: '✨ root',
            path: '..',
          },
          ...folders.map(({ name, location }) => ({ name, path: `../${location}` })),
        ],
      });
    }
  }
};
