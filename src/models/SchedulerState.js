
const { SchedulerEvent } = require('./SchedulerEvent');

class SchedulerState {

    #settings;
    
    constructor( settings ) {
        this.#settings = settings;
    }
    
    get currentDate() {
        if ( this.#settings.currentDate ) {
            return new Date( this.#settings.currentDate );
        }

        const dates = this.events.map(e => new Date(e.start)).filter(d => !isNaN(d));

        if (dates.length) {
            return Math.min( ...dates.map( d => d.getTime() ) );
        }

        return Date.now();
    }
    
    get events() {
        const { events } = this.#settings;
        return events.filter(function(event) {
            if (!event.start || !event.end || !event.label) {
                return false;
            }
            
            return true;
        });
    }
    
}

class BaseSchedulerState
{
    #values;
    #onUpdate;
    
    constructor(values = {}, onUpdate) {
        this.#values = values;
        this.#onUpdate = onUpdate;
    }
    
    get(name) {
        return this.#values[name];
    }
    
    update(values) {
        this.#values = { ...this.#values, ...values }
        if (this.#onUpdate) {
            this.#onUpdate(this);
        }
    }
    
}

class EventsDecorator
{
    
    #state;
    
    constructor(state) {
        this.#state = state;
    }
    
    update(values) {
        if ('events' in values) {
            const events = values['events'].map(e => {
                if (e instanceof SchedulerEvent) {
                    return e;
                }
                return new SchedulerEvent(e);
            });
            this.#state.update({...values, events});
        } else {
            this.#state.update(values);
        }
    }
    
    get(name) {
        if (name === 'events') {
            
            return this.#state.get(name).filter(function(e) {
                
                if (!e.label || !e.start || !e.end) {
                    return false;
                }

                const start = new Date(e.start);
                const end = new Date(e.end);
                if (isNaN( start ) || isNaN( end )) {
                    return false;
                }
                
                if (end.getTime() < start.getTime()) {
                    return false;
                }
                
                return true;
            });
            
        }
        
        return this.#state.get(name);
    }
    
}

class CurrentDateDecorator
{
 
    #state;
    
    constructor(state) {
        this.#state = state;
    }
 
    update(values) {
        this.#state.update(values);
    }
 
    get(name) {
        
        if (name !== 'currentDate') {
            return this.#state.get(name);
        }
        
        const currentDate = this.#state.get('currentDate');
        if (currentDate) {
            return new Date(currentDate);
        }
        
        const events = this.#state.get('events') || [];
        const dates = events.map(e => new Date(e.start)).filter(d => !isNaN(d));
        if (dates.length) {
            const min = Math.min( ...dates.map( d => d.getTime() ) );
            return new Date( min );
        }
        
        return new Date(Date.now());
    }
    
}

module.exports = { 
    SchedulerState, 
    BaseSchedulerState, 
    EventsDecorator,
    CurrentDateDecorator
}
