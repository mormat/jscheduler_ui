const { 
    DayView, 
    WeekView, 
    MonthView,
    YearView
}  = require('./views');
const { 
    date_add
} = require('@src/utils/date.js');
const { createViewRenderer } = require('./renderers');
const { SchedulerListener } = require('./listeners');
const uuid = require('uuid');
const { isEventDisplayable } = require('./models');

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
        viewParams.events = viewParams.events.filter(isEventDisplayable);
        
        if (viewParams.viewMode === 'day') {
            this.#currentView = new DayView( viewParams );
        }
        
        if (viewParams.viewMode === 'week') {
            this.#currentView = new WeekView( viewParams );
        }
        
        if (viewParams.viewMode === 'month') {
            this.#currentView = new MonthView( viewParams );
        }
        
        if (viewParams.viewMode === 'year') {
            this.#currentView = new YearView( viewParams );
        }
        
        const renderer = createViewRenderer( this.#currentView, viewParams);
        
        this.#element.innerHTML = renderer.render( 
            this.#currentView,
            viewParams
        );

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
        
        const nextDate = date_add(currentDate, 1, viewMode);
        
        this.#state.update( { currentDate: nextDate })
    }
    
    previous() {
        const { currentDate, viewMode } = this.#state.values;
        
        const previousDate = date_add(currentDate, -1, viewMode);
        
        this.#state.update( { currentDate: previousDate })
    }
    
    today() {
        
        this.#state.update( { currentDate: Date.now() })
        
    }
    
    pushEvent(values) {
        
        const valuesWithId = values._uuid ? values : { 
            ...values, 
            _uuid: uuid.v4() 
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
                if ([e].find(filterCallbackFn)) {
                    return { ...e, ...values }
                }
                return e;
            })
        });
        
    }
    
    removeEvent( filterCallbackFn ) {
        const { events } = this.#state.values;
        this.#state.update( { 
            events: events.filter(function(e) {
                return ![e].find(filterCallbackFn);
            })
        });
    }
    
    getEventsDateRange() {
        return this.#currentView.eventsDateRange;
    }
            
    getLabel( ) {
        const { dateLocale } = this.#state.values;
        return this.#currentView.getLabel({ dateLocale });
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
