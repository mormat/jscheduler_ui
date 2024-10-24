const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const fs = require('fs');

module.exports = function (env, argv) {
    return {
        entry: {
            'jscheduler_ui': ['./src/jscheduler_ui.js', ],
            'examples':      ['./src/examples.js']
        },
        devServer: {
            static: { 
                directory: path.join(__dirname, 'public'),
            }
            // , watchFiles: ['./templates/**/*.html'] // not working ?
        },
        output: {
            filename: '[name].js',
            library: '[name]',
            libraryTarget: 'umd'
        },
        resolve: {
            alias: {
                '@src': path.resolve(__dirname, 'src'),
            },
        },
        plugins: [
            new CopyPlugin({
                patterns: [
                    { 
                        from: './public', 
                        to: '.',  
                        globOptions: {
                            ignore: ['**/temp', '**/tests.html']
                        }
                    },
                ]
            }),
            new webpack.DefinePlugin({
                '__WEBPACK_MODE__': JSON.stringify( argv.mode ),
                '__EXAMPLES_SOURCES__': JSON.stringify(get_examples_sources()),
                '__MUSTACHE_TEMPLATES__': JSON.stringify({
                    'daysview':  get_template('daysview.html'),
                    'monthview': get_template('monthview.html'),
                    'root':      get_template('root.html'),
                }),
                '__MUSTACHE_PARTIALS__': JSON.stringify({
                    events_row:    get_template('partials/events_row.html'),
                    events_column: get_template('partials/events_column.html'),
                    grid:          get_template('partials/grid.html')
                })
            })
        ]
    }
}

function get_examples_sources() {
    const folder = path.join(__dirname, 'public', 'examples');
    return Object.fromEntries(
        fs.readdirSync(folder).map( filename => [
            filename.split('.')[0],
            fs.readFileSync(path.join(folder, filename), 'utf8')
        ])
    );
}

function get_template(filename) {
    const fullpath = path.join(__dirname, 'templates', filename);
    return fs.readFileSync(fullpath, 'utf8').replace(/\s+/g,' ');
}


