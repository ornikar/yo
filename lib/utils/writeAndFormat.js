'use strict';

const prettier = require('prettier');

exports.writeAndFormat = function (fs, destinationPath, content, options) {
  fs.write(
    destinationPath,
    prettier.format(content, {
      filepath: destinationPath,
      trailingComma: 'all',
      singleQuote: true,
      arrowParens: 'always',
      ...options,
    }),
  );
};

exports.writeAndFormatJson = (fs, destinationPath, value) => {
  exports.writeAndFormat(fs, destinationPath, JSON.stringify(value, null, 2), {
    // project.code-workspace is json
    parser: destinationPath.endsWith('json') ? undefined : 'json',
  });
};

exports.copyAndFormatTpl = function (fs, templatePath, destinationPath, options) {
  fs.copyTpl(templatePath, destinationPath, options);
  exports.writeAndFormat(fs, destinationPath, fs.read(destinationPath));
};
