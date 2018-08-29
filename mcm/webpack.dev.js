var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var HotReloader = new webpack.HotModuleReplacementPlugin();

var buildEntryPoint = function(entryPoint){
  return [
    'webpack-dev-server/client?https://0.0.0.0:3000',
    'webpack/hot/only-dev-server',
    entryPoint
  ]
}

var buildHTMLPlugin = function(filename){
  return new HtmlWebpackPlugin({
                template: __dirname + '/html2/'+filename+'.html',
                hash: true,
                filename: filename+'.html',
                chunks: [filename],
                inject: 'body'})
}

module.exports = [{
    devtool: '#eval-source-map',
    entry: {
      settings:  ['./vue_components/settings.js'],
      news:  ['./vue_components/news.js']
    },
    output: {
        // non-existing dir name as files will be stored in memory
        path: path.resolve(__dirname, '/scripts3'),
        filename: '[name].js'
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/
        },
        {
          test: /\.(png|jpg|gif|svg)$/,
          loader: 'file-loader',
          options: {
            name: '[name].[ext]?[hash]'
          }
        }
      ]
    },
    plugins: [ buildHTMLPlugin("settings"),
               buildHTMLPlugin("news"),
              HotReloader,
              new webpack.DefinePlugin({
      'API_URL': "'https://cms-pdmv-dev.cern.ch/mcm/'"})],

  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
  },
  devServer: {
    contentBase: __dirname + '/vue_components',
    disableHostCheck : true,
    historyApiFallback: true,
    noInfo: false,
  },

  performance: {
    hints: false
  }
}];