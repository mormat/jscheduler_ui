const { 
    DateRange,
    date_format,
    get_first_day_of_month,
    get_last_day_of_month
} = require('@src/utils/date');

const AbstractView = require('./AbstractView');

class YearView extends AbstractView {
    
    #fullYear;
    
    #months;
    
    constructor({ 
        currentDate, 
        ...otherParams
    }) {
        super({
            eventsDateRange: new DateRange(
                date_format(currentDate, 'yyyy-01-01 00:00:00.000'),
                date_format(currentDate, 'yyyy-12-31 23:59:59.999'),
            ),
            ...otherParams
        });
        
        this.#fullYear = (new Date(currentDate)).getFullYear();
        
        this.#months = [...Array(12)].map((_, k) => {
            const d = new Date(this.#fullYear, k, 1);
            
            return new AbstractView({
                eventsDateRange: new DateRange(
                    get_first_day_of_month(d) + ' 00:00:00.000',
                    get_last_day_of_month(d) + ' 23:59:59.999',
                )
            });
        });
    }
        
    getLabel() {
        return this.#fullYear;
    }
    
    get fullYear() {
        return this.#fullYear
    }
    
    get months() {
        return this.#months;
    }
    
}

module.exports = YearView;