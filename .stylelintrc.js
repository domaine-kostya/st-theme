module.exports = {
  customSyntax: 'postcss-scss',
  extends: [
    'stylelint-config-recommended-scss',
  ],
  plugins: ['stylelint-prettier'],
  rules: {
    'prettier/prettier': true,
    'scss/no-global-function-names': null,
    'no-descending-specificity': null,
  },
};
