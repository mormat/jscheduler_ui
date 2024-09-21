var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'week',
    dateLocale: 'it',
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
