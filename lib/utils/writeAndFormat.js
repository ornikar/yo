
const prettier = require('prettier');

exports.writeAndFormat = function (fs, destinationPath, content) {
  fs.write(
    destinationPath,
    prettier.format(content, {
      filepath: destinationPath,
      trailingComma: 'all',
      singleQuote: true,
      arrowParens: 'always',
    }),
  );
};

exports.copyAndFormatTpl = function (
  fs,
  templatePath,
  destinationPath,
  options,
) {
  fs.copyTpl(templatePath, destinationPath, options);
  exports.writeAndFormat(fs, destinationPath, fs.read(destinationPath));
};