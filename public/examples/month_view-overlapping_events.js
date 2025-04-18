var element = document.getElementById('scheduler');

jscheduler_ui.render(element, {
    viewMode: 'month',
    events: [
        { 
            label: 'a task with a very long text that should not be truncated', 
            start: '2024-10-01 08:00', 
            end: '2024-10-01 19:00' ,
            bgColor: 'primary'
        },
        { label: 'task 1',    start: '2024-10-05 09:00', end: '2024-10-05 18:00', bgColor: 'success' },
        { label: 'task 2',    start: '2024-10-05 14:00', end: '2024-10-05 18:00', bgColor: 'warning' },
        
        // the invalid values below should be ignored,
        null, {}, { start: 'invalid date' }
    ]
});
