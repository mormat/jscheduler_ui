const AbstractViewRenderer = require('./AbstractViewRenderer');
const { MonthView } = require('../views');

const { date_format, DateRange, getWeekDays } = require('@src/utils/date');

class YearViewRenderer extends AbstractViewRenderer {
    
    render(view, options) {
        
        const days = [];
        
        const months = [];
        for (let i = 1; i <= 12; i++) {
            
            // @todo Creating months should be done in view
            const firstDay = view.fullYear + '-' + i + '-01';
            
            const dateRange = DateRange.createForMonth( firstDay );
            
            let text = dateRange.start.toLocaleString(
                options.dateLocale, 
                { month: 'long' }
            );
            text = text[0].toUpperCase() + text.substring(1); // ucfirst
            
            const weeks = (new MonthView({currentDate: firstDay})).weeks;
            
            const monthdays = [];
            for (let n = 1; n <= dateRange.countDays(); n++) {
                const day  = date_format(dateRange.start, `yyyy-mm-${n}`);
                const date = new Date(day);
                const is_dayoff = [0,6].includes(date.getDay());
                monthdays.push({ day_of_month: n, is_dayoff });
            }
            
            const startDay = dateRange.start.getDay() || 7;

            const events = options.events.filter( 
                e => dateRange.intersects(e) 
            );

            months.push({ 
                text, 
                dateRange, 
                weeks, 
                monthdays,
                startDay,
                events
            });
        };
        
        const maxNumberOfWeeks = Math.max(...months.map(m => m.weeks.length));
        for (let w = 1; w <= maxNumberOfWeeks ; w++) {
            let weekDays = getWeekDays({dateLocale: options.dateLocale});
            if (w === maxNumberOfWeeks) {
                const maxNumDay = Math.max(...months
                    .filter(m => m.weeks.length === maxNumberOfWeeks)
                    .map(m => m.dateRange.end.getDay() || 7)
                );
                weekDays = weekDays.filter((_, n) => n < maxNumDay);
            }
                        
            days.push(
                ...weekDays.map(function(weekDay, n) {
                    const text = weekDay.substring(0, 1).toUpperCase();
                    const numday_in_week = n + 1;
                    return { text, numday_in_week  };
                })
            );
                
        }
        
        const vars = { 
            days, 
            months,
        };
        
        vars.bodyId = 'jscheduler_ui-' + this.getUniqueId();
        
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
        
        return this._renderTemplate( 'yearview', vars );
    }
    
}

module.exports = YearViewRenderer;
