const path = require('path');
const {devServer} = require("./webpack.config");

const APP_SOURCE = path.join(__dirname, "src");

exports.devServer = () => ({
  devServer: {
    static: {
      directory: path.join(__dirname, 'public')
    },
    compress: true,
    port: 9001,
    historyApiFallback: true,
  }
})

exports.page = ({ title }) => ({

})

exports.loadTypeScript = () => ({
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: "ts-loader",
        exclude: /node_modules/,
      }
    ]
  }
})

exports.loadCSS = () => ({
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          "style-loader",
          "css-loader",
        ]
      }
    ]
  }
})

exports.generateSourceMaps = ({ type }) => ({ devtool: type })
