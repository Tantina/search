var webpack = require('webpack');
var path = require('path');
var ExtractTextPlugin = require("extract-text-webpack-plugin");

module.exports = {
	entry: [
		 './js/index.js'
	],
	output: {
		path: __dirname,
		publicPath: '/',
		fileName: 'bundle.js'
	},
	module:{
		loaders: [
		{
			test: /\.scss$/,
			loader: ExtractTextPlugin.extract("style-loader", "css-loader!sass-loader")
		}]
	},
	resolve: {
		root: __dirname,
		alias: {
			jquery:				"jquery/dist/jquery.min.js",
			moment:				"js/plugins/moment.js",
			pikaday:			"js/plugins/pikaday.js",
			pikadayJQ:			"js/plugins/jquery.pikaday.js",
			datepicker:			"js/modules/datepicker.js",
			advancedSearch:		"js/modules/advanced-search.js"
		},
		extensions: ['', '.js', '.sass']
	},
	plugins: [
		new ExtractTextPlugin("bundle.css"),
		new webpack.ProvidePlugin({
			$: "jquery"
		})
	],
	devServer: {
		contentBase: './'
	}
};


