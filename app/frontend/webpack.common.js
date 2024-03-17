

require.extensions['.css'] = () => {
  return;
};

var path = require('path');
var debug = process.env.NODE_ENV !== "production";
const webpack = require('webpack');

const outputDebug = {
  publicPath: "/",
  path: path.resolve(__dirname, 'lib'),
    filename: '[name].[fullhash:8].js',
    sourceMapFilename: '[name].[fullhash:8].map',
    chunkFilename: '[id].[fullhash:8].js'
}

const outputNonDebug = { path: __dirname, filename: 'lib/bundle.min.js' }

module.exports = {
  entry: [
    './src/index.js'
  ],
  target: 'web',
  module: {
    rules: [
      {
        test: /\.m?js/,
        resolve: {
            fullySpecified: false
        }
      },
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
      },
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
        options: {
          plugins: [["react-refresh/babel", { skipEnvCheck: true }]],
          presets: [ '@babel/preset-env', '@babel/preset-react']
        }
      },
			{
				test: /\.css$/,
				use: [
          'style-loader',
          { 
            loader: 'css-loader',
            options: {modules: true}
          }]
			}
    ]
  },
  resolve: {
    extensions: ['.*', '.js', '.jsx']
  },
  experiments: {
    topLevelAwait: true
  },
	devtool: debug ? "eval-source-map" : false,
  output: debug ? outputDebug : outputNonDebug,
  plugins: [
     
  ],
};
