const CompressionPlugin = require('compression-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const zlib = require('zlib');

module.exports = {
	webpack: {
		configure: (webpackConfig, { env, paths }) => {
			// Production optimizations
			if (env === 'production') {
				// Split chunks optimization
				webpackConfig.optimization.splitChunks = {
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
							reuseExistingChunk: true,
						},
						default: {
							minChunks: 2,
							priority: -20,
							reuseExistingChunk: true,
						},
					},
				};

				// Enable compression
				webpackConfig.plugins.push(
					// Gzip
					new CompressionPlugin({
						filename: '[path][base].gz',
						algorithm: 'gzip',
						test: /\.(js|css|html|svg)$/,
						threshold: 1024,
						minRatio: 0.8,
						compressionOptions: {
							level: 9,
						},
					}),
					// Brotli
					new CompressionPlugin({
						filename: '[path][base].br',
						algorithm: 'brotliCompress',
						test: /\.(js|css|html|svg)$/,
						compressionOptions: {
							params: {
								[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
								[zlib.constants.BROTLI_PARAM_SIZE_HINT]: 0,
							},
						},
						threshold: 1024,
						minRatio: 0.8,
					}),
				);

				// Optimize minification
				webpackConfig.optimization.minimizer = [
					new TerserPlugin({
						terserOptions: {
							parse: {
								ecma: 8,
							},
							compress: {
								ecma: 5,
								warnings: false,
								comparisons: false,
								inline: 2,
								drop_console: true,
								drop_debugger: true,
								pure_funcs: ['console.log'],
							},
							mangle: {
								safari10: true,
							},
							output: {
								ecma: 5,
								comments: false,
								ascii_only: true,
							},
						},
						parallel: true,
						extractComments: false,
					}),
				];
			}

			// Bundle analysis (only when ANALYZE=true)
			if (process.env.ANALYZE) {
				webpackConfig.plugins.push(
					new BundleAnalyzerPlugin({
						analyzerMode: 'static',
						reportFilename: 'bundle-report.html',
					}),
				);
			}

			return webpackConfig;
		},
	},
	// Enable source maps in development
	devServer: (devServerConfig) => {
		return {
			...devServerConfig,
			compress: true,
			headers: {
				'Cache-Control': 'public, max-age=31536000',
			},
		};
	},
};
