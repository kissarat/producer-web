module.exports = {
    entry: './entry.js',
    output: {
        path: 'dist',
        filename: 'app.bundle.js'
    },
    module: {
        loaders: [
            {test: /\.css$/, loader: "style-loader!css-loader"},
            {test: /\.svg$/, loader: 'svg-loader'},
            {
                test: /\.(eot|woff|woff2|ttf)$/,
                loader: 'file-loader'
            }
        ]
    },
    resolve: {
        modulesDirectories: ["lib"]
    },
    watch: true
};
