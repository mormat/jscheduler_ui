const { SchedulerEvent } = require('./models');

class StateHandler
{
    
    #values;
    #onUpdate;
    #reducers;
    
    constructor( values, options = {}) {
        this.#values = { ...values };
        this.#onUpdate = options.onUpdate || (() => {}); 
        this.#reducers = options.reducers || [];
    }
    
    get values() {
        return this.#values;
    }
    
    update( values ) {
        const reducedValues = this.#reducers.reduce(
            (acc, reducer) => ({ ...acc, ...reducer(acc) }),
            values, 
        );
        this.#values = { ...this.#values, ...reducedValues };
        this.#onUpdate(this);
    }
    
}

function reduceEvents( values ) {
    
    if ('events' in values) {
        const events = values['events'].map(e => {
            if (e instanceof SchedulerEvent) {
                return e;
            }
            return new SchedulerEvent(e);
        });

        return { events };
    }
    
    return {}
    
}

function reduceCurrentDate( values ) {
    
    if ('currentDate' in values) {
        
        if (values.currentDate) {
            return {}
        }
        
        const { events } = values;
        if ( events ) {
            const dates = events.map(e => new Date(e.start)).filter(d => !isNaN(d));
            if (dates.length) {
                const min = Math.min( ...dates.map( d => d.getTime() ) );
                return { currentDate: min }
            }
        }
        return { currentDate: Date.now() };
    }
    
    return {}
    
}

module.exports = { 
    StateHandler, 
    reduceEvents, 
    reduceCurrentDate
}
