
const AbstractViewRenderer = require('./AbstractViewRenderer');

const { getEventHeader } = require('../models');
const { DateRange } = require('@src/utils/date');
const { composeMaps } = require('@src/utils/collection');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');

class DaysViewRenderer extends AbstractViewRenderer {

    render( view, options ) {

        const events = view.filterEvents( options.events );

        const days = view.getDays().map((day) => {
            const dateRange = new DateRange(
                day + ` ${ view.minHour }:00:00`,
                day + ` ${ view.maxHour + 1 }:00:00`,
            );

            const label = new Date(day).toLocaleString(
                options.dateLocale, 
                { weekday: 'short', month: 'short', day:'numeric' }
            )

            return { 
                value: day, 
                events: events.filter(e => dateRange.contains(e)),
                label, 
                dateRange
            }
        });

        const vars = { 
            hours: view.hours.map((hour) => {
                return {
                    label: String(hour).padStart(2, '0') + ':00',
                }
            }),
            days, 
        };

        vars.translations = this.getTranslations();
        vars.headerId   = 'jscheduler_ui-' + this.getUniqueId();
        vars.bodyId     = 'jscheduler_ui-' + this.getUniqueId();
        vars.show_headers = vars.days.length > 1;

        for (const day of vars.days) {
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
            day.date = new Date(day.value);
            day.is_dayoff = [0,6].includes(day.date.getDay());
        }
        
        if (vars.hours.length) {
            vars.hours[0]._days = vars.days;
            vars.hours[0].grid  = this.withGridPartial({rows: view.hours.length});
        }
        
        const spannedEvents = events.filter( function( otherEvent ) {
            const filter = d => d.events.includes( otherEvent );
            return (days.findIndex( filter ) === -1);
        })
        if ( spannedEvents.length ) {
            
            const minEventHeight = 1;
                
            vars.events_row = {
                ...this.withEventsRowPartial( { 
                    events:    spannedEvents,
                    dateRange: view.eventsDateRange,
                    eventDroppableTarget: '#' + vars.headerId
                } )
            }
            
            const stackOffsets = vars.events_row.for_each_events.map(
                ({ event }) => event.offset
            );
    
            vars.events_row_height = (22 / (1 - Math.max(...stackOffsets))) + 'px'
        }
        
        const xaxis_width_percent = 5;
        vars['$root'] = {
            xaxis_width_percent,
            column_width_percent: (100 - xaxis_width_percent) / days.length
        };
        
        return this._renderTemplate( 'daysview', vars );
    }
    
}

module.exports = DaysViewRenderer;
