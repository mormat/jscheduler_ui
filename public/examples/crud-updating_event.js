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
        },
        {
            some_id: 1236,
            label: 'spanned task', 
            start: '2024-09-17 10:00', 
            end:   '2024-09-19 12:00',
        }
    ],
    eventsEditable: true,
    onEventEdit: function(values) {
        
        document.getElementById('comments').innerHTML = 
            'label='  + values.label + ',' +
            'start='  + values.start.getTime() + ',' +
            'end='    + values.end.getTime() + ',' +
            'some_id' + values.some_id;
    
        // When validating the form, update the event like this
        scheduler.replaceEvent(
            { 
                label: 'some updated task', 
                start: '2024-09-17 14:00',
                end:   '2024-09-17 16:00',
            }, 
            function(e) {
                return e.some_id === values.some_id
            }
        );

    }
});
