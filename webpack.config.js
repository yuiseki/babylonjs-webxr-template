var path = require('path');

function createConfig(filename){
  return {
    mode: "development",
    entry: {
        app: "./src/"+filename+".ts"
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: filename+".js"
    },
    resolve: {
        extensions: ['.ts', '.tsx', '.js']
    },
    devtool: 'source-map',
    plugins: [ ],
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
  createConfig('basic'),
  createConfig('simple'),
  createConfig('advanced')
]