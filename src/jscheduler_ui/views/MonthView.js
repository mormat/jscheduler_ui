const { 
    DateRange,
    get_first_day_of_month,
    get_last_day_of_month,
    get_first_day_of_week,
    get_last_day_of_week,
    date_add
} = require('@src/utils/date');

const AbstractView = require('./AbstractView');
const WeekView = require('./WeekView');

class MonthView extends AbstractView {
    
    #month;
    #fullYear;
    #weeks;
    
    constructor({ currentDate, ...otherParams }){
        
        super({ 
            eventsDateRange: new DateRange(
                get_first_day_of_week(
                    get_first_day_of_month(currentDate)
                ) + ' 00:00:00.000',
                get_last_day_of_week(
                    get_last_day_of_month(currentDate)
                ) + ' 23:59:59.999',
            ),
            ...otherParams
        });
        
        this.#month     = (new Date(currentDate)).getMonth();
        this.#fullYear  = (new Date(currentDate)).getFullYear();
        
        this.#weeks = [];
        let date = new Date(this.eventsDateRange.start);
        while (date < this.eventsDateRange.end) {
            this.#weeks.push( new WeekView({currentDate: date }) );
            date = date_add(date, 1, 'week');
        }
        
    }
    
    get month() {
        return this.#month;
    }
    
    get fullYear() {
        return this.#fullYear;
    }
    
    getLabel({ dateLocale }) {
        return new Date(this.fullYear, this.month).toLocaleString(
            dateLocale, 
            { month: 'long',  year:'numeric' }
        );
    }
    
    get weeks() {
        return this.#weeks;
    }
    
}

module.exports = MonthView;