'use strict';

const fs = require('fs');
const path = require('path');

exports.minimumNodeVersion = '>=18.18.0';
exports.expectedNodeVersion = fs.readFileSync(path.resolve(__dirname, '../../.nvmrc'), 'utf8').trim();
