const path = require('path');

module.exports = {  
    moduleNameMapper: {
        '@src/(.*)':                 path.resolve(__dirname, 'src/$1'),
    },
    globals: {
        __MUSTACHE_TEMPLATES__: {
            'daysview':  'daysview',
            'monthview': 'monthview',
            'root':      'root'
        },
        __MUSTACHE_PARTIALS__: {
            'events_row':    'events_row',
            'events_column': 'events_column',
            'grid':          'grid'
        },
    }
}

