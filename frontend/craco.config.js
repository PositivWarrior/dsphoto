const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
	webpack: {
		configure: (webpackConfig) => {
			webpackConfig.optimization = {
				...webpackConfig.optimization,
				minimize: true,
				minimizer: [
					new TerserPlugin({
						terserOptions: {
							compress: {
								drop_console: true,
							},
						},
					}),
				],
				splitChunks: {
					chunks: 'all',
					minSize: 20000,
					maxSize: 244000,
					minChunks: 1,
					maxAsyncRequests: 30,
					maxInitialRequests: 30,
					automaticNameDelimiter: '~',
					enforceSizeThreshold: 50000,
					cacheGroups: {
						defaultVendors: {
							test: /[\\/]node_modules[\\/]/,
							priority: -10,
						},
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true,
						},
					},
				},
			};

			webpackConfig.plugins.push(
				new CompressionPlugin({
					algorithm: 'gzip',
					test: /\.(js|css|html|svg)$/,
					threshold: 10240,
					minRatio: 0.8,
				}),
			);

			if (process.env.ANALYZE) {
				webpackConfig.plugins.push(new BundleAnalyzerPlugin());
			}

			webpackConfig.ignoreWarnings = [
				function ignoreSourcemapsloaderWarnings(warning) {
					return (
						warning.module &&
						warning.module.resource.includes('node_modules') &&
						warning.details &&
						warning.details.includes('source-map-loader')
					);
				},
			];

			return webpackConfig;
		},
	},
};
