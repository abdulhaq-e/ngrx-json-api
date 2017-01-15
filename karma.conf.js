const path = require('path');
const webpack = require('webpack');
const ngtools = require('@ngtools/webpack');

const reporters = ['progress', 'jasmine-diff', 'mocha'];

if (process.env['CI']) {
  reporters.push('karma-remap-istanbul');
}

module.exports = function(karma) {
  'use strict';

  karma.set({
    basePath: __dirname,

    frameworks: ['jasmine'],

    files: [{
      pattern: './tests.bundle.ts',
      watched: false
    }],

    exclude: [],

    preprocessors: {
      './tests.bundle.ts': ['webpack', 'sourcemap']
    },
    mime: {
      'text/x-typescript': ['ts', 'tsx']
    },
    reporters: reporters,
    remapIstanbulReporter: {
      reports: {
        html: 'coverage',
        lcovonly: './coverage/coverage.lcov'
      }
    },

    browsers: ['Chrome'],

    port: 9018,
    runnerPort: 9101,
    colors: true,
    logLevel: karma.LOG_INFO,
    autoWatch: true,
    singleRun: true,

    webpack: {
      devtool: 'inline-source-map',
      resolve: {
        plugins: [
          new ngtools.PathsPlugin({
            tsConfigPath: './tsconfig.json'
          })
        ],
        extensions: ['.ts', '.js']
      },
      entry: {
        'tests.bundle.ts': './tests.bundle.ts'
      },
      output: {
        path: './dist.test',
        filename: '[name].bundle.js'
      },
      module: {
        rules: [{
          test: /\.js$/,
          enforce: 'pre',
          loader: 'source-map-loader',
          exclude: [
            /node_modules/
          ]
        }, {
          test: /\.ts$/,
          loaders: [{
            loader: '@ngtools/webpack',
            query: {
              tsConfigPath: './tsconfig.json',
              module: 'commonjs'
            }
          }],
          exclude: [/\.e2e\.ts$/]
        }, {
          test: /\.(js|ts)$/,
          loader: 'sourcemap-istanbul-instrumenter-loader',
          enforce: 'post',
          exclude: [
            /\.(e2e|spec)\.ts$/,
            /node_modules/
          ],
          query: {
            'force-sourcemap': true
          }
        }]
      },
      plugins: [
        new webpack.SourceMapDevToolPlugin({
          filename: null,
          test: /\.(ts|js)($|\?)/i
        }),
        new webpack.ContextReplacementPlugin(
          /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
          './src/'
        )
      ]
    },
    webpackServer: {
      noInfo: true
    },
    webpackMiddleware: {
      noInfo: true, // Hide webpack output because its noisy.
      stats: { // Also prevent chunk and module display output, cleaner look. Only emit errors.
        assets: false,
        colors: true,
        version: false,
        hash: false,
        timings: false,
        chunks: false,
        chunkModules: false
      },
    },

  });
};
