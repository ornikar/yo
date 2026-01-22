'use strict';

// Use local jscodeshift instance directly
const jscodeshift = require('jscodeshift');
const prettier = require('prettier');

module.exports = async function transformer(fileInfo, api) {
  // Use the jscodeshift API to parse the file
  const j = api.jscodeshift || jscodeshift;

  // Parse the source code of the file
  const root = j(fileInfo.source);

  // ----------- Start of transformer logic

  // ----------- End of transformer logic

  // Return the modified source code after transformation
  const output = root.toSource({ quote: 'single' });

  const prettierConfig = await prettier.resolveConfig(fileInfo.path);

  return prettier.format(output, {
    ...prettierConfig,
    filepath: fileInfo.path,
  });
};
