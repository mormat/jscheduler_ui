
const AbstractViewRenderer = require('./AbstractViewRenderer');

const { DateRange, date_format } = require('@src/utils/date');
const { composeMaps } = require('@src/utils/collection');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');

class DaysViewRenderer extends AbstractViewRenderer {

    render( view, options ) {

        const events = view.filterEvents( options.events );

        const days = view.getDays();

        const vars = { 
            rows: view.hours.map((hour) => {
                return {
                    label: String(hour).padStart(2, '0') + ':00',
                }
            }),
        };

        vars.translations = this.getTranslations();
        vars.headerId   = 'jscheduler_ui-' + this.getUniqueId();
        vars.bodyId     = 'jscheduler_ui-' + this.getUniqueId();
        vars.show_headers = days.length > 1;

        vars.days = days.map((day) => {
            
            const dateRange = new DateRange(
                day + ` ${ view.minHour }:00:00.000`,
                day + ` ${ view.maxHour + 1 }:00:00.000`,
            );
            
            const label = new Date(day).toLocaleString(
                options.dateLocale, 
                { weekday: 'short', month: 'short', day:'numeric' }
            )
            
            const events_column = this.withEventsColumnPartial({
                events:    events.filter(e => dateRange.contains(e)),
                dateRange: dateRange,
                eventDroppableTarget: '#' + vars.bodyId
            });
            const date = new Date(day);
            const is_dayoff = [0,6].includes(date.getDay());
            
            return {
                label, events_column, is_dayoff
            }
        });
        
        if (vars.rows.length) {
            vars.rows[0]._days = vars.days;
            vars.rows[0].grid  = this.withGridPartial({rows: vars.rows.length});
        }
        
        const columnEventsUuids = vars.days.map(c => c.events_column.events)
            .flat().map(e => e._uuid);
        const spannedEvents = events.filter(e => !columnEventsUuids.includes(e._uuid));
        if ( spannedEvents.length ) {
                
            this.includeEventsRow(vars, view, {
                events: spannedEvents,
                eventDroppableTarget: '#' + vars.headerId
            })
            
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
