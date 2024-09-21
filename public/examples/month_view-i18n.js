var element = document.getElementById('scheduler');

var scheduler = jscheduler_ui.render(element, {
    viewMode: 'month',
    dateLocale: 'it',
});

document.getElementById('comments').innerHTML = scheduler.getLabel();
