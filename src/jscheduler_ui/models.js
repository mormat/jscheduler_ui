
const { date_add_hour, format_date } = require('../utils/date.js');
const uuid = require('uuid');

class SchedulerEvent {
    
    #values = {};
    
    constructor( values) {
        this.#values  = values || {};
        if (!this.#values.id) {
            this.#values.id = uuid.v4();
        }
        this.init();
    }
    
    init() {
        const start = new Date(this.#values.start);
        const end   = new Date(this.#values.end ? this.#values.end : date_add_hour(start, 2));
        
        const defaults = { bgColor: '#0288d1', color: 'white' };
        this.#values = { ...defaults, ...this.#values, start, end }        
    }
    
    get values() {
        return this.#values;
    }
    
    get id() {
        return this.#values.id;
    }
    
    get start() {
        return this.#values['start'];
    }
    
    get end() {
        return this.#values['end'];
    }
    
    get label() {
        return this.#values['label'];
    }
    
    get color() {
        return this.#values['color'];
    }
    
    get bgColor() {
        return this.#values['bgColor'];
    }
    
    get length() {
        return this.end.getTime() - this.start.getTime();
    }
    
    get header() {
        return [this.start, this.end].map(v => format_date('hh:ii', v)).join(' - ');
    }
    
    // clone the current instance with a new Date Range
    cloneWith( newValues ) {
        return new SchedulerEvent( { ...this.values, ...newValues } );
    }
    
    isValid() {
        if (!this.label || !this.start || !this.end) {
            return false;
        }

        const start = new Date(this.start);
        const end = new Date(this.end);
        if (isNaN( start ) || isNaN( end )) {
            return false;
        }

        if (end.getTime() < start.getTime()) {
            return false;
        }
        
        return true;
    }
    
}

module.exports = { SchedulerEvent }
