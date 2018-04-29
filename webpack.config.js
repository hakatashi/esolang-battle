const webpack = require('webpack');
const path = require('path');

module.exports = (env, argv = {}) => {
	const browsers = [
		'last 2 chrome versions',
		...(argv.mode === 'production'
			? ['last 2 firefox versions', 'safari >= 9', 'last 2 edge versions']
			: []),
	];

	const envConfig = {
		targets: {
			browsers,
		},
		useBuiltIns: 'entry',
		shippedProposals: true,
		debug: true,
	};

	return {
		entry: [
			...(argv.mode === 'development'
				? ['webpack-hot-middleware/client?reload=true']
				: []),
			'./public/js/contests/4/index.babel.js',
		],
		mode: argv.mode || 'development',
		output: {
			publicPath: '/js/contests/4/',
			path: path.join(__dirname, 'public', 'js', 'contests', '4'),
			filename: 'index.js',
		},
		devtool:
			argv.mode === 'production'
				? 'source-map'
				: 'cheap-module-eval-source-map',
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							presets: [
								['@babel/preset-env', envConfig],
								'@babel/preset-react',
							],
							plugins: [
								'@babel/plugin-proposal-class-properties',
								'@babel/plugin-proposal-object-rest-spread',
							],
						},
					},
				},
			],
		},
		node: {
			fs: 'empty',
			net: 'empty',
			tls: 'empty',
		},
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(argv.mode),
			}),
		],
	};
};
