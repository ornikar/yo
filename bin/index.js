#!/usr/bin/env node

'use strict';

const yeoman = require('yeoman-environment');
const ornikarGenerator = require('../lib/generators/ornikar');

const env = yeoman.createEnv();

env.registerStub(ornikarGenerator, 'ornikar:generator');

const options = {};

env.run('ornikar:generator', options).catch((error) => {
  if (error) {
    console.error(error.stack || error.message || error);
    process.exit(1);
  }
});
