const path = require('path');
const webpack = require('webpack');

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
		entry: Object.assign(
			...[
				['contest-4', 'js/contests/4/index.babel.js'],
				['contest-mayfes2018', 'js/contests/mayfes2018/index.babel.js'],
				['contest-hackathon2018', 'js/contests/hackathon2018/index.babel.js'],
				['check', 'js/check.babel.js'],
				['contest-5', 'js/contests/5/index.babel.js'],
				['contest-6', 'js/contests/6/index.babel.js'],
				[
					'contest-mayfes2020-day2',
					'js/contests/mayfes2020-day2/index.babel.js',
				],
				[
					'contest-mayfes2021-day2',
					'js/contests/mayfes2021-day2/index.babel.js',
				],
			].map(([name, entry]) => ({
				[name]: [
					...(argv.mode === 'development'
						? ['webpack-hot-middleware/client?reload=true']
						: []),
					path.join(__dirname, 'public', entry),
				],
			})),
		),
		mode: argv.mode || 'development',
		output: {
			publicPath: '/js',
			filename: '[name].js',
		},
		devtool:
			argv.mode === 'production'
				? 'source-map'
				: 'eval-cheap-module-source-map',
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
		plugins: [
			new webpack.HotModuleReplacementPlugin(),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(argv.mode),
			}),
		],
	};
};
