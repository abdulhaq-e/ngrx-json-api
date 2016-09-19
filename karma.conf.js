var path = require('path');

module.exports = function(karma) {
    'use strict';

    karma.set({
        basePath: __dirname,

        frameworks: ['jasmine'],

        files: [{
                pattern: 'tests.bundle.ts',
                watched: false
            }
            // "./spec/**.js"
        ],

        exclude: [],

        preprocessors: {
          'tests.bundle.ts': ['coverage', 'webpack', 'sourcemap']
            // 'tests.js': ['coverage', 'webpack', 'sourcemap']
        },

        reporters: ['mocha', 'coverage'],

        coverageReporter: {
            dir: 'coverage/',
            subdir: '.',
            reporters: [{
                type: 'text-summary'
            }, {
                type: 'json'
            }, {
                type: 'html'
            }]
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
                root: __dirname,
                extensions: ['', '.ts', '.js']
            },
            module: {
                loaders: [{
                    test: /\.ts?$/,
                    exclude: /(node_modules)/,
                    loader: 'awesome-typescript-loader',
                    query: {
                    compilerOptions: {
                      tsconfig: './tsconfig.json'
                    }
                },
                }, {
                    test: /\.json$/,
                    loader: 'json-loader',
                }],
                postLoaders: [{
                    test: /\.(js|ts)$/,
                    loader: 'istanbul-instrumenter-loader',
                    include: path.resolve(__dirname, 'lib'),
                    exclude: [
                        /\.(e2e|spec)\.ts$/,
                        /node_modules/
                    ]
                }]
            }
        },
        webpackServer: {
            noInfo: true
        }

    });
};
