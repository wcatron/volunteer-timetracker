'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var StatsPlugin = require('stats-webpack-plugin');
const BabiliPlugin = require("babili-webpack-plugin");

module.exports = {
    // The entry file. All your app roots fromn here.
    entry: [
        'babel-polyfill',
        path.join(__dirname, 'src/index.tsx')
    ],
    // Where you want the output to go
    output: {
        path: path.join(__dirname, '/build/'),
        filename: '[name].[hash].min.js',
        publicPath: '/'
    },
    plugins: [

        // handles creating an index.html file and injecting assets. necessary because assets
        // change name because the hash part changes. We want hash name changes to bust cache
        // on client browsers.
        new HtmlWebpackPlugin({
            template: 'src/index.tpl.html',
            inject: 'body',
            filename: 'index.html'
        }),
        // creates a stats.json
        new StatsPlugin('webpack.stats.json', {
            source: false,
            modules: false
        }),
        // plugin for passing in data to the js, like what NODE_ENV we are in.
        new webpack.DefinePlugin({
            'process.env.NODE_ENV': JSON.stringify('production')
        })
    ],
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        modules: [path.resolve(__dirname, "src"), 'node_modules'],
    },  
    module: {
        // loaders handle the assets, like transforming sass to css or jsx to js.
        rules: [
            { test: /\.tsx?$/, use: ['babel-loader', 'ts-loader'] },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    {
                        loader: 'file-loader',
                        options: {'hash':'sha512','digest':'hex','name':'[hash].[ext]'}
                    },{
                        loader: 'image-webpack-loader',
                        options: {'bypassOnDebug': true}
                    }
                ]
            }, { 
                test: /\.css$/, 
                use: [
                     {
                       loader: "style-loader"
                     },
                     {
                       loader: "postcss-loader",
                       options: {
                         modules: true
                       }
                     }
                ]
            },
            {
                test: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: "style-loader",
                    use: "css-loader",
                    publicPath: "/dist"
                })
            },
            { 
                test: /\.woff(2)?(\?[a-z0-9#=&.]+)?$/, 
                use: [{loader:'url-loader',
                options: { limit: 10000, mimetype: 'application/font-woff' }}]
            },
            { 
                test: /\.(ttf|eot|svg)(\?[a-z0-9#=&.]+)?$/, 
                use: [{loader:'file-loader'}]
            }
        ]
    }
};