const AbstractDaysView = require('./AbstractDaysView');

const { 
    DateRange,
    date_format
} = require('@src/utils/date');

class DayView extends AbstractDaysView {
    
    constructor({ currentDate, ...otherParams }) {        
        
        const eventsDateRange = new DateRange(
            date_format(currentDate, 'yyyy-mm-dd 00:00:00.000'),
            date_format(currentDate, 'yyyy-mm-dd 23:59:59.999'),
        );
        
        super({ eventsDateRange, ...otherParams });
    }
    
    getLabel({ dateLocale }) {
        const { start } = this.eventsDateRange;
        return start.toLocaleString(
            dateLocale, 
            { 
                weekday: 'long', 
                month: 'long', 
                day:'numeric',
                year: 'numeric'
            }
        )
    }
    
}

module.exports = DayView;