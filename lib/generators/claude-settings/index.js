'use strict';

const Generator = require('yeoman-generator');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

module.exports = class ClaudeSettingsGenerator extends Generator {
  writing() {
    const settingsPath = this.destinationPath('.claude/settings.json');
    const existingSettings = this.fs.readJSON(settingsPath, {});

    const settings = {
      ...existingSettings,
      permissions: {
        allow: [
          'Bash(yarn aggregate-translations)',
          'Bash(yarn build)',
          'Bash(yarn build:*)',
          'Bash(yarn build-storybook)',
          'Bash(yarn bump)',
          'Bash(yarn clean:*)',
          'Bash(yarn lint)',
          'Bash(yarn lint:*)',
          'Bash(yarn postinstall)',
          'Bash(yarn preversion)',
          'Bash(yarn reapply-svgo)',
          'Bash(yarn release)',
          'Bash(yarn start)',
          'Bash(yarn start:*)',
          'Bash(yarn storybook:*)',
          'Bash(yarn test)',
          'Bash(yarn test:*)',
          'Bash(yarn tsc)',
          'Bash(yarn version)',
          'Bash(yarn watch)',
          'Bash(find:*)',
          'Bash(yarn lint:prettier:fix:*)',
          'Bash(ls:*)',
          'Bash(yarn lint:eslint:fix:*)',
          'Skill(common-plugin:*)',
          'Skill(edu-frontend-plugin:*)',
        ],
        deny: [],
      },
      enabledPlugins: {
        'edu-frontend-plugin@ornikar-plugins': true,
        'common-plugin@ornikar-plugins': true,
      },
      hooks: {
        SessionStart: [
          {
            matcher: 'startup',
            hooks: [
              {
                type: 'command',
                command: 'bash -c \'[ "$CLAUDE_CODE_REMOTE" = "true" ] && yarn install || true\'',
                statusMessage: 'Installing dependencies with yarn...',
              },
            ],
          },
        ],
      },
      extraKnownMarketplaces: {
        'company-tools': {
          source: {
            source: 'github',
            repo: 'ornikar/skills',
          },
        },
      },
    };

    writeAndFormatJson(this.fs, settingsPath, settings);
  }
};
