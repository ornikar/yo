'use strict';

const Generator = require('yeoman-generator');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

module.exports = class ClaudeSettingsGenerator extends Generator {
  writing() {
    const settingsPath = this.destinationPath('.claude/settings.json');
    const existingSettings = this.fs.readJSON(settingsPath, {});

    const settings = {
      ...existingSettings,
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
