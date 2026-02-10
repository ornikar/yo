'use strict';

const Generator = require('yeoman-generator');
const { writeAndFormatJson } = require('../../utils/writeAndFormat');

module.exports = class ClaudeSettingsGenerator extends Generator {
  writing() {
    const settingsPath = this.destinationPath('.claude/settings.json');
    const existingSettings = this.fs.readJSON(settingsPath, {});

    const sessionStartHook = {
      matcher: 'startup',
      hooks: [
        {
          type: 'command',
          command: 'bash -c \'[ "$CLAUDE_CODE_REMOTE" = "true" ] && yarn install || true\'',
          statusMessage: 'Installing dependencies with yarn...',
        },
      ],
    };

    const existingSessionStart = existingSettings.hooks?.SessionStart || [];
    const hasStartupHook = existingSessionStart.some((hook) => hook.matcher === 'startup');

    const settings = {
      ...existingSettings,
      enabledPlugins: {
        ...existingSettings.enabledPlugins,
        'edu-frontend-plugin@ornikar-plugins': true,
        'common-plugin@ornikar-plugins': true,
      },
      hooks: {
        ...existingSettings.hooks,
        SessionStart: hasStartupHook
          ? existingSessionStart.map((hook) => (hook.matcher === 'startup' ? sessionStartHook : hook))
          : [...existingSessionStart, sessionStartHook],
      },
      extraKnownMarketplaces: {
        ...existingSettings.extraKnownMarketplaces,
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
