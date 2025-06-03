const uuid = require('uuid');

const Mustache = require('mustache');

const { date_format, DateRange } = require('@src/utils/date');
const { compareSchedulerEventsByDaysCount } = require('@src/jscheduler_ui/models');
const { composeMaps } = require('@src/utils/collection');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');
const { groupDateRangedItemsByPosition } = require('@src/utils/date');

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

        const groupedEvents = groupDateRangedItemsByPosition(
            events.filter(e => dateRange.contains(e))
        );

        return {
            for_each_events: groupedEvents.map((events, indexEvent) => {
                return events.map((event) => {

                    const style = {
                        'position': 'absolute',
                        'top': dateRange.calcPercentPosition(event.start) + '%',
                        'bottom': (100 - dateRange.calcPercentPosition(event.end)) + '%',
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
                start: date_format(dateRange.start, 'yyyy-mm-dd hh:ii:ss'),
                end:   date_format(dateRange.end,   'yyyy-mm-dd hh:ii:ss')
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

