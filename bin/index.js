#!/usr/bin/env node

'use strict';

const yeoman = require('yeoman-environment');
const ornikarGenerator = require('../lib/generators/ornikar');

const env = yeoman.createEnv();

env.registerStub(ornikarGenerator, 'ornikar:generator');

const options = {};

env.run('ornikar:generator', options).catch((err) => {
  if (err) {
    console.error(err.stack || err.message || err);
    process.exit(1);
  }
});
