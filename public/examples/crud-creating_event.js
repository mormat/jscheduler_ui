// This example show how can an event can be created from a form
var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'week',
    currentDate: '2024-09-17'
});

scheduler.pushEvent({ 
    label: 'meeting', 
    start: '2024-09-17 10:00'
});
