const path = require('path');

module.exports = {
  entry: './src/com/jessewarden/ff6/index.js',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: "final-fantasy-6-algorithms",
    libraryTarget: "commonjs2"
  },
  externals: {
    "lodash": {
      commonjs: "lodash",
      commonjs2: "lodash",
      amd: "lodash",
      root: "_"
    },
    "rx": {
      commonjs: "rx",
      commonjs2: "rx",
      amd: "rx",
      root: "rx"
    }
  }
}