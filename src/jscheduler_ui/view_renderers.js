const { Day, format_date, DateRange } = require('@src/utils/date');
const { groupDateRangedItemsByPosition } = require('@src/utils/date');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');
const { composeMaps } = require('@src/utils/collection');
const { compareSchedulerEventsByDaysCount } = require('@src/jscheduler_ui/models');
const Mustache = require('mustache');

const { 
    DayView, 
    WeekView, 
    MonthView,
    YearView
}  = require('./views');

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
    
    if ( view instanceof YearView ) {
        return new RootDecorator(
            new YearViewRenderer( options ),
            options
        );
    }
    
}

class AbstractViewRenderer {
    
    #eventsClickable;
    #eventsDraggable;
    #eventsResizeable;
    #eventsEditable;
    #translations;
    
    constructor( { 
        eventsClickable, 
        eventsResizeable, 
        eventsDraggable,
        eventsEditable,
        translations = {}
    } ) {
        
        this.#eventsClickable = eventsClickable;
        this.#eventsDraggable = eventsDraggable;
        this.#eventsResizeable = eventsResizeable;
        this.#eventsEditable = eventsEditable;
        this.#translations   = {
            edit_event_btn: 'Edit the event',
            ...translations
        }
        
        
    }
    
    getTranslations() {
        return this.#translations;
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
                        if_editable:  this.#eventsEditable,
                        event, eventDroppableTarget, style, className
                    }

                });
            }).flat()
        };

    }

    withEventsRowPartial( { events, dateRange, eventDroppableTarget } ) {

        const sortedEvents = [...events].sort(compareSchedulerEventsByDaysCount);
        const dateRangesByEvents = new Map(
            sortedEvents.map((event) => {
                const start = new Date(new Day(event.start) + ' 00:00:00.000');
                const end   = new Date(new Day(event.end)   + ' 23:59:59.999');
                return [event, new DateRange(start, end)];
            })
        );
        const offsetLengthByEvents = composeMaps(
            dateRangesByEvents,
            getOffsetAndLengthByDateRanges(
                [...dateRangesByEvents.values()]
            )
        );

        return {
            
            for_each_events: events.map ( ( event ) => {
                const intersect = dateRange.intersects(event);
                if (!intersect) {
                    return null;
                }

                const start = new Day(intersect.start) + ' 00:00:00';
                const end   = new Day(intersect.end)   + ' 23:59:59';

                const eventOffset = offsetLengthByEvents.get(event).offset;
                const eventLength = offsetLengthByEvents.get(event).length;

                const style = {
                    top: (eventOffset * 100) + '%',
                    height: (eventLength * 100) + '%',
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
                    if_editable:  this.#eventsEditable,
                    event, eventDroppableTarget, style, className
                }
            }).filter(i => i),
            
            dateRange: {
                start: format_date('yyyy-mm-dd hh:ii:ss', dateRange.start),
                end:   format_date('yyyy-mm-dd hh:ii:ss', dateRange.end)
            },
            style: {
                height: '100%'
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

        vars.translations = this.getTranslations();
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
            
            const dateRangesByEvents = new Map(
                vars.spannedEvents.map(
                    item => [item, new DateRange(item.start, item.end)] 
                )
            );
            const offsetLengthByEvents = composeMaps(
                dateRangesByEvents,
                getOffsetAndLengthByDateRanges(
                    [...dateRangesByEvents.values()]
                )
            );
    
            const minEventHeight = Math.min(
                ... [...offsetLengthByEvents.values()].map(i => i.length) 
            );
                
            vars.events_row = {
                ...this.withEventsRowPartial( { 
                    events:    vars.spannedEvents,
                    dateRange: vars.eventsDateRange,
                    eventDroppableTarget: '#' + vars.headerId
                } ),
                colspan: vars.days.length
            }
            vars.events_row_height = (22 / minEventHeight) + 'px'
        }

        return Mustache.render( templates['daysview'], vars, partials);
    }
    
}

class MonthViewRenderer extends AbstractViewRenderer {
    
     render( view ) {

        const vars = { ...view.vars };

        vars.translations = this.getTranslations();
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

class YearViewRenderer extends AbstractViewRenderer {
    
    render(view) {
        
        const vars = { ...view.vars };
        
        vars.bodyId = 'jscheduler_ui-' + getUniqueId();
        
        vars.row_colspan = vars.days.length;
                
        const yaxis_width_percent = 8;
        
        for (const day of vars.days) {
            day.style = {
                width: ( (100 - yaxis_width_percent) / vars.days.length ) + '%'
            }
        }
        
        vars.yaxis = {
            style: {
                width: yaxis_width_percent + '%'
            }
        }
        
        for (const month of vars.months) {
            month.grid = this.withGridPartial({cols: vars.days.length});
            
            for (const i in month.monthdays) {
                month.monthdays[i].width = (100 / (month.monthdays.length)) + '%';
                month.monthdays[i].left  = (i * 100 / (month.monthdays.length)) + '%';
            }
            
            const { startDay } = month;
            month.style = {
                left  : ((startDay - 1) * 100 / vars.days.length) + '%',
                width : (month.dateRange.countDays() * 100 / vars.days.length) + '%'
            }
            
            month.events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + vars.bodyId,
                dateRange: month.dateRange,
                events:    month.events.map(function({values}) {
                    let { label, short_label } = values;
                    if (short_label) {
                        const dateRange = new DateRange(values.start, values.end);
                        if (dateRange.countDays() <= 1) {
                            label = short_label;
                        }
                    }
                    return { ...values, label }
                })
            });
            
        }
        
        console.log('vars', vars);
        
        return Mustache.render( templates['yearview'], vars, partials);
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