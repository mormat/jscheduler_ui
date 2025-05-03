var element = document.getElementById('scheduler');

jscheduler_ui.render(element, {
    viewMode: 'year',
    events: [
        { 
            label: 'task 1', 
            start: '2025-01-05 08:00', 
            end: '2025-01-07 19:00',
            short_label: 't1'
        },
    ],
    eventsDraggable: true,
    onEventDrop: function(vars) {
        
        document.getElementById('comments').innerHTML = 
            vars.label + ' event dropped' + 
            ' at (' + vars.start.toDateString() + ' ' + 
                      vars.start.toTimeString().substring(0, 5) +
            ','     + vars.end.toDateString()   + ' ' + 
                      vars.end.toTimeString().substring(0, 5) +
            ')';
            
    },
    currentDate: "2025-10-10"
});

