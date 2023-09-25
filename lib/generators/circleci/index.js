'use strict';

const semver = require('semver');
const Generator = require('yeoman-generator');
const { minimumFrontendOrbVersion } = require('../../config/circleciVersions');
const { readYamlDocument, writeYamlDocument } = require('../../utils/yaml');

module.exports = class CircleCIGenerator extends Generator {
  writing() {
    const circleciConfigPath = this.destinationPath('.circleci/config.yml');
    const configDocument = readYamlDocument(this.fs, circleciConfigPath, null);

    if (!configDocument) {
      return;
    }

    const orbs = configDocument.get('orbs');
    if (!orbs || !orbs.items || orbs.items.length === 0) {
      return;
    }

    let hasChanges = false;

    for (const orb of orbs.items) {
      console.log(orb.key.value);
      if (orb.key.value === 'frontend') {
        const { value } = orb.value;
        if (!value.startsWith('ornikar/frontend-orb@')) {
          throw new Error('Invalid frontend orb value in circleci config: not starting with ornikar/frontend-orb@');
        }
        const version = value.slice('ornikar/frontend-orb@'.length);
        if (!semver.gte(version, minimumFrontendOrbVersion)) {
          orb.value = `ornikar/frontend-orb@${minimumFrontendOrbVersion}`;
          hasChanges = true;
        }
      }
    }

    if (hasChanges) {
      writeYamlDocument(this.fs, circleciConfigPath, configDocument);
    }
  }
};
