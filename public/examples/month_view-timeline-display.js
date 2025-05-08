var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'month',
    showTimeline: true,
    sections: [
        {id: 1, text: "Section 1"},
        {id: 2, text: "Section 2"},
        {id: 3, text: "Section 3"},
        {id: 4, text: "Section 4"}
    ],
    events: [
        { 
            some_id: 1234,
            label: 'some task', 
            start: '2024-02-04 10:00', 
            end:   '2024-02-08 12:00',
            section_id: 2
        }
    ],
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
