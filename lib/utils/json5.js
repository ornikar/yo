'use strict';

const JSON5 = require('json5');

exports.readJSON5 = (fs, destinationPath, defaults) => {
  const content = fs.read(destinationPath, { defaults: null });
  if (content === null) return defaults;
  return JSON5.parse(content);
};
