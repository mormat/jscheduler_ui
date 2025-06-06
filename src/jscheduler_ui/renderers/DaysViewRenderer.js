
const AbstractViewRenderer = require('./AbstractViewRenderer');

const { DateRange, date_format } = require('@src/utils/date');
const { composeMaps } = require('@src/utils/collection');
const { getOffsetAndLengthByDateRanges } = require('@src/utils/date');

class DaysViewRenderer extends AbstractViewRenderer {

    render( view, options ) {

        const events = view.filterEvents( options.events );

        const data = {
            'header_id': 'jscheduler_ui-' + this.getUniqueId(),
            'body_id': 'jscheduler_ui-' + this.getUniqueId()
        };

        const days    = view.getDays();
        
        const headers = days.length <= 1 ? [] : days.map((day) => {
            const label = new Date(day).toLocaleString(
                options.dateLocale, 
                { weekday: 'short', month: 'short', day:'numeric' }
            )
            return { label };
        });
        
        const columns = view.getDays().map((day) => {
            const classes = [];
            
            const dateRange = new DateRange(
                day + ` ${ view.minHour }:00:00.000`,
                day + ` ${ view.maxHour + 1 }:00:00.000`,
            );
            
            const events_column = this.withEventsColumnPartial({
                events:    events.filter(e => dateRange.contains(e)),
                dateRange: dateRange,
                eventDroppableTarget: '#' + data['body_id']
            });
            const date = new Date(day);
            if ([0,6].includes(date.getDay())) {
                classes.push('jscheduler_ui-cell-dayoff');
            }
            
            return { events_column, className: classes.join(' ') }
        });
                
        const rows = view.hours.map((hour, index) => ({
            label: String(hour).padStart(2, '0') + ':00',
            is_first_row: index === 0,
        }));
            
        const xaxis_width_percent = 5;
        data['xaxis_width'] = xaxis_width_percent + '%';
        data['column_width'] = ((100 - xaxis_width_percent) / columns.length) + '%'
        data.row_height = (100 / rows.length) + '%';
        
        const vars = { 
            translations: this.getTranslations(),
            data, headers, columns, rows
        };
        
        const spannedEvents = this.resolveRowEvents(events, columns);
        this.includeEventsRow(vars, view, {
            events: spannedEvents,
            eventDroppableTarget: '#' + data['header_id'],
            fixedEventHeight: 22
        })
        
        return this._renderTemplate( 'daysview', vars );
    }
    
    // returns events that doesn't fit in columns
    resolveRowEvents(events, columns) {
        const columnEventsUuids = columns.map(c => c.events_column.events)
            .flat().map(e => e._uuid);
        return events.filter( e => !columnEventsUuids.includes(e._uuid) );
    }
    
}

module.exports = DaysViewRenderer;
