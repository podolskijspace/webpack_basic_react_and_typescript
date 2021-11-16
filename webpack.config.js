const path = require('path')
const HTMLWebpackPlugin = require('html-webpack-plugin')
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCSSExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const isDev = process.env.NODE_ENV === 'development' //Проверяем это режим разработки или продакшна
const isProd = !isDev

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all"
    }
  }
  if (isProd) {
    config.minimizer = [
      new OptimizeCSSAssetPlugin(),
      new TerserWebpackPlugin()
    ]
  }

  return config
}

const makeFilename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`;

const cssLoaders = (preprocess) => {
  const loaders = [
    MiniCSSExtractPlugin.loader,
    'css-loader',
  ]

  if (preprocess) {
    loaders.push(preprocess);
  }

  return loaders;
}

module.exports = {
  context: path.resolve(__dirname, 'src'),
  mode: "development",
  entry: ['@babel/polyfill' ,'./index.tsx'],
  output: {
    filename: makeFilename('js'),
    path: path.resolve(__dirname, 'dist')
  },
  resolve: {
    extensions: ['.js','.tsx'],
  },
  optimization: optimization(),
  devServer: {
    port: 3001,
    hot: isDev //изменение файлов без перезагрузки
  },
  devtool: isDev ? 'source-map' : 'eval',
  plugins: [
    new HTMLWebpackPlugin({
      template: './static/index.html',
      minify: {
        collapseWhitespace: isProd
      }
    }),
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin({
      patterns: [
        {from: 'static/favicon.ico', to:'', noErrorOnMissing: true},
      ]
    }),
    new MiniCSSExtractPlugin({
      filename: makeFilename('css')
    }),
  ],
  module: {
    rules: [
      {
        test: /\.css$/,
        use: cssLoaders()
      },
      {
        test: /\.s[ac]ss$/i,
        use: cssLoaders('sass-loader')
      },
      {
        test: /\.(png|jpg|svg|jpeg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.(ttf|wpff|woff2|eot)/,
        use: ['file-loader'],
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
            ],
            // plugins: [],
          }
        }
      },
      {
        test: /\.tsx$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-typescript',
              '@babel/preset-react',
            ],
          }
        }
      }
    ]
  }
}