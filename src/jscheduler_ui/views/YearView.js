const { 
    DateRange,
    date_format
} = require('@src/utils/date');

const AbstractView = require('./AbstractView');

class YearView extends AbstractView {
    
    #fullYear;
    
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
    }
        
    getLabel() {
        return this.#fullYear;
    }
    
    get fullYear() {
        return this.#fullYear
    }
    
}

module.exports = YearView;