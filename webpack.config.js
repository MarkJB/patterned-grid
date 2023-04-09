const path = require('path');

module.exports = {
  entry: './src/index.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    publicPath: '/dist/', // This is important for webpack-dev-server
  },
  devtool: 'source-map',
  devServer: {
    static: {
        directory: path.join(__dirname, '.'), // Serve content from the project root
      },
    compress: true,
    port: 9000, // Change the port as needed
    hot: true, // Enable hot module replacement
    open: false,    
  },
};
