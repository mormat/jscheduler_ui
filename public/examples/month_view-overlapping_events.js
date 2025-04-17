var element = document.getElementById('scheduler');

jscheduler_ui.render(element, {
    viewMode: 'month',
    eventsDraggable: true,
    events: [
        { 
            label: 'a task with a very long text', 
            start: '2024-10-01 08:00', 
            end: '2024-10-01 19:00' ,
            bgColor: 'primary'
        },
        { label: 'task 1',    start: '2024-10-05 09:00', end: '2024-10-05 13:00', bgColor: 'success' },
        { label: 'task 2',    start: '2024-10-05 14:00', end: '2024-10-05 18:00', bgColor: 'warning' },
        
        { label: 'item 1', start: '2024-10-08 10:00', end: '2024-10-08 12:00' },
        { label: 'item 3', start: '2024-10-07 10:00', end: '2024-10-13 12:00', bgColor: 'green' },
        { label: 'item 2', start: '2024-10-08 10:00', end: '2024-10-09 12:00', bgColor: 'orange' },
        
        { label: 'item 4', start: '2024-10-11 10:00', end: '2024-10-11 12:00', bgColor: 'cyan' },
        { label: 'item 5', start: '2024-10-13 10:00', end: '2024-10-13 12:00', bgColor: 'yellow' },
        { label: 'item 5', start: '2024-10-13 14:00', end: '2024-10-13 15:30', bgColor: 'salmon' },
        { label: 'item 6', start: '2024-10-13 16:00', end: '2024-10-13 18:30', bgColor: 'aquamarine' },
        
        // the invalid values below should be ignored,
        null, {}, { start: 'invalid date' }
    ]
});
