const path = require('path');
const glob = require('glob');

// Webpack Plugins
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const RemoveEmptyScriptsPlugin = require('webpack-remove-empty-scripts');
const { merge } = require('webpack-merge');
const ESLintPlugin = require('eslint-webpack-plugin');
const StylelintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

const postcssOptions = require('./postcss.config');

// Load config
require('dotenv').config();

// SCSS entries
const scssEntries = () => {
  const entries = [
    ...glob.sync('./src/styles/{layout,sections,templates}/*.scss'),
    ...glob.sync('./src/styles/templates/customers/*.scss'),
  ];

  return entries.reduce((acc, pathname) => {
    const entry = pathname
      .replace(/^.*(styles\/)/, '')
      .replace(/\//g, '.')
      .replace('.scss', '');
    acc[entry] = { import: `./${pathname}` };
    return acc;
  }, {});
};

// JS entries
const jsEntries = () => {
  const entries = [
    ...glob.sync('./src/scripts/{layout,sections,templates}/*.js', { ignore: ['./**/*/example-*.js'] }),
    ...glob.sync('./src/scripts/templates/customers/*.js'),
  ];

  return entries.reduce((acc, pathname) => {
    const entry = pathname
      .replace(/^.*(scripts\/)/, '')
      .replace(/\//g, '.')
      .replace('.js', '');
    acc[entry] = { import: `./${pathname}` };
    return acc;
  }, {});
};

const commonsConfig = {
  stats: 'minimal',
  entry: { ...scssEntries(), ...jsEntries() },
  output: {
    path: path.resolve(__dirname, 'shopify/assets'),
    publicPath: path.resolve(__dirname, 'shopify/assets'),
    filename: `[name].js`,
  },
  resolve: {
    extensions: ['*', '.js', '.json'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '~': path.resolve(__dirname, 'node_modules'),
    },
    fallback: {
      path: require.resolve('path-browserify'),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        type: 'asset/inline',
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
        generator: {
          dataUrl: (content) => svgToMiniDataURI(content.toString()),
        },
      },
      {
        test: /\.js$/,
        exclude: [/node_modules/],
        use: {
          loader: 'babel-loader',
          options: {
            babelrc: true,
          },
        },
      },
      {
        test: /\.(css|scss)$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              url: false,
            },
          },
        ],
      },
      {
        test: /\.scss$/,
        use: [
          {
            loader: 'postcss-loader',
            options: { postcssOptions },
          },
          {
            loader: 'sass-loader',
            options: {
              sourceMap: true,
            },
          },
          {
            loader: 'sass-resources-loader',
            options: {
              resources: './src/styles/helpers/**/*.scss',
            },
          },
        ],
      },
    ],
  },
  optimization: {
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendorScripts: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true,
        },
        vendorStyles: {
          type: 'css/mini-extract',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendor',
          chunks: 'all',
          enforce: true,
        },
      },
    },
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: `[name].css`,
      chunkFilename: '[id].css',
    }),
    new RemoveEmptyScriptsPlugin(),
  ],
};

const devConfig = {
  mode: 'development',
  devtool: 'eval-source-map',
  plugins: [
    /*
     * Need to fix eslint and stylelint errors before proceeding
     */
    // new ESLintPlugin({
    //   files: 'src/scripts/**/*.js',
    //   overrideConfigFile: path.resolve(__dirname, '.eslintrc.js'),
    // }),
    // new StylelintPlugin({
    //   files: 'src/styles/**/*.{css,scss}',
    //   configFile: path.resolve(__dirname, '.stylelintrc.js'),
    // }),
  ],
};

const prodConfig = {
  mode: 'production',
  performance: {
    hints: false,
  },
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: /@license/i,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
  },
};

const config = merge(commonsConfig, process.env.NODE_ENV !== 'production' ? devConfig : prodConfig);

module.exports = config;
