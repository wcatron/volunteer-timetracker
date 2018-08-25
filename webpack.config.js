'use strict';

var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var WebpackNotifierPlugin = require('webpack-notifier');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

module.exports = {
    devtool: 'eval',
    entry: [
        'webpack-dev-server/client?http://localhost:3000',
        'webpack/hot/only-dev-server',
        'react-hot-loader/patch',
        'babel-polyfill',
        path.join(__dirname, 'src/index.tsx')
    ],
    output: {
        path: path.join(__dirname, '/build/'),
        filename: '[name].js',
        publicPath: '/'
    },
    plugins: [
        new HtmlWebpackPlugin({
          template: 'src/index.tpl.html',
          inject: 'body',
          filename: 'index.html'
        }),
        new webpack.HotModuleReplacementPlugin(),
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
          'process.env.NODE_ENV': JSON.stringify('development')
        }),
        new WebpackNotifierPlugin()
    ],
    resolve: {
      extensions: [ '.ts', '.tsx', '.js', '.jsx'],
      modules: [path.resolve(__dirname, "src"), 'node_modules'],
    },
    module: {
        rules: [
            { test: /\.tsx?$/, use: [
                    {loader: 'babel-loader'},
                    {loader: 'ts-loader'}
                ] 
            },
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