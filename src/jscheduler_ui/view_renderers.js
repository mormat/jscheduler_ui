const { Day, format_date, DateRange } = require('@src/utils/date');
const { groupDateRangedItemsByPosition } = require('@src/utils/date');
const Mustache = require('mustache');

const { DayView, WeekView, MonthView }  = require('./views');

const templates = __MUSTACHE_TEMPLATES__;
const partials  = __MUSTACHE_PARTIALS__;

function createViewRenderer( view, options ) {
    
    if (view instanceof DayView || view instanceof WeekView) {
        return new RootDecorator(
            new DaysViewRenderer( options ),
            options
        );
    }
    
    if ( view instanceof MonthView ) {
        return new RootDecorator(
            new MonthViewRenderer( options ),
            options
        );
    }
    
}

class AbstractViewRenderer {
    
    #eventsClickable;
    #eventsDraggable;
    #eventsResizeable;
    
    constructor( { eventsClickable, eventsResizeable, eventsDraggable} ) {
        
        this.#eventsClickable = eventsClickable;
        this.#eventsDraggable = eventsDraggable;
        this.#eventsResizeable = eventsResizeable;
        
    }
    
    withEventsColumnPartial( { events, dateRange, eventDroppableTarget } ) {

        const groupedEvents = groupDateRangedItemsByPosition(
            events.filter(e => dateRange.contains(e))
        );

        return {
            for_each_events: groupedEvents.map((events, indexEvent) => {
                return events.map((event) => {

                    const style = {
                        'position': 'absolute',
                        'top': ceil(dateRange.calcPercentPosition(event.start), 2) + '%',
                        'bottom': ceil(100 - dateRange.calcPercentPosition(event.end), 2) + '%',
                        'left':  (indexEvent * 100 / groupedEvents.length) + '%',
                        'width': (100 / groupedEvents.length) + '%',
                    }
                    
                    let className = '';
                    if (bootstrapColors.includes(event.bgColor)) {
                        className = 'bg-' + event.bgColor;
                    } else {
                        style.backgroundColor = event.bgColor;
                    }
                    
                    return { 
                        if_draggable:  this.#eventsDraggable,
                        if_resizeable: this.#eventsResizeable,
                        if_clickable:  this.#eventsClickable,
                        event, eventDroppableTarget, style, className
                    }

                });
            }).flat()
        };

    }

    withEventsRowPartial( { events, dateRange, eventDroppableTarget } ) {

        const eventHeight = '20';

        const groupedEvents = groupDateRangedItemsByPosition(
            events.filter(e => dateRange.intersects(e))
        );

        return {
            for_each_events: groupedEvents.map((events, eventIndex) => {
                return events.map( ( event ) => {

                    const intersect = dateRange.intersects(event);

                    const start = new Day(intersect.start) + ' 00:00:00';
                    const end   = new Day(intersect.end)   + ' 23:59:59';

                    const style = {
                        top: (eventIndex * eventHeight) + 'px',
                        height: eventHeight + 'px',
                        left: dateRange.calcPercentPosition(start) + '%',
                        right: (100 - dateRange.calcPercentPosition(end)) + '%'
                    }
                    
                    let className = '';
                    if (bootstrapColors.includes(event.bgColor)) {
                        className = 'bg-' + event.bgColor;
                    } else {
                        style.backgroundColor = event.bgColor;
                    }

                    return {
                        if_draggable: this.#eventsDraggable,
                        if_clickable: this.#eventsClickable,
                        event, eventDroppableTarget, style, className
                    }

                });
            }).flat(),
            dateRange: {
                start: format_date('yyyy-mm-dd hh:ii:ss', dateRange.start),
                end:   format_date('yyyy-mm-dd hh:ii:ss', dateRange.end)
            },
            style: {
                height: (eventHeight * groupedEvents.length) + 'px'
            }

        };

    }

    withGridPartial( { cols = 1, rows = 1 } ) {

        const hseps = [...Array(cols - 1)].map( (_, n) => ({
            style: {
                left: ((n + 1) * 100 / cols) + '%'
            } 
        }));

        const vseps = [...Array(rows - 1)].map( (_, n) => ({
            style: {
                top: ((n + 1) * 100 / rows) + '%'
            } 
        }));

        return { hseps, vseps }

    }
    
}

class DaysViewRenderer extends AbstractViewRenderer {

    render(view) {

        const HOUR_WIDTH_PERCENT = 5;

        const vars = { ...view.vars };

        vars.headerId   = 'jscheduler_ui-' + getUniqueId();
        vars.bodyId     = 'jscheduler_ui-' + getUniqueId();
        vars.has_header = vars.days.length > 1;

        for (const hour of vars.hours) {
            hour.style = {
                width: HOUR_WIDTH_PERCENT + '%'
            }   
        }

        for (const day of vars.days) {
            day.style = {
                width: ceil((100 - HOUR_WIDTH_PERCENT) / vars.days.length, 2) + '%'
            };
            day.rowspan = vars.hours.length;
            day.data = {
                day:     day.value,
                minhour: `${ view.minHour }:00:00`,
                maxhour: `${ view.maxHour + 1 }:00:00`,
            };
            day.events_column = this.withEventsColumnPartial({
                events: day.events,
                dateRange: day.dateRange,
                eventDroppableTarget: '#' + vars.bodyId
            });
        }

        vars.hours[0]._days = vars.days;
        vars.hours[0].grid  = this.withGridPartial({rows: view.hours.length});
        vars['hours[0]'] = vars.hours[0];

        if ( vars.spannedEvents.length ) {
            vars.events_row = {
                ...this.withEventsRowPartial( { 
                    events:    vars.spannedEvents,
                    dateRange: vars.eventsDateRange,
                    eventDroppableTarget: '#' + vars.headerId
                } ),
                colspan: vars.days.length
            }
        }

        return Mustache.render( templates['daysview'], vars, partials);
    }
    
}

class MonthViewRenderer extends AbstractViewRenderer {
    
     render( view ) {

        const vars = { ...view.vars };

        vars.bodyId = 'jscheduler_ui-' + getUniqueId();

        for (const week of vars.weeks) {

            week.events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + vars.bodyId,
                dateRange: week.dateRange,
                events: week.events
            });

            week.style = {
                height: (100 / view.weeks.length) + '%'
            }

            week.grid = this.withGridPartial({cols: 7});

            for ( const m in week.days ) {

                const day = week.days[m];

                day.style = {
                    width: (100 / 7) + '%',
                    left: (100 * m / 7) + '%'
                };

                day.active = function() {
                    return day.isCurrentMonth ? 'active': 'inactive';
                }

            }
        }

        return Mustache.render( templates['monthview'], vars, partials );

    }
    
}

function RootDecorator( decorated, { styles }) {
    
    this.render = function(view) {
        const vars = {
            innerHTML: decorated.render(view),
            styles: Object.entries( styles ).map(
                ([name, value]) => ({name, value})
            )
        };
        
        return Mustache.render( templates['root'], vars );
    }
    
}


const getUniqueId = (function() {
    let lastId = 0;
    return () => ++lastId;    
})();

function ceil(number, precision = 0) { 
    const n = Math.pow(10, precision);
    return Math.round(number * n) / n;
}

const bootstrapColors = [
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'dark', 'white'
]

module.exports = { createViewRenderer }