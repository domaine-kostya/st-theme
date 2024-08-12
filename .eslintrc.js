const path = require('path');

module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  extends: ['plugin:import/recommended', 'airbnb-base', 'prettier'],
  plugins: ['prettier'],
  env: {
    browser: true,
    es2021: true,
  },
  globals: {
    Shopify: 'readonly',
  },
  ignorePatterns: ['**/example-*.js'],
  rules: {
    'prettier/prettier': ['error'],
    'no-plusplus': 'off',
    'no-unneeded-ternary': 'off',
    'import/no-extraneous-dependencies': [
      'error', {
        'devDependencies': true
      }
    ],
    'no-unused-expressions': [
      1, {
        allowShortCircuit: true
      }
    ]
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', path.resolve(__dirname, 'src')]],
      },
    },
  },
};
