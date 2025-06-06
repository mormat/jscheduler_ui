const AbstractViewRenderer = require('./AbstractViewRenderer');
const { MonthView } = require('../views');

const { 
    get_first_day_of_week,
    get_last_day_of_month,
    date_add,
    date_format, 
    DateRange
} = require('@src/utils/date');

class YearViewRenderer extends AbstractViewRenderer {
    
    render(view, options) {
        
        const headers = this.buildHeaders(view, options);
        
        const data = {
            body_id: 'jscheduler_ui-' + this.getUniqueId()
        };
              
        const rows = view.months.map((monthView) => {
            const dateRange = monthView.eventsDateRange;
            
            let label = dateRange.start.toLocaleString(
                options.dateLocale, 
                { month: 'long' }
            );
            label = label[0].toUpperCase() + label.substring(1); // ucfirst
            
            const startDay = dateRange.start.getDay() || 7;
            const style = {
                left  : ((startDay - 1) * 100 / headers.length) + '%',
                width : (dateRange.countDays() * 100 / headers.length) + '%'
            }
            
            const cells_layout = this.buildCellsLayout(
                monthView.getDays().map( day => {
                    const date = new Date(day);

                    return {
                        label: date.getDate(),
                        is_dayoff: [0, 6].includes(date.getDay())
                    }
                })
            );
            
            const events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + data['body_id'],
                dateRange: dateRange,
                events:    options.events.map(function(values) {
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
            
            return { label, style, events_row, cells_layout }
            
        });
        
        const yaxis_width_percent = 8;
        
        data.yacis_width = yaxis_width_percent + '%';
        data.column_width= ((100 - yaxis_width_percent) / headers.length) + '%';
        
        const vars = { headers, rows, data };
        
        return this._renderTemplate( 'yearview', vars );
    }
    
    buildHeaders(view, { dateLocale }) {
        const headers = [];
        
        const dateRange = view.months.map(({eventsDateRange}) => {
            return new DateRange(
                get_first_day_of_week(eventsDateRange.start) + ' 00:00:00.000',
                eventsDateRange.end,
            );
        }).sort((a, b) => a.length - b.length).pop();
        
        const current = dateRange.start;
        while (current < dateRange.end) {
            const label = current.toLocaleString(
                dateLocale,
                { weekday: 'short' }
            ).substring(0, 1).toUpperCase();
            
            headers.push({ label });
            current.setDate(current.getDate() + 1);
        }
        
        return headers;;
    }
}

module.exports = YearViewRenderer;
