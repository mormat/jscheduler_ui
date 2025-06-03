const { 
    get_first_day_of_week,
    date_add,
    date_format
} = require('./utils/date');

const sources = __EXAMPLES_SOURCES__;
const webpack_mode = __WEBPACK_MODE__;

var urlParams = new URLSearchParams(
    window.location.href.split('?')[1]
);

function buildModel(table) {
    
    const scripts = table.map( row => row[1]).filter( v => v);
    var currentScript = urlParams.has('p') ? urlParams.get('p'): scripts[0];
    
    const rows = table.map( ([label, script]) => {
        const updatedUrlParams = new URLSearchParams(urlParams);
        updatedUrlParams.set('p', script);
        
        const url    = '?' + updatedUrlParams;
        const active = (currentScript === script );
        const source = script in sources ? sources[script] : '';
        
        return { label, script, url, active, source }
    } );
    
    const activeRow = rows.find( r => r.active);
    
    return { rows, activeRow }
        
}

function getStartDay() {
    
    return get_first_day_of_week(Date.now());
    
}

function getDays(limit = 30) {
    
    const start = get_first_day_of_week(Date.now());
    
    const days = [];
    for (let n = 0; n < limit; n++) {
        const date = date_add(start, n, 'day');
        days.push( date_format(date, 'yyyy-mm-dd') );
    }
    return days;
    
}

if (webpack_mode !== 'production') {
    // date stub
    if (urlParams.has('today')) {
        Date.now = function() { 
            return new Date(urlParams.get('today')).getTime()
        };
    }

    if (urlParams.has('debug')) {
        window.addEventListener('mousemove', function(e) {
            document.title = 'x=' + e.pageX + ',y=' + e.pageY;
        });
    }
}

module.exports = { buildModel, getDays };
