var webpack = require('webpack');
var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
let BabiliPlugin = require("babili-webpack-plugin");
let ContextReplacementPlugin = require('webpack/lib/ContextReplacementPlugin');

var path = require('path');
var libraryName = 'ngrx-json-api';
var outputFile = 'ngrx-json-api.umd.min' + '.js';

var config = {
    entry: __dirname + '/release/index.js',
    devtool: false,
    output: {
        path: __dirname + '/release/bundle',
        filename: outputFile,
        library: libraryName,
        libraryTarget: 'umd',
        umdNamedDefine: true
    },
    externals: [
      '@angular/core',
      '@angular/http',
      '@ngrx/core',
      '@ngrx/store',
      '@ngrx/effects',
      // 'lodash',
      // 'rxjs'
    ],
    module: {
        rules: [{
            test: /\.js$/,
            loader: 'babel-loader',
            exclude: /(node_modules|bower_components)/
        }, ]
    },
    plugins: [
        new ContextReplacementPlugin(
            // The (\\|\/) piece accounts for path separators in *nix and Windows
            /angular(\\|\/)core(\\|\/)(esm(\\|\/)src|src)(\\|\/)linker/,
            __dirname + '/release' // location of your src
        ),
        new webpack.LoaderOptionsPlugin({
            minimize: true,
            debug: false
        }),
        new LodashModuleReplacementPlugin,
        new webpack.optimize.OccurrenceOrderPlugin,
        new BabiliPlugin()
        //
        // new webpack.optimize.UglifyJsPlugin({
        //     compress: {
        //         warnings: true,
        //         screw_ie8: true
        //     },
        //     output: {
        //         comments: false
        //     },
        //     sourceMap: false,
        //     beautify: false,
        //     mangle: {
        //         screw_ie8: true,
        //         keep_fnames: true
        //     },
        // })
    ],

    resolve: {
        modules: [path.resolve(__dirname, 'release'),
            'node_modules'
        ],
        extensions: ['.js']
    }
};

module.exports = config;
