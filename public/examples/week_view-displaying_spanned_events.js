var element = document.getElementById('scheduler');

jscheduler_ui.render(element, {
    viewMode: 'week',
    eventsDraggable: true,
    events: [
        { 
            label: "training course",
            start: "2024-08-13 09:00",
            end  : "2024-08-15 18:00",
            bgColor: 'fuchsia'
        },
        { 
            label: "something elese",
            start: "2024-08-14 09:00",
            end  : "2024-08-16 18:00",
            bgColor: 'MediumSeaGreen'
        },
    ]
});
