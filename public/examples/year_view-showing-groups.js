var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'year',
    showGroups: true,
    groups: [
        {id: 1, text: "Maria Penny"},
        {id: 2, text: "John Castillo"},
        {id: 3, text: "Kate Dillard"},
        {id: 4, text: "Scott Peacock"},
        {id: 5, text: "William Smith"},
        {id: 6, text: "Casey Johnson"},
        {id: 7, text: "Anna Bartlett"}
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
