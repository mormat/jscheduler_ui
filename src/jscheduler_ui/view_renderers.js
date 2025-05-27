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
const {
    getEventHeader
} = require('./models');

const templates = __MUSTACHE_TEMPLATES__;
const partials  = __MUSTACHE_PARTIALS__;

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
        columnDateRangeType = 'day',
        groupId = undefined,
        labelType,
    } ) {
        
        const sortedEvents = [...events].sort(compareSchedulerEventsByDaysCount);
        const dateRangesByEvents = new Map(
            sortedEvents.map((event) => {
                const dateRange = DateRange.fromObject(event)
                    .fill( columnDateRangeType );
                return [event, dateRange];
            })
        );
        const offsetLengthByEvents = composeMaps(
            dateRangesByEvents,
            getOffsetAndLengthByDateRanges(
                [...dateRangesByEvents.values()]
            )
        );

        const attr = {
            'data-column_daterange_type': columnDateRangeType,
        }
        if (groupId !== undefined) {
            attr['data-group_id'] = JSON.stringify(groupId);
        }

        return {
            
            for_each_events: events.map ( ( event ) => {
                const intersect = dateRange.intersects(event);
                if (!intersect) {
                    return null;
                }

                const { start, end } = intersect.fill(columnDateRangeType);

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

                let description = event.label;
                if (labelType) {
                    const { labels = {} } = event;
                    if (labels[labelType]) {
                        description = labels[labelType]
                    }
                }

                return {
                    if_draggable: this.#eventsDraggable,
                    if_clickable: this.#eventsClickable,
                    if_editable:  this.#eventsEditable,
                    event, eventDroppableTarget, style, className,
                    description
                }
            }).filter(i => i),
            
            dateRange: {
                start: format_date('yyyy-mm-dd hh:ii:ss', dateRange.start),
                end:   format_date('yyyy-mm-dd hh:ii:ss', dateRange.end)
            },
            style: {
                height: '100%'
            },
            attr,
            attrs: Object.entries(attr).map(function([key, value]) {
                return {key, value}
            })
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
                events:    day.events.map(e => {
                    const header = getEventHeader(e);
                    return { ...e, header }
                }),
                dateRange: day.dateRange,
                eventDroppableTarget: '#' + vars.bodyId
            });
            day.is_dayoff = [0,6].includes(day.value.date.getDay());
        }

        if (vars.hours.length) {
            vars.hours[0]._days = vars.days;
            vars.hours[0].grid  = this.withGridPartial({rows: view.hours.length});
            vars['hours[0]'] = vars.hours[0];
        }

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
            
            week.daysoff = week.days.map((v, k) => {
                const { date } = v.value;
                const style = {   
                    width: ( 100 / 7 )     + '%',
                    left:  ( k * 100 / 7 ) + '%'
                }
                return { date, style }
            }).filter(v => [0, 6].includes(v.date.getDay()) );
         
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
                events:    month.events.map(function(values) {
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

class AbstractGroupsRenderer extends AbstractViewRenderer {
    
    get yaxisWidthPercent() {
        return 15;
    }
    
    getCols() {
        return [];
    }
    
    getAttr() {
        return {
            id: 'jscheduler_ui-' + getUniqueId(),
        };
    }
    
    getEvents() {
        return [];
    }
    
    getColumnTimeRangeType() {
       return 'day' 
    }
    
    getDaysOff() {
        return [];
    }
    
    render(view) {
        const vars = { ...view.vars };
        
        const yaxis_width_percent = 15;
        
        const dateRange = view.eventsDateRange;
        
        const groups = [ ...vars.groups ];
        const groupIds = groups.map(g => g.id);
        const events    = this.getEvents(view).filter(
            e => dateRange.intersects(e)
        ).map(function(e) {
            if (e.group_id === undefined) {
                return { ...e, group_id: null }
            }
            if (!groupIds.includes(e.group_id)) {
                if (Number.isInteger(e.group_id)) {
                    return { ...e, group_id: null };
                }
            }
            return e;
        });
        
        const missingGroupIds = new Set(events
            .map(e => e.group_id)
            .filter(v => !groupIds.includes(v))
        );
        // put null at the end
        if (missingGroupIds.has(null)) {    
            missingGroupIds.delete(null);
            missingGroupIds.add(null);
        }
        console.log({missingGroupIds});
        for (const group_id of missingGroupIds) {
            groups.push({
                id:   group_id, 
                label: group_id || ''
            });
        }
        
        vars.attr = this.getAttr();
        
        vars.xaxis = {
            cols: this.getCols(view),
        }
        
        vars.yaxis = {
            style: {
                width: yaxis_width_percent + '%'
            },
            rows: groups.map((section) => {
                const { label } = section;

                const events_row = this.withEventsRowPartial({
                    eventDroppableTarget: '#' + vars.attr['id'],
                    dateRange: dateRange,
                    events:    events.filter(
                        e => (e.group_id || null) == section.id
                    ),
                    columnDateRangeType: this.getColumnTimeRangeType(),
                    groupId: section.id,
                    labelType: 'showGroups'
                });
                
                const grid = this.withGridPartial(
                    { cols: vars.xaxis.cols.length }
                );

                const daysoff = this.getDaysOff(view);
                
                return { label, events_row, grid, daysoff }
            })
        }
        
        return Mustache.render( templates['groups'], vars, partials);
    }
    
}

class DayGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'day'
        };
    }
    
    getEvents( { vars }) {
        return [
            [...vars.spannedEvents],
            ...vars.days.map(d => d.events)
        ].flat();
    }
    
    getCols() {
        const cols = [];
        
        for (let i = 0; i < 12; i++) {
            const strtime = `1970-01-01 ${i * 2}:00`;
            const text    = format_date('hh:ii', strtime);
            cols.push({ text })
        }
        
        return cols;
    }
    
    getColumnTimeRangeType() {
       return 'day_hour' 
    }
    
}

class WeekGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'week'
        };
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
    
    getDaysOff( { vars }) {
        return vars.days.map((v, k) => {
            const { date } = v.value;
            const style = {   
                width: ( 100 / 7 )     + '%',
                left:  ( k * 100 / 7 ) + '%'
            }
            return { date, style }
        }).filter(v => [0, 6].includes(v.date.getDay()) );
    }
    
}

class MonthGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'month'
        };
    }
    
    getEvents( { vars }) {
        const events = [];
        for (const week of vars.weeks) {
            events.push(...week.events);
        }
        
        return events;
    }
    
    getDays( { vars }) {
        
        const days = [];
        for (const week of vars.weeks) {
            days.push(...week.days);
        }
        return days;
        
    }
    
    getCols( { vars }) {
    
        const cols = [];
       
        for (const day of this.getDays({ vars })) {
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
        
        return cols;
        
    }
    
    getDaysOff( { vars }) {
        return this.getDays( { vars }).map((v, k) => {
            
            const { date } = v.value;
            const style = {   
                width: ( 100 / (vars.weeks.length * 7) )     + '%',
                left:  ( k * 100 / (vars.weeks.length * 7) ) + '%'
            }
            return { date, style }
        }).filter(v => [0, 6].includes(v.date.getDay()) );
    }
    
}

class YearGroupsRenderer extends AbstractGroupsRenderer {
        
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'year'
        };
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
    
    getColumnTimeRangeType() {
       return 'month' 
    }
    
}

module.exports = { createViewRenderer }