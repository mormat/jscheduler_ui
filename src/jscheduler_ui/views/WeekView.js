const AbstractDaysView = require('./AbstractDaysView');

const { 
    DateRange,
    get_first_day_of_week,
    get_last_day_of_week,
    date_add
} = require('@src/utils/date');

class WeekView extends AbstractDaysView {
    
    constructor({ currentDate, ...otherParams }) {        
        
        const eventsDateRange = new DateRange(
            get_first_day_of_week( currentDate ) + ' 00:00:00.000',
            get_last_day_of_week( currentDate )  + ' 23:59:59.999'
        );
        
        super({ eventsDateRange, ...otherParams });
    }
        
    getLabel({ dateLocale }) {
        
        const { start, end } = this.eventsDateRange;
        
        return start.toLocaleString(
            dateLocale, 
            { 
                month: 'short', 
                day:'numeric',
                year: 'numeric'
            }
        ) + ' - ' + 
        end.toLocaleString(
            dateLocale, 
            { 
                month: 'short', 
                day:'numeric',
                year: 'numeric'
            }
        );
    }
    
    static createWeeksBetween(dateRange) {
        const weeks = [];
        let date = new Date(dateRange.start);
        while (date < dateRange.end) {
            weeks.push( new WeekView({currentDate: date }) );
            date = date_add(date, 1, 'week');
        }
        return weeks;
    }
    
}

module.exports = WeekView;
