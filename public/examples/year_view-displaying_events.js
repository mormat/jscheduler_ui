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
        { 
            label: 'task 2', 
            start: '2025-03-10 08:00', 
            end: '2025-03-10 19:00', 
            short_label: 't2',
            bgColor: 'coral',
        },
        // { label: 'presentation',    start: '2024-10-05 09:00', end: '2024-10-08 13:00' },
        
        // the invalid values below should be ignored,
        null, {}, { start: 'invalid date' }
    ],
    currentDate: "2025-10-10"
});

