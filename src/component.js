const { DaysView }  = require('./views/days');
const { MonthView } = require('./views/month');
const { TimelineView } = require('./views/timeline');
const { Day, DateRange } = require('./utils/date.js');
const { build_html_style } = require('./utils/html');

const { SchedulerEvent } = require('./models/SchedulerEvent');
const { SchedulerState } = require('./models/SchedulerState');

const { createDragAndDropObserver } = require('./drag-and-drop/observers');

const { createDroppable } = require('./drag-and-drop/droppables');
const { createDraggable } = require('./drag-and-drop/draggables');

function Scheduler( element, eventsOrSettings ) {
    
    const defaultSettings = {
        viewMode: 'week',
        minHour:  8,
        maxHour:  19,
        currentDate: null,
        events:   [],
        eventsDraggable: false,
        eventsResizeable: false,
        headersVisible: true,
        onEventDrop: () => {},
        onEventResize: () => {},
        dateLocale:'en',
        styles: {'min-height': '480px', height: '100%'},
    }
    
    const schedulerSettings = {...defaultSettings, ...eventsOrSettings};
         
    const schedulerState = new SchedulerState( schedulerSettings )
    
    const views = {
        'days' :     new DaysView( { schedulerSettings, schedulerState } ),
        'month':     new MonthView( { schedulerSettings, schedulerState } ),
        'timeline' : new TimelineView( { schedulerSettings } )
    }
     
    function refresh() {
        
        schedulerSettings.events = schedulerSettings.events.map(cleanEvent);
        
        const currentDay = new Day(schedulerState.currentDate);
        let  html = '';
        
        if (schedulerSettings.viewMode === 'day') {
            
            html = views['days'];
        }
        
        if (schedulerSettings.viewMode === 'week') {
            
            html = views['days'];
        }
        
        if (schedulerSettings.viewMode === 'month') {
            
            html = views['month'];
        }
        
        const styles = build_html_style({
            ...schedulerSettings.styles,
            'display': 'flex',
            'flex-flow': 'column'
        });
        
        element.innerHTML = `<div class="jscheduler_ui" style="${styles}">${html}</div>`;
        
    }
    
    this.init = function( ) {
        
        refresh();
         
        element.addEventListener('click',     handleClickEvent);
        element.addEventListener('mousedown', handleResizeEvent);
        element.addEventListener('mousedown', handleMoveEvent);
        
    }
    
    this.destroy = function() {
        
        element.removeEventListener('click',     handleClickEvent);
        element.removeEventListener('mousedown', handleResizeEvent);
        element.removeEventListener('mousedown', handleMoveEvent);
        
    }
    
    function handleClickEvent(e) {
        
        if (matchSelector(e, '.jscheduler_ui-event a')) {
            
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = schedulerSettings.events.find(function({ id }) {
                return parentElement.dataset['eventId'] === String(id);
            });
            
            if (schedulerEvent && schedulerSettings.onEventClick) {
                schedulerSettings.onEventClick(schedulerEvent);
            }
        }
        
    }
    
    function handleResizeEvent(e) {
        
        if (matchSelector(e, '.jscheduler_ui-event .jscheduler_ui-resize-handler')) {
            
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = schedulerSettings.events.find(function({ id }) {
                return parentElement.dataset['eventId'] === String(id);
            });
            
            const droppable = createDroppable( { draggableElement: parentElement} );

            const draggable = createDraggable(
                'resize_event', 
                {
                    onChange: schedulerSettings.onEventResize,
                    schedulerEvent 
                }
            );

            const observer = createDragAndDropObserver(
                { droppable, parentElement }
            );

            draggable.startDragAndDrop({ mouseEvent: e, observer, droppable });
        }
        
    }
    
    function handleMoveEvent(e) {
        
        if (matchSelector(e, '.jscheduler_ui-event .jscheduler_ui-draggable')) {
            
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = schedulerSettings.events.find(function({ id }) {
                return parentElement.dataset['eventId'] === String(id);
            });
            
            const droppable = createDroppable( { draggableElement: parentElement} );

            const draggable = createDraggable(
                parentElement.matches('.jscheduler_ui-event-timeline') ? 
                    'move_event_timeline' : 
                    'move_event_day',
                { 
                    onChange: schedulerSettings.onEventDrop,
                    schedulerEvent 
                }
            );

            const observer = createDragAndDropObserver(
                { droppable, parentElement }
            );

            draggable.startDragAndDrop({ mouseEvent: e, observer, droppable });
            
        }
        
    }
        
    this.setOptions = ( options ) => {
        
        for (const [name, value] of Object.entries(options) ) {
            schedulerSettings[name] = value;
        }
        
        refresh();
    }
    
    // @todo add doc and test
    this.getOption = (name) => schedulerSettings[name];
        
    this.next = function() {
        
        let day = new Day(schedulerState.currentDate);
        
        if (schedulerSettings.viewMode === 'day') {
            day = day.addDays(1);
        }
        
        if (schedulerSettings.viewMode === 'week') {
            day = day.addDays(7);
        }
        
        if (schedulerSettings.viewMode === 'month') {
            day = day.addMonths(1);
        }
        
        this.setOptions( { currentDate: day.getDate() })
        
    }
    
    this.previous = function() {
        
        let day = new Day(schedulerState.currentDate);
        
        if (schedulerSettings.viewMode === 'day') {
            day = day.addDays(-1);
        }
        
        if (schedulerSettings.viewMode === 'week') {
            day = day.addDays(-7);
        }
        
        if (schedulerSettings.viewMode === 'month') {
            day = day.addMonths(-1);
            
        }
        
        this.setOptions( { currentDate: day.getDate() })
                
    }
    
    this.today = function() {
        
        this.setOptions( { currentDate: Date.now() })
        
    }
    
    this.createEvent = () => {
        const newEvent = cleanEvent({});
        schedulerSettings.events.push(newEvent);
        return newEvent;
    }
    
    this.getDateRange = function() {
        
        if (schedulerSettings.viewMode === 'month') {
            return views['month'].getDateRange();
        } else {
            return views['days'].getDateRange();
        }
        
    }
    
    this.getEventsDateRange = function() {
        
        if (schedulerSettings.viewMode === 'month') {
            return views['month'].getEventsDateRange();
        } else {
            return views['days'].getEventsDateRange();
        }
        
    }
            
    this.getLabel = ( ) => {
        
        const { viewMode } = schedulerSettings;
        const { start, end } = this.getDateRange();
        
        switch( viewMode ) {
            case 'day': 
                return start.toLocaleString(
                    schedulerSettings.dateLocale, 
                    { 
                        weekday: 'long', 
                        month: 'long', 
                        day:'numeric',
                        year: 'numeric'
                    }
                );
            case 'week':
                return start.toLocaleString(
                    schedulerSettings.dateLocale, 
                    { 
                        month: 'short', 
                        day:'numeric',
                        year: 'numeric'
                    }
                ) + ' - ' + 
                end.toLocaleString(
                    schedulerSettings.dateLocale, 
                    { 
                        month: 'short', 
                        day:'numeric',
                        year: 'numeric'
                    }
                );
            case 'month':
                return start.toLocaleString(
                    schedulerSettings.dateLocale, 
                    { month: 'long',  year:'numeric' }
                );
        }
        
    }
    
    function cleanEvent(raw) {
        
        if (raw instanceof SchedulerEvent) {
            return raw;
        }
        
        const onUpdate = () => {
            const { events } = schedulerSettings;
            schedulerSettings.events = events.filter(o => !o.deleted);
            refresh();
        }
        
        return new SchedulerEvent(raw, { onUpdate });
        
    }
    
}

function matchSelector(e, selector) {
    
    for (const elt of e.composedPath()) {
        if (elt instanceof Element && elt.matches(selector)) {
            return true;
        }
    }
    
}

module.exports = { Scheduler }
