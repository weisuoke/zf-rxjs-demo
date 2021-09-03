const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { merge } = require("webpack-merge");
const path = require("path")
const parts = require("./webpack.parts")

const commonConfig = merge([
  {
    entry: ["./src/index.tsx"],
    resolve: {
      extensions: [".ts", ".tsx", ".js"],
      alias: {
        "src": path.resolve(__dirname, "src")
      }
    },
  },
  parts.loadTypeScript()
])

const productionConfig = merge([
  {
    optimization: {
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            chunks: "initial"
          }
        }
      }
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: "public/index.html"
      })
    ]
  }
])

const developmentConfig = merge([
  parts.devServer()
])

const getConfig = (env) => {
  console.log('env', env, env.mode)
  let mode = env.mode ? env.mode : "development"
  switch (mode) {
    case "production":
      return merge(commonConfig, productionConfig, { mode });
    case "development":
      return merge(commonConfig, developmentConfig, { mode });
    default:
      throw new Error(`Trying to use an unknown mode, ${mode}`);
  }
}

module.exports = getConfig;
