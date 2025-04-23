// This example show how can an event can be updated from a form when clicking on it
var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'week',
    events: [
        { 
            some_id: 1234,
            label: 'some task', 
            start: '2024-09-17 10:00', 
            end:   '2024-09-17 12:00',
        },
        {
            some_id: 1235,
            label: 'another task', 
            start: '2024-09-19 10:00', 
            end:   '2024-09-19 12:00',
        }
    ],
    eventsClickable: true,
    onEventClick: function(clickedEvent) {
        scheduler.removeEvent(function(e) {
            return e.some_id === 1234
        });
    }
});
