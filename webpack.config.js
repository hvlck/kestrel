const path = require('path');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

module.exports = {
    entry: './src/index.ts',
    devtool: 'source-map',
    plugins: [new CleanWebpackPlugin()],
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                loader: 'awesome-typescript-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.js', '.json'],
        alias: {
            'webextension-polyfill-ts': path.resolve(path.join(__dirname, 'node_modules', 'webextension-polyfill-ts')),
        },
    },
    output: {
        filename: '[name].js',
        path: __dirname + '/build',
    },
};
