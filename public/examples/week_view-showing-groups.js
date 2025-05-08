var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'week',
    showGroups: true,
    groups: [
        {id: 1, text: "Maria D. Penny"},
        {id: 2, text: "Johnathan S. Castillo"},
        {id: 3, text: "Trish W. Dillard"},
        {id: 4, text: "Scott B. Peacock"},
        {id: 5, text: "William M. Smith"},
        {id: 6, text: "Casey K. Johnson"},
        {id: 7, text: "Anna A. Bartlett"}
    ],
    events: [
        { 
            some_id: 1234,
            label: 'some task', 
            start: '2023-05-02 10:00', 
            end:   '2023-05-02 12:00',
            group_id: 2,
            bgColor: '#DE3163',
        },
        { 
            some_id: 1235,
            label: 'this label should not be displayed', 
            labels: {
                showGroups: 'another task'
            },
            start: '2023-05-02 10:00', 
            end:   '2023-05-03 12:00',
            bgColor: '#6495ED',
            group_id: 3,
        },
        {
            some_id: 1236,
            label: 'ungrouped task', 
            start: '2023-05-03 10:00', 
            end:   '2023-05-05 12:00',
            bgColor: '#FF7F50',
            group_id: 'missing-group'
        }
    ],
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
