'use strict';

const HtmlWebPackPlugin = require('html-webpack-plugin');
const path = require('path');

const htmlPlugin = new HtmlWebPackPlugin({
  favicon: './public/favicon.ico',
  template: './public/index.html',
  filename: './index.html'
});
const port = process.env.PORT || 3000;

module.exports = {
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        use: ['babel-loader']
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.scss$/,
        use: [
          {loader: 'style-loader'}, 
          {loader: 'css-loader'},
          {
            loader: 'sass-loader',
            options: {
              includePaths: [
                path.resolve('node_modules/patternfly/dist/sass'),
                path.resolve('node_modules/patternfly/node_modules/bootstrap-sass/assets/stylesheets'),
                path.resolve('node_modules/patternfly/node_modules/font-awesome-sass/assets/stylesheets')
              ]
            }
          }
        ]
      },
      {
        test: /\.(png|jpg|gif|woff|woff2|eot|ttf|svg)$/,
        use: [
          {
            loader: 'file-loader'
          }
        ]
      }
    ]
  },
  devServer: {
    host: 'localhost',
    port: port,
    historyApiFallback: true,
    open: true
  },
  plugins: [htmlPlugin]
};