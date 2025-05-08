var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'year',
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
            start: '2024-02-04 10:00', 
            end:   '2024-02-04 12:00',
            group_id: 2
        },
        { 
            some_id: 1234,
            label: 'long task', 
            start: '2024-04-02 10:00', 
            end:   '2024-08-04 12:00',
            bgColor: 'fuchsia',
            group_id: 3
        }
    ],
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
