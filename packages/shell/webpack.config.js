const HtmlWebpackPlugin = require('html-webpack-plugin');
const ModuleFederationPlugin = require('webpack/lib/container/ModuleFederationPlugin');
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: './src/index.jsx',
  mode: 'development',
  devServer: {
    port: 3000,
    historyApiFallback: true,
    hot: true,
    liveReload: true,
    watchFiles: {
      paths: ['src/**/*'],
      options: {
        usePolling: true, 
      },
    },
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
  output: {
    publicPath: 'http://localhost:3000/',
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true, // Clean the output directory before emit
  },
  cache: {
    type: 'filesystem', // Use filesystem cache but with proper invalidation
    cacheDirectory: path.resolve(__dirname, '.cache'),
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react'],
            cacheDirectory: true, // Enable babel cache for faster rebuilds
            cacheCompression: false,
          },
        },
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        REACT_APP_API_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
        NODE_ENV: 'development'
      })
    }),
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        supportTicketsApp: 'supportTicketsApp@http://localhost:3002/remoteEntry.js',
      },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^18.2.0' },
        'react-dom': { singleton: true, eager: true, requiredVersion: '^18.2.0' },
        'react-router-dom': { singleton: true, eager: true, requiredVersion: '^6.20.0' },
      },
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html',
      inject: true,
    }),
    new webpack.HotModuleReplacementPlugin(), // Explicit HMR plugin
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    moduleIds: 'named', // Better debugging
    runtimeChunk: 'single',
  },
  devtool: 'eval-source-map', // Better source maps for debugging
};