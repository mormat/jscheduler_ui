
const AbstractViewRenderer = require('./AbstractViewRenderer');

class MonthViewRenderer extends AbstractViewRenderer {
    
     render( view, options ) {
        
        const data = {
            body_id: 'jscheduler_ui-' + this.getUniqueId(),
            cell_width: (100 / 7) + '%',
            row_height: (100 / view.weeks.length) + '%'
        }
        
        const weeks = view.weeks;
        
        const rows = weeks.map((week) => {
            
            const events = week.filterEvents(options.events);
            
            const events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + data['body_id'],
                dateRange: week.eventsDateRange,
                events:    events
            });
            
            const cells_layout = this.buildCellsLayout(
                week.getDays().map( day => {
                    const date = new Date(day);

                    return {
                        label:     date.getDate(),
                        is_dayoff: [0, 6].includes(date.getDay()),
                        disabled: (date.getMonth() !== view.month)
                    }
                })      
            )
            
            return { events_row, cells_layout }
            
        });
        
        const headers = weeks[0].getDays().map(( day ) => {
            const date  = new Date(day);
            const label = date.toLocaleString(
                options.dateLocale, 
                { weekday: 'short'}
            )
    
            return { label }
        });
        
        const vars = {
            translations: this.getTranslations(),
            data, headers, rows
        }
        
        return this._renderTemplate( 'monthview', vars );

    }
    
}

module.exports = MonthViewRenderer;