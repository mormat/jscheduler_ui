
const DaysViewHelper = require('./DaysViewHelper');
const MonthViewHelper = require('./MonthViewHelper');
const YearViewHelper = require('./YearViewHelper');
const GroupsViewHelper = require('./GroupsViewHelper');
const EventsHelper   = require('./EventsHelper');
const DebugRectsHelper   = require('./DebugRectsHelper');
const PageHelper   = require('./PageHelper');

function buildInstances(world) {
    
    const debugRects = new DebugRectsHelper(world);
        
    return {
        'page':   new PageHelper(world),
        'events': new EventsHelper(world),
        'daysview': new DaysViewHelper(world, { debugRects }),
        'monthview': new MonthViewHelper(world, { debugRects }),
        'yearview':  new YearViewHelper(world, { debugRects }),
        'groupsview': new GroupsViewHelper(world, { debugRects }),
        'debugRects': debugRects,
    }
    
}

module.exports = { 
    DaysViewHelper,
    MonthViewHelper,
    YearViewHelper,
    GroupsViewHelper,
    EventsHelper,
    DebugRectsHelper,
    PageHelper,
    buildInstances
}

