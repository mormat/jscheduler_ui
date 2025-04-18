const { DayView, WeekView, MonthView }  = require('./views');
const { Day, DateRange } = require('@src/utils/date.js');
const { createViewRenderer } = require('./view_renderers');
const { SchedulerListener } = require('./listeners');
const { SchedulerEvent } = require('./models');

const { 
    StateHandler, 
    reduceEvents, 
    reduceCurrentDate 
} = require('./state_handlers');

class Scheduler {
    
    #element;
    #state;
    #listeners;
    #currentView = {};
    
    constructor( element, options, listeners ) {
        
        this.#element = element;
        
        this.#state = new StateHandler({}, {
            onUpdate: () => this.refresh(),
            reducers: [reduceEvents, reduceCurrentDate],
        });
        
        this.#state.update({
            viewMode: 'week',
            minHour:  8,
            maxHour:  19,
            currentDate: null,
            events:   [],
            eventsDraggable:  false,
            eventsResizeable: false,
            eventsClickable:  false,
            headersVisible: true,
            dateLocale:'en',
            styles: {'min-height': '480px', height: '100%'},
            ...options
        });

        this.#listeners = new SchedulerListener({
            onEventDrop:   () => {},
            onEventResize: () => {},
            onEventClick:  () => {},
            ...listeners
        }, this.#state);

        this.#listeners.register(element);

    }
    
    refresh() {
        
        /*
        const options = {
            styles: .styles,
            eventsClickable:  .eventsClickable, 
            eventsResizeable: .eventsResizeable, 
            eventsDraggable:  .eventsDraggable,
            minHour: .minHour,
            maxHour: .maxHour,
            dateLocale: .dateLocale,
            currentDate: .currentDate,
            events: .events
        };*/
        
        const viewParams = this.#state.values;
        viewParams.events = viewParams.events.filter(e => e.isValid());
        
        if (viewParams.viewMode === 'day') {
            this.#currentView = new DayView( viewParams );
        }
        
        if (viewParams.viewMode === 'week') {
            this.#currentView = new WeekView( viewParams );
        }
        
        if (viewParams.viewMode === 'month') {
            this.#currentView = new MonthView( viewParams );
        }
        
        const renderer = createViewRenderer( this.#currentView, viewParams);
        this.#element.innerHTML = renderer.render( this.#currentView );
        
    }
    
    destroy() {
        this.#listeners.unregister(this.#element);
    }
    
    setOptions( options) {
        this.#state.update(options);
    }
    
    // @todo add doc and test
    getOption( name ) {
        return this.#state.values[name];
    }
    
    next() {
        const { currentDate, viewMode } = this.#state.values;
        
        let day = new Day( currentDate );
        
        if (viewMode === 'day') {
            day = day.addDays(1);
        }
        
        if (viewMode === 'week') {
            day = day.addDays(7);
        }
        
        if (viewMode === 'month') {
            day = day.addMonths(1);
        }
        
        this.#state.update( { currentDate: day.getDate() })
    }
    
    previous() {
        const { currentDate, viewMode } = this.#state.values;
        
        let day = new Day( currentDate );
        
        if (viewMode === 'day') {
            day = day.addDays(-1);
        }
        
        if (viewMode === 'week') {
            day = day.addDays(-7);
        }
        
        if (viewMode === 'month') {
            day = day.addMonths(-1);
        }
        
        this.#state.update( { currentDate: day.getDate() })
    }
    
    today() {
        
        this.#state.update( { currentDate: Date.now() })
        
    }
    
    pushEvent(values) {
        const { events } = this.#state.values;
        this.#state.update( { 
            events: [...events, values]
        });
    }
        
    replaceEvent(values) {
        const { events } = this.#state.values;
        this.#state.update( { 
            events: events.map((e) => e.id !== values.id ? e : values)
        });
    }
    
    removeEvent( { id } ) {
        const { events } = this.#state.values;
        this.#state.update( { 
            events: events.filter(v => v.id != id)
        });
    }
    
    getEventsDateRange() {
        return this.#currentView.eventsDateRange;
    }
            
    getLabel( ) {
        return this.#currentView.label;
    }
    
}

module.exports = { Scheduler }
