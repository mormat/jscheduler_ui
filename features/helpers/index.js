
const DaysViewHelper = require('./DaysViewHelper');
const MonthViewHelper = require('./MonthViewHelper');
const YearViewHelper = require('./YearViewHelper');
const GroupsViewHelper = require('./GroupsViewHelper');
const EventsHelper   = require('./EventsHelper');
const DebugRectsHelper   = require('./DebugRectsHelper');
const PageHelper   = require('./PageHelper');

function buildHelpers(params) {
    
    const debugRects = new DebugRectsHelper(params);
    
    return {
        debugRects,
        events:     new EventsHelper(params),
        daysview:   new DaysViewHelper({...params, debugRects}),
        monthview:  new MonthViewHelper({...params, debugRects}),
        yearview:   new YearViewHelper({...params, debugRects}),
        groupsview: new GroupsViewHelper({...params, debugRects})
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
    buildHelpers
}

