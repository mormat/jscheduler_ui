const AbstractView = require('./AbstractView');

class AbstractDaysView extends AbstractView {
    
    #minHour;
    #maxHour; 
    
    constructor( { 
        minHour, 
        maxHour, 
        ...otherParams
    }) {
        super({ ...otherParams });
        this.#minHour = minHour;
        this.#maxHour = maxHour;
    }
    
    get minHour() {
        return Math.max(0, this.#minHour);
    }
    
    get maxHour() {
        return this.#maxHour;
    }
    
    get hours() {
        const min = Math.max(0, this.#minHour);
        const max = Math.min(23, this.#maxHour);
        if (max < min) return [];
        return [...Array(max - min + 1)].map( (_, n) => n + min);
    }
    
    
    
}

module.exports = AbstractDaysView;
