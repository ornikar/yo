'use strict';

const fs = require('node:fs');
const path = require('node:path');

exports.minimumNodeVersion = '>=22.22.0';
exports.expectedNodeVersion = fs.readFileSync(path.resolve(__dirname, '../../.nvmrc'), 'utf8').trim();
