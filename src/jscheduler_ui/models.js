
const { date_add_hour, format_date } = require('../utils/date.js');
const uuid = require('uuid');

/**
 * Comparators to use in array.sort()
 */

// @todo unit test ?
function compareSchedulerEventsByDaysCount(event1, event2)
{
    const oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    
    const daysCount1 = Math.round(Math.abs((event1.end - event1.start) / oneDay));
    const daysCount2 = Math.round(Math.abs((event2.end - event2.start) / oneDay));
    return daysCount2 - daysCount1;
}

// returns a new object with event default values
function withEventDefaultValues( obj ) {
    const values = { 
        bgColor: '#0288d1', 
        color: 'white',
        start: null,
        end: null,
        ...obj
    }
    if (!values._uuid) {
        values._uuid = uuid.v4();
    }
    
    for (const k of ['start', 'end']) {
        if (values[k]) {
            values[k] = new Date(values[k]);
        }
    }
    
    if (!values.end && values.start) {
        values.end = date_add_hour(values.start, 2);
    }
    
    return values;
}

function isEventDisplayable( obj ) {
    
    if (!obj.label || !obj.start || !obj.end) {
        return false;
    }

    const start = new Date(obj.start);
    const end = new Date(obj.end);
    if (isNaN( start ) || isNaN( end )) {
        return false;
    }

    if (end.getTime() < start.getTime()) {
        return false;
    }

    return true;
    
}

function getEventHeader({start, end}) {
    return [start, end].map(
        v => format_date('hh:ii', v)
    ).join(' - ')
}

module.exports = { 
    compareSchedulerEventsByDaysCount,
    withEventDefaultValues,
    isEventDisplayable,
    getEventHeader
}
