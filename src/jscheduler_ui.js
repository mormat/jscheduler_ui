/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

const { Scheduler } = require('./jscheduler_ui/scheduler');
const { format_date, Day } = require('./utils/date');

function render(element, eventsOrSettings)
{
    
    const settings = Array.isArray(eventsOrSettings) ? 
        { events: eventsOrSettings } : 
        eventsOrSettings;

    const props     = {};
    const listeners = {};
    for (const [k,v] of Object.entries(settings)) {
        if (k.startsWith('on')) {
            listeners[k] = v;
        } else {
            props[k] = v;
        }
    }
    
    
    const scheduler = new Scheduler(element, props, listeners);
        
    return scheduler;
    
}

const utils = { format_date, Day }

module.exports = { 
    render, 
    utils,
    name:      __PACKAGE_NAME__,
    version:   __PACKAGE_VERSION__,
}
