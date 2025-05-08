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
    
    if (view instanceof DayView) {
        return new RootDecorator(
            options.showTimeline ?
            new DayTimelineRenderer( options ) :
            new DaysViewRenderer( options ),
            options
        )
    }
    
    if (view instanceof WeekView) {
        return new RootDecorator(
            options.showTimeline ?
            new WeekTimelineRenderer( options ) :
            new DaysViewRenderer( options ),
            options
        )
    }
    
    if ( view instanceof MonthView ) {
        return new RootDecorator(
            options.showTimeline ?
            new MonthTimelineRenderer( options ):
            new MonthViewRenderer( options ),
            options
        );
    }
    
    if ( view instanceof YearView ) {
        return new RootDecorator(
            options.showTimeline ?
            new YearTimelineRenderer( options ):
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
    
    withEventsColumnPartial( { 
        events, 
        dateRange, 
        eventDroppableTarget 
    } ) {

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



    withEventsRowPartial( { 
        events, 
        dateRange, 
        eventDroppableTarget,
        dateRangeConverter = getDateRangeByDay
    } ) {


        const sortedEvents = [...events].sort(compareSchedulerEventsByDaysCount);
        const dateRangesByEvents = new Map(
            sortedEvents.map((event) => {
                const { start, end } = dateRangeConverter(event);
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

                const { start, end } = dateRangeConverter(intersect);

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

function getDateRangeByDay({ start, end }) {
    return {
        start: new Day(start) + ' 00:00:00.000',
        end:   new Day(end)   + ' 23:59:59.999'
    }
}

function getDateRangeByMonth({ start, end }) {
    
    const endDate = new Date(end);
    endDate.setDate(1);
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(endDate.getDate() - 1);
    return {
        start: format_date('yyyy-mm', start)   + '-01 00:00:00.000',
        end:   format_date('yyyy-mm-dd', endDate) + ' 23:59:59.999'
    }
}

function getDateRangeByHour({ start, end }) {

    const startDate = new Date(start);
    const endDate = new Date(end);
    startDate.setMinutes(0);
    endDate.setMinutes(0);
    endDate.setHours(1 + endDate.getHours());
    endDate.setMinutes(-1);
    console.log({
        startDate: format_date('yyyy-mm-dd hh:ii', startDate) + ':00.000', 
        endDate:   format_date('yyyy-mm-dd hh:ii', endDate)   + ':59.999'
    });
    return {
        start: format_date('yyyy-mm-dd hh:ii', start)   + ':00.000',
        end:   format_date('yyyy-mm-dd hh:ii', endDate) + ':59.999'
    }
}


class AbstractTimelineRenderer extends AbstractViewRenderer {
    
    get yaxisWidthPercent() {
        return 15;
    }
    
    getCols() {
        return [];
    }
    
    getData() {
        return {};
    }
    
    getEvents() {
        return [];
    }
    
    getEventsDateRangeConverter() {
        return getDateRangeByDay;
    }
    
    render(view) {
        const vars = { ...view.vars };
        
        const yaxis_width_percent = 15;
        
        const dateRange = view.eventsDateRange;
        const events    = this.getEvents(view).filter(
            e => dateRange.intersects(e)
        );
        
        const sections = [ ...vars.sections ];
        
        vars.xaxis = {
            cols: this.getCols(view),
        }
        
        vars.yaxis = {
            style: {
                width: yaxis_width_percent + '%'
            },
            rows: sections.map((section) => {
                const { text } = section;

                const events_row = this.withEventsRowPartial({
                    eventDroppableTarget: '#foobar',
                    dateRange: dateRange,
                    events:    events.filter(
                        e => e.values.section_id == section.id
                    ),
                    dateRangeConverter: this.getEventsDateRangeConverter(),
                });
                
                const grid = this.withGridPartial(
                    { cols: vars.xaxis.cols.length }
                );
                
                return { text, events_row, grid }
            })
        }
        
        vars.data = this.getData();
        
        console.log('vars', vars);
        
        return Mustache.render( templates['timeline'], vars, partials);
    }
    
}

class DayTimelineRenderer extends AbstractTimelineRenderer {
    
    getData() {
        return {'type_view': 'day'};
    }
    
    getEvents( { vars }) {
        return [
            [...vars.spannedEvents],
            ...vars.days.map(d => d.events)
        ].flat();
    }
    
    getCols() {
        const cols = [];
        
        for (let i = 0; i < 24; i++) {
            const strtime = `1970-01-01 ${i}:00`;
            const text    = format_date('hh', strtime);
            cols.push({ text })
        }
        
        return cols;
    }
    
    getEventsDateRangeConverter() {
        return getDateRangeByHour;
    }
    
}

class WeekTimelineRenderer extends AbstractTimelineRenderer {
    
    getData() {
        return {'type_view': 'week'};
    }
    
    getEvents( { vars }) {
        return [
            [...vars.spannedEvents],
            ...vars.days.map(d => d.events)
        ].flat();
    }
    
    getCols( { vars }) {
        return vars.days.map((d) => {

            const text = new Date(d.value).toLocaleString(
                'en', 
                { weekday: 'short' }
            )
            const subtext = new Date(d.value).toLocaleString(
                'en', 
                { day:'numeric' }
            )
            const style = {
                width: ((100 - this.yaxisWidthPercent) / 7) + '%',
            }

            return { text, subtext, style }

        });
    }
    
}

class MonthTimelineRenderer extends AbstractTimelineRenderer {
    
    getData() {
        return {'type_view': 'month'};
    }
    
    getEvents( { vars }) {
        const events = [];
        for (const week of vars.weeks) {
            events.push(...week.events);
        }
        
        return events;
    }
    
    getCols( { vars }) {
    
        const cols = [];
        
        for (const week of vars.weeks) {
            for (const day of week.days) {
                const { date } = day.value ;
                const text = date.toLocaleString(
                    'en',
                    { weekday: 'short' }
                )[0];
                const subtext = date.toLocaleString(
                    'en',
                    { day: 'numeric' }
                )
                const disabled = !day.isCurrentMonth;
        
                const style = {
                    width: ((100 - this.yaxisWidthPercent) / (vars.weeks.length * 7)) + '%',
                }
        
                cols.push({ text, subtext, style, disabled });
            }
        }
        
        return cols;
        
    }
    
}

class YearTimelineRenderer extends AbstractTimelineRenderer {
        
    getData() {
        return {'type_view': 'year'};
    }
    
    getEvents( { vars }) {
        const events = [];
        for (const month of vars.months) {
            events.push( ...month.events );
        }
        return events;
    }
        
    getCols( ) {
        
        const cols = [];
        
        for (let i = 1; i <= 12; i++) {
            const date = new Date(`1970-${i}-01`);
            const text = date.toLocaleString(
                "en",
                { month: 'short' }
            );
            const style = {
                width: ((100 - this.yaxisWidthPercent) / 12) + '%',
            }
            cols.push({ text, style });
        }
        
        return cols;
        
    }
    
    getEventsDateRangeConverter() {
        return getDateRangeByMonth;
    }
    
}


module.exports = { createViewRenderer }