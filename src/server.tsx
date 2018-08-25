var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
import * as React from "react"
import * as fs from 'fs'
const renderToString = require("react-dom/server").renderToString
const express = require("express");
const reactRouter = require('react-router');

const serialize = require('serialize-javascript')
const path = require('path')

const app = express();

express.static.mime.define({
 'application/x-font-woff': ['woff'],
 'application/font-woff': ['woff']
}); 

require('./api/routes')(app);
app.use('/semantic/dist', express.static('semantic/dist'))

const port = process.env.PORT || 4000;
const env = process.env.NODE_ENV || 'production';

if (env !== 'production') {
    const dev_port = 3000
    if (dev_port == port) {
        throw new Error(`When not running in production the development server must be on a different port than ${dev_port}.`)
    }

    var WebpackDevServer = require('webpack-dev-server');
    const webpack = require('webpack')
    const webpackDevMiddleware = require('webpack-dev-middleware')
    const webpackHotMiddleware = require('webpack-hot-middleware')
    const config = require('../webpack.config.js')
    const compiler = webpack(config)

    new WebpackDevServer(webpack(config), {
        publicPath: config.output.publicPath,
        hot: true,
        historyApiFallback: true,
        proxy: {
            "/api/**": { 
                target: `http://localhost:${port}`
            },
            "/semantic/**": {
                target: `http://localhost:${port}`
            }
        }
    }).listen(dev_port)
    
} else {
    app.use(express.static(path.join(__dirname, '..', 'build')))
    var router = express.Router()
    router.get("/*", function(req, res) {
        res.setHeader("Content-Type", "text/html");
        fs.createReadStream(path.join(__dirname, "..", "build", "index.html")).pipe(res);
    });
    app.use(router);
}

// start the server

app.listen(port, err => {
    if (err) {
        return console.error(err);
    }
    console.info(`Server running on http://localhost:${port} [${env}]`);
});