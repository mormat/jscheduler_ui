const uuid = require('uuid');

const Mustache = require('mustache');

const { date_format, DateRange } = require('@src/utils/date');
const { compareSchedulerEventsByDaysCount } = require('@src/jscheduler_ui/models');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');
const { getEventHeader } = require('../models');

const { templates } = require('../settings');

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
    
    getUniqueId() {
        return uuid.v4();
    }
    
    getTranslations() {
        return this.#translations;
    }
        
    withEventsColumnPartial( { 
        events, 
        dateRange, 
        eventDroppableTarget 
    } ) {

        const stackedEvents = this.stackEvents(
            events.filter(e => dateRange.contains(e))
        );

        const data = {
            day:     'whatever',
            daterange_start: date_format(dateRange.start),
            daterange_end:   date_format(dateRange.end),            
        }

        return {
            data,
            events: stackedEvents.map((event) => {

                const style = {
                    'position': 'absolute',
                    'top': dateRange.calcPercentPosition(event.start) + '%',
                    'bottom': (100 - dateRange.calcPercentPosition(event.end)) + '%',
                    'left':  (event.offset * 100) + '%',
                    'width': (event.length * 100) + '%',
                }

                let className = '';
                if (bootstrapColors.includes(event.bgColor)) {
                    className = 'bg-' + event.bgColor;
                } else {
                    style.backgroundColor = event.bgColor;
                }

                const header = getEventHeader(event);

                return { 
                    ...event, 
                    header,
                    if_draggable:  this.#eventsDraggable,
                    if_resizeable: this.#eventsResizeable,
                    if_clickable:  this.#eventsClickable,
                    if_editable:  this.#eventsEditable,
                    eventDroppableTarget, 
                    style, 
                    className
                }

            })
        };

    }
    
    includeEventsRow(vars, view, options) {
        vars.events_row = this.withEventsRowPartial({
            dateRange: view.eventsDateRange,
            ...options
        });
    }
    
    withEventsRowPartial( { 
        events, 
        dateRange, 
        eventDroppableTarget,
        columnDateRangeType = 'day',
        groupId = undefined,
        labelType,
        fixedEventHeight = null
    } ) {
        
        const stackedEvents = this.stackEvents(
            events.filter(e => dateRange.intersects(e)), 
            { unit: columnDateRangeType }
        );
        
        const attr = {
            'data-column_daterange_type': columnDateRangeType,
        }
        if (groupId !== undefined) {
            attr['data-group_id'] = JSON.stringify(groupId);
        }

        const events_row = {
            
            for_each_events: stackedEvents.map ( ( event ) => {
                const intersect = dateRange.intersects(event);
                
                const { start, end } = intersect.fill(columnDateRangeType);

                const style = {
                    top: (event.offset * 100) + '%',
                    height: (event.length * 100) + '%',
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
            }),
            
            dateRange: {
                start: date_format(dateRange.start, 'yyyy-mm-dd hh:ii:ss'),
                end:   date_format(dateRange.end,   'yyyy-mm-dd hh:ii:ss')
            },
            style: {
                height: '100%',
            },
            attr,
            attrs: Object.entries(attr).map(e => ({key: e[0], value: e[1]}))
        };

        if (fixedEventHeight) {
            const maxOffset = Math.max(...events_row.for_each_events.map(
                ({ event }) => event.offset
            ));

            events_row.style['height'] = (fixedEventHeight / (1 - maxOffset)) + 'px';
        }

        return events_row;

    }

    buildCellsLayout(items) {
        
        const data = { 
            cell_width: (100 / items.length) + '%' 
        }
        
        const cells = items.map(({label, is_dayoff, disabled}) => {
            const classes = [];
            
            if (is_dayoff) {
                classes.push('jscheduler_ui-cell-dayoff');
            }
            
            if (disabled) {
                classes.push('jscheduler_ui-cell-disabled');
            }
            
            return { label, className: classes.join(' ') };
        });
        
        return { data, cells }
        
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
    
    // events should be rendered separately when overlapping each other
    // returns an index (in %) and an offset (in %) for each events
    stackEvents(events, { unit } = {} ) {
        const sortedEvents = [...events].sort(compareSchedulerEventsByDaysCount);
        const dateRangesByEvents = new Map(
            sortedEvents.map((event) => {
                let dateRange = DateRange.fromObject(event);
        
                if (unit) {
                    dateRange = dateRange.fill(unit);
                } else {
                    dateRange = new DateRange(dateRange.start, dateRange.end - 1);
                }
        
                return [event, dateRange];
            })
        );

        const offsetAndLengthByDateRanges = getOffsetAndLengthByDateRanges(
            [...dateRangesByEvents.values()]
        );

        const stackedEvents = [];
        for (const event of sortedEvents) {
            const { offset, length } = offsetAndLengthByDateRanges.get(
                dateRangesByEvents.get(event)
            );
            stackedEvents.push({ ...event, offset, length });
        }

        return stackedEvents;
    }

    
    _renderTemplate(templateName, vars) {
        
        const template = templates[templateName];
        const partials = this._getPartialsTemplates();
        return Mustache.render( templates[templateName], vars, partials);
    }
    
    _getPartialsTemplates() {
        const prefix = 'partials__';
        const partials = {};
        for (const k in templates) {   
            if (k.startsWith(prefix)) {
                partials[k.substr(prefix.length)] = templates[k];
            }
        }
        return partials;
    }
    
    
}

const bootstrapColors = [
    'primary', 'secondary', 'success', 'danger', 
    'warning', 'info', 'light', 'dark', 'white'
]


module.exports = AbstractViewRenderer;

