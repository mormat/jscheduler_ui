var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'week',
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
            start: '2023-05-02 10:00', 
            end:   '2023-05-02 12:00',
            section_id: 2,
            bgColor: 'fuchsia',
        },
        { 
            some_id: 1235,
            label: 'spanned', 
            start: '2023-05-02 10:00', 
            end:   '2023-05-03 12:00',
            bgColor: 'cyan',
            section_id: 3,
        },

    ],
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
