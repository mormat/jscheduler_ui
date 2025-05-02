const { DayView, WeekView, MonthView }  = require('./views');
const { Day, DateRange } = require('@src/utils/date.js');
const { createViewRenderer } = require('./view_renderers');
const { SchedulerListener } = require('./listeners');
const { SchedulerEvent } = require('./models');
const uuid = require('uuid');

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
    #resizeObserver;
    
    constructor( element, options = {}, listeners = {} ) {
        
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
            eventsEditable:   false,
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
        
        // register resize observer
        if (options.useBreakpoint) {
            this.#resizeObserver = new ResizeObserver(
                resizeObserverHandler
            );
            this.#resizeObserver.observe(this.#element);
        }
        
        this.#element.classList.add('jscheduler_ui');
    }
    
    refresh() {
        
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
        
        if (this.#resizeObserver) {
            this.#resizeObserver.unobserve(this.#element);
        }
        
        this.#element.classList.remove('jscheduler_ui');
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
        
        const valuesWithId = values.id ? values : { 
            ...values, 
            id: uuid.v4() 
        };
        
        const { events } = this.#state.values;
        this.#state.update( { 
            events: [...events, valuesWithId]
        });
        
        return valuesWithId;
    }
        
    replaceEvent(values, filterCallbackFn) {
        const { events } = this.#state.values ;
        
        this.#state.update( { 
            events: events.map(function(e) {
                if ([e.values].find(filterCallbackFn)) {
                    return { ...e.values, ...values }
                }
                return e;
            })
        });
        
    }
    
    removeEvent( filterCallbackFn ) {
        const { events } = this.#state.values;
        this.#state.update( { 
            events: events.filter(function(e) {
                return ![e.values].find(filterCallbackFn);
            })
        });
    }
    
    getEventsDateRange() {
        return this.#currentView.eventsDateRange;
    }
            
    getLabel( ) {
        return this.#currentView.label;
    }
    
}

const resizeObserverHandler = function(entries) {
        
    for (const entry of entries) {
        const { width } = entry.contentRect;
        const element = entry.target;
        
        let breakpoint = 'large';
        if (width <= 768) {
            breakpoint = 'medium';
        }
        if (width <= 576) {
            breakpoint = 'small';
        }
        
        element.setAttribute('data-breakpoint', breakpoint);
    }
}

module.exports = { Scheduler }
