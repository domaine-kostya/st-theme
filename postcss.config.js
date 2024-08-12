const postcssImport = require('postcss-import');
const autoprefixer = require('autoprefixer');
const postcssPresetEnv = require('postcss-preset-env');

module.exports = {
  plugins: [postcssImport, autoprefixer, postcssPresetEnv],
};
