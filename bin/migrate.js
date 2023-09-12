#!/usr/bin/env node

'use strict';

const path = require('node:path');
const glob = require('glob');
const { run: jscodeshift } = require('jscodeshift/src/Runner');

const argv = process.argv.slice(2);

const transformerName = argv[0];
const globPaths = argv[1];

if (!transformerName || !globPaths) {
  throw new Error('Usage: ornikar-migrate <transformer-name> <glob-paths>');
}

const transformPath = path.resolve(__dirname, `../lib/transforms/${transformerName}.js`);
const paths = glob.sync(globPaths);

if (paths.length === 0) {
  throw new Error(`No files found matching ${globPaths}`);
}

jscodeshift(transformPath, paths, {}).then((res) => {
  if (res.errors) {
    process.exitCode = 1;
  }
  console.log('Done!');
});
