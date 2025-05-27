
const { createDragAndDropObserver } = require('./listeners/observers');

const { createDroppable } = require('./listeners/droppables');
const { createDraggable } = require('./listeners/draggables');


function SchedulerListener(listeners, schedulerState) {
    
    const { onEventDrop, onEventResize, onEventClick, onEventEdit } = listeners;
    
    this.register = function(element) {
        element.addEventListener('click',     handleClickEvent);
        element.addEventListener('mousedown', handleResizeEvent);
        element.addEventListener('mousedown', handleMoveEvent);
    }
    
    this.unregister = function(element) {
        element.removeEventListener('click',     handleClickEvent);
        element.removeEventListener('mousedown', handleResizeEvent);
        element.removeEventListener('mousedown', handleMoveEvent);
    }
    
    function getSchedulerEvents() {
        const { events } = schedulerState.values;
        return events;
    }
    
    function replaceEvent( values ) {
        const { events } = schedulerState.values;
        schedulerState.update( { 
            events: events.map((e) => e._uuid !== values._uuid ? e : values)
        });
    }
    
    function handleClickEvent(e) {
        
        if (matchSelector(e, '.jscheduler_ui-event-edit')) {
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = getSchedulerEvents().find(function({ _uuid }) {
                return parentElement.dataset['eventUuid'] === _uuid;
            });
            
            if (schedulerEvent) {
                onEventEdit(schedulerEvent);
            }
            
            return;
        }
        
        if (matchSelector(e, '.jscheduler_ui-event a')) {
            
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = getSchedulerEvents().find(function({ _uuid }) {
                return parentElement.dataset['eventUuid'] === _uuid;
            });
            
            if (schedulerEvent) {
                onEventClick(schedulerEvent);
            }
        }
        
    }
    
    function handleResizeEvent(e) {
        
        if (matchSelector(e, '.jscheduler_ui-event .jscheduler_ui-resize-handler')) {
            
            e.preventDefault();
            
            const parentElement = e.target.closest('.jscheduler_ui-event');
            const schedulerEvent = getSchedulerEvents().find(function({ _uuid }) {
                return parentElement.dataset['eventUuid'] === _uuid;
            });
            
            const droppable = createDroppable( { draggableElement: parentElement} );

            const draggable = createDraggable(
                'resize_event', 
                {
                    onChange: function(values, beforeValues) {
                        replaceEvent(values);
                        onEventResize(values, beforeValues);
                    },
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
            const schedulerEvent = getSchedulerEvents().find(function({ _uuid }) {
                return parentElement.dataset['eventUuid'] === _uuid;
            });
            
            const droppable = createDroppable( { draggableElement: parentElement} );

            const draggable = createDraggable(
                parentElement.matches('.jscheduler_ui-event-timeline') ? 
                    'move_event_timeline' : 
                    'move_event_day',
                { 
                    onChange: function(values, beforeValues) {
                        replaceEvent(values);
                        onEventDrop(values, beforeValues);
                    },
                    schedulerEvent 
                }
            );

            const observer = createDragAndDropObserver(
                { droppable, parentElement }
            );

            draggable.startDragAndDrop({ mouseEvent: e, observer, droppable });
            
        }
        
    }
    
    function matchSelector(e, selector) {
        for (const elt of e.composedPath()) {
            if (elt instanceof Element && elt.matches(selector)) {
                return true;
            }
        }
    }
    
}

module.exports = { SchedulerListener }
