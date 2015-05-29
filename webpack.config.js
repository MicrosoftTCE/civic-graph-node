var path = require("path");
var webpack = require("webpack");
var ExtractTextPlugin = require("extract-text-webpack-plugin");
var merge = require("./lib/merge");

var TARGET = process.env.TARGET
var ROOT_PATH = path.resolve(__dirname)

var common = {
  entry: [path.join(ROOT_PATH, "src/app.js")],
  resolve: {
    extensions: ["", ".js"],
  },
  output: {
    path: path.resolve(ROOT_PATH, "public"),
    filename: "bundle.js",
  },
  module: {
    loaders: [
      { test: /\.css$/, loader: "style-loader!css-loader" },
      { test: /\.hbs$/, loader: "handlebars-loader" },
      { test: /\.json$/, loader: "json-loader" },
      { test: /\.json5$/, loader: "json5-loader" },
      { test: /\.txt$/, loader: "raw-loader" },
      { test: /\.html$/, loader: "html-loader" },
      { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url?limit=25000" },
      { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
      { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
      { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
      { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
    ]
  }
}

var mergeConfig = merge.bind(null, common)

if (TARGET === "build") {
  module.exports = mergeConfig({
    module: {
      loaders: [
        { test: /\.json$/, loader: "json-loader" },
        { test: /\.json5$/, loader: "json5-loader" },
        { test: /\.txt$/, loader: "raw-loader" },
        { test: /\.html$/, loader: "html-loader" },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url?limit=25000" },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
      ]
    },
    plugins: [
      new ExtractTextPlugin("styles.css"),
      new webpack.DefinePlugin({
        "process.env": {
          "NODE_ENV": JSON.stringify("production"),
        }
      }),
      new webpack.optimize.UglifyJsPlugin({
        compress: {
          warnings: false
        }
      })
    ]
  })
}

if (TARGET === "dev") {
  module.exports = mergeConfig({
    entry: ["webpack/hot/dev-server"],
    module: {
      loaders: [
        { test: /\.json$/, loader: "json-loader" },
        { test: /\.json5$/, loader: "json5-loader" },
        { test: /\.txt$/, loader: "raw-loader" },
        { test: /\.html$/, loader: "html-loader" },
        { test: /\.(png|jpg|jpeg|gif|svg)$/, loader: "url?limit=25000" },
        { test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/, loader: "url-loader?limit=10000&minetype=application/font-woff" },
        { test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=application/octet-stream" },
        { test: /\.eot(\?v=\d+\.\d+\.\d+)?$/, loader: "file" },
        { test: /\.svg(\?v=\d+\.\d+\.\d+)?$/, loader: "url?limit=10000&minetype=image/svg+xml" }
      ]
    },
    plugins: [
      new webpack.NoErrorsPlugin()
    ]
  })
}
