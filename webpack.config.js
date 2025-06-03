const webpack = require('webpack');
const CopyPlugin = require("copy-webpack-plugin");
const path = require('path');
const fs = require('fs');

const EXAMPLES_DIR = path.join(__dirname, 'public', 'examples' );
const TEMPLATES_DIR = path.join(__dirname, 'templates' );

module.exports = function (env, argv) {
    
    const packageInfos = get_package_infos();
    
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
                        },
                        transform(content, absoluteFrom) {
                            if (absoluteFrom.endsWith('.css')) {
                                let transformed = content.toString();
                                transformed = transformed.replace(
                                    '__PACKAGE_NAME__', 
                                    packageInfos.name
                                );
                                transformed = transformed.replace(
                                    '__PACKAGE_VERSION__', 
                                    packageInfos.version
                                );
                                return transformed;
                            }
                            return content;
                        }
                    },
                ]
            }),
            new webpack.DefinePlugin({
                '__PACKAGE_NAME__':       JSON.stringify(packageInfos.name),
                '__PACKAGE_VERSION__':    JSON.stringify(packageInfos.version),
                '__WEBPACK_MODE__':       JSON.stringify( argv.mode ),
                '__EXAMPLES_SOURCES__':   webpack.DefinePlugin.runtimeValue(
                    () => JSON.stringify( get_templates( EXAMPLES_DIR ) ),
                    { contextDependencies: [ EXAMPLES_DIR ] }
                ),
                __MUSTACHE_TEMPLATES__: webpack.DefinePlugin.runtimeValue(
                    () => JSON.stringify(
                        get_templates( TEMPLATES_DIR,  { spaceless: true } )
                    ),
                    { contextDependencies: [ TEMPLATES_DIR ] }
                )
            })
        ]
    }
}

function get_templates(cwd, { spaceless = false } = {}) {
    const { globSync } = require("glob");
    const filenames = globSync( '**/*' , { absolute: false, cwd, nodir: true });
    
    const templates = {};
    for (const filename of filenames) {
        const fullpath = path.join(cwd, filename);
        let contents = fs.readFileSync(fullpath, 'utf8');
        if (spaceless) {
            contents = contents.replace(/\s+/g,' ');
        }
        const name = filename.replace('/', '__').split('.').shift();
        templates[ name ] = contents;
    }
    return templates;
}

function get_package_infos() {
    const filename = path.join(__dirname, 'package.json');
    const contents = fs.readFileSync(filename,'utf8');
    return JSON.parse(contents);
}

