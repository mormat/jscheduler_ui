const Mustache = require('mustache');
const { 
    DayView, 
    WeekView, 
    MonthView,
    YearView
}  = require('./views');

const AbstractViewRenderer = require('./renderers/AbstractViewRenderer');
const DaysViewRenderer = require('./renderers/DaysViewRenderer');
const MonthViewRenderer = require('./renderers/MonthViewRenderer');
const YearViewRenderer = require('./renderers/YearViewRenderer');
const AbstractGroupsRenderer = require('./renderers/AbstractGroupsRenderer');
const DayGroupsRenderer = require('./renderers/DayGroupsRenderer');
const WeekGroupsRenderer = require('./renderers/WeekGroupsRenderer');
const MonthGroupsRenderer = require('./renderers/MonthGroupsRenderer');
const YearGroupsRenderer = require('./renderers/YearGroupsRenderer');

const { templates } = require('./settings');

function createViewRenderer( view, options ) {
    
    if (view instanceof DayView) {
        return new RootDecorator(
            options.showGroups ?
            new DayGroupsRenderer( options ) :
            new DaysViewRenderer( options ),
            options
        )
    }
    
    if (view instanceof WeekView) {
        return new RootDecorator(
            options.showGroups ?
            new WeekGroupsRenderer( options ) :
            new DaysViewRenderer( options ),
            options
        )
    }
    
    if ( view instanceof MonthView ) {
        return new RootDecorator(
            options.showGroups ?
            new MonthGroupsRenderer( options ):
            new MonthViewRenderer( options ),
            options
        );
    }
    
    if ( view instanceof YearView ) {
        return new RootDecorator(
            options.showGroups ?
            new YearGroupsRenderer( options ):
            new YearViewRenderer( options ),
            options
        );
    }
    
}

function RootDecorator( decorated, options) {
    
    const{ styles } = options;
    
    this.render = function(view) {
        const vars = {
            innerHTML: decorated.render(view, options),
            styles: Object.entries( styles ).map(
                ([name, value]) => ({name, value})
            )
        };
        
        return Mustache.render( templates['root'], vars );
    }
    
}

module.exports = { createViewRenderer }