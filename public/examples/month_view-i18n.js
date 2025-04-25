var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'month',
    dateLocale: 'it',
    translations: {
        'edit_event_btn': "Modifica l'evento"
    },
    events: [
        { 
            some_id: 1234,
            label: 'some task', 
            start: '2023-05-02 10:00', 
            end:   '2023-05-02 12:00',
        }
    ],
    eventsEditable: true
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
