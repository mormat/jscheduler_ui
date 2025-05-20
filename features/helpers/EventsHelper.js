const css2xpath   = require('css2xpath');

class EventsHelper {
    
    #world;
    
    constructor(world) {
        this.#world = world;
    }
 
    async getElement(eventName) {
        return await this.#world.getElement(
            this.buildSelector(eventName)
        );
    }
    
    async findElements(eventName) {
        return await this.#world.findElements(
            this.buildSelector(eventName)
        )
    }
    
    async clickTitle(eventName) {
        const element = await this.#world.getElement(
            this.buildSelector(eventName) + ' a'
        );
        await element.click();
    }
    
    async clickEdit(eventName) {
        const parent = await this.getElement( eventName );
        const actions = this.#world.driver.actions({async: true});
        await actions.move({origin: parent}).perform();

        const button = await this.#world.getElement(
            'a.jscheduler_ui-event-edit',
            parent,
        );
        await button.click();
    }
 
    buildSelector(eventName) {
    
        const fn = (s) => `.jscheduler_ui-event:contains("${s}")`;

        const match = eventName.match(/ \(\d\)/);
        if (match) {
            const nth = match[0].slice(2, -1);
            const selector = fn(eventName.substring(0, match.index));
            return `(${ css2xpath(selector) })[${nth}]`;
        }

        return fn(eventName);

    }
    
}

module.exports = EventsHelper;