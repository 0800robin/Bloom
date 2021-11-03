const path = require('path');
const fs = require('fs');

// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
    entry: "./src/script.js",
    output : {
        filename: 'output.js',
        path: path.resolve(__dirname, 'build')
    },
    module : {
        rules: [
            {
                // process scss into css then into js to inject into html
                test: /\.scss$/,
                use : [
                    'style-loader',
                    'css-loader',
                    'sass-loader'
                ],
            },
            {
                // import pics
                test: /\.(png|jpe?g|gif|gltf)$/i,
                use: [
                  {
                    loader: 'file-loader',
                  },
                ],
              },
        ]
    },
    plugins: [
        // new BundleAnalyzerPlugin()
    ],
    devServer : {
        https: true,
        static: {
            directory: path.join(__dirname, 'public')
        },
        open: true,
        port: 420
    }
}