'use strict';

const { parseDocument } = require('yaml');

exports.readYamlDocument = (fs, destinationPath, defaults) => {
  const content = fs.read(destinationPath, { defaults: null });
  if (content === null) return defaults;
  return parseDocument(content);
};

exports.writeYamlDocument = (fs, destinationPath, document) => {
  fs.write(destinationPath, document.toString());
};
