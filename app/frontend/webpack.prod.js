const merge = require("webpack-merge").merge;
const common = require("./webpack.common.js");
const webpack = require("webpack");
const { IgnorePlugin } = require("webpack");
const BundleAnalyzerPlugin =
  require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const urls = {
  dockerLocal: "http://127.0.0.1:8002/api/",
  dockerProd: "https://water.chrisgoldammer.com/api/api/",
};

const outputFolder = "serve_content/prod";
const nodeEnv = process.env.NODE_ENV;

const outputName =
  nodeEnv == "dockerLocal" ? "bundle.min.js" : "bundle_prod.min.js";

const backendUrl = urls[nodeEnv] || "/api/";
console.log("Backend: " + backendUrl);

const features = { BACKENDURL: backendUrl, RUNMODE: "prod" };

const prodExports = {
  mode: "production",
  output: { path: __dirname, filename: `${outputFolder}/${outputName}` },
  devtool: false,
  plugins: [
    // new BundleAnalyzerPlugin({openAnalyzer: false, analyzerMode: 'static'}),
    new webpack.EnvironmentPlugin(features),
    // new IgnorePlugin({resourceRegExp: /@faker-js/}),
  ],
};

module.exports = merge(common, prodExports);

console.log(module.exports);
