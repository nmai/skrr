const path = require('path')

module.exports = {
  mode: 'development',
  entry: './src_srv/index.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  output: {
    filename: 'bundle_srv.js',
    path: path.resolve(__dirname, 'dist_srv')
  }
}
