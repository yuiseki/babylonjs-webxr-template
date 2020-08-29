var path = require('path');

function createConfig(filename){
  return {
    mode: "development",
    entry: {
        app: "./src/"+filename+".ts"
    },
    devtool: 'source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: filename+".js"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    plugins: [ ],
    externals: {
      "cannon": true
    },
    module: {
        rules: [{
            test: /\.tsx?$/,
            loader: 'ts-loader',
            exclude: /node_modules/
        }]
    }

  }
}

module.exports = [
  //createConfig('basic'),
  //createConfig('simple'),
  //createConfig('grab'),
  //createConfig('collision'),
  //createConfig('libtest'),
  createConfig('inochi'),
  //createConfig('stage'),
]