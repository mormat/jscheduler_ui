
const AbstractViewRenderer = require('./AbstractViewRenderer');

class MonthViewRenderer extends AbstractViewRenderer {
    
     render( view, options ) {

        const vars = {
            translations: this.getTranslations(),
            bodyId: 'jscheduler_ui-' + this.getUniqueId(),
        }
        
        const weeks = view.weeks;
        
        vars.weeks = weeks.map((week) => {
            
            const events = week.filterEvents(options.events);
            
            const events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + vars.bodyId,
                dateRange: week.eventsDateRange,
                events:    events
            });
            
            const style = {
                height: (100 / weeks.length) + '%'
            }
            
            const grid = this.withGridPartial({cols: 7});
            
            const days = week.getDays().map( (day) => {
                const date = new Date(day);
                
                return {
                    numday: date.getDate(),
                    value:  date,
                    isCurrentMonth: date.getMonth() === view.month
                }
                
            });
                        
            for ( const m in days ) {
                
                const day = days[m];
                
                day.style = {
                    width: (100 / 7) + '%',
                    left: (100 * m / 7) + '%'
                };

                day.active = function() {
                    return day.isCurrentMonth ? 'active': 'inactive';
                }

            }
            
            const daysoff = days.map((v, k) => {
                const date = v.value;
                const style = {   
                    width: ( 100 / 7 )     + '%',
                    left:  ( k * 100 / 7 ) + '%'
                }
                return { date, style }
            }).filter(v => [0, 6].includes(v.date.getDay()) );
            
            return {
                dateRange: week.eventsDateRange,
                events,
                events_row,
                style,
                grid,
                days,
                daysoff
            }
            
        });
        
        vars.weekdays = vars.weeks[0].days.map(( { value } ) => {
            return value.toLocaleString(
                options.dateLocale, 
                { weekday: 'short'}
            )
        });
        
        return this._renderTemplate( 'monthview', vars );

    }
    
}

module.exports = MonthViewRenderer;