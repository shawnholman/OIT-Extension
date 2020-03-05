//webpack.config.js
var path = require('path');
var webpack = require('webpack');

module.exports = {
    mode: "production",
    entry: {
        main: './extension/WebCheckout/main.js'
    },
    resolve: {
        extensions: [".webpack.js", ".web.js", ".ts", ".js", ".json"]
    },
    optimization: {
		// We no not want to minimize our code.
		minimize: false
	},
    output: {
        path: '/Users/mediadsk/Desktop/OIT-Extension/extension/WebCheckout',
        filename: '[name].build.js'
    }
};