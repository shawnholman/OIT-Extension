//webpack.config.js
var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: "development",
    entry: {
        main: './extension/WebCheckout/main.js'
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js", ".json"]
    },
    output: {
        path: path.join(__dirname, "extension/WebCheckout"),
        filename: '[name].build.js'
    },
    watch: true
};
