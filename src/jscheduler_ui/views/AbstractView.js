const { 
    date_format, 
    date_add
} = require('@src/utils/date');

class AbstractView {
    
    #eventsDateRange;
    
    constructor({
        eventsDateRange
    }) {
        this.#eventsDateRange = eventsDateRange;
    }
    
    get eventsDateRange() {
        return this.#eventsDateRange;
    }
    
    getLabel() {
        throw "not implemented";
    }
    
    filterEvents(events) {
        return events;filter(e => this.#eventsDateRange.intersects(e));
    }
    
    getDays() {
        const days = [];
        let current = this.eventsDateRange.start;
        while (current < this.eventsDateRange.end) {
            days.push( date_format(current, 'yyyy-mm-dd') );
            current = date_add(current, 1, 'day');
        }
        return days;
    }
    
}

module.exports = AbstractView;