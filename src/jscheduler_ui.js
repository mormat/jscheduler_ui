/* 
 * Click nbfs://nbhost/SystemFileSystem/Templates/Licenses/license-default.txt to change this license
 * Click nbfs://nbhost/SystemFileSystem/Templates/Other/javascript.js to edit this template
 */

const { Scheduler } = require('./jscheduler_ui/scheduler');
const { format_date, Day } = require('./utils/date');
const uuid = require('uuid');

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

function generate_uuid() {
    return uuid.v4();
}

const utils = { format_date, Day, generate_uuid }

module.exports = { 
    render, 
    utils,
    name:      __PACKAGE_NAME__,
    version:   __PACKAGE_VERSION__,
}
