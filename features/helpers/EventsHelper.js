const css2xpath   = require('css2xpath');

class EventsHelper {
    
    #driver;
    #elements;
    
    constructor({ driver, elements }) {
        this.#driver   = driver;
        this.#elements = elements;
    }
 
    async getElement(eventName) {
        return await this.#elements.get(
            this.buildSelector(eventName)
        );
    }
    
    async findElements(eventName) {
        return await this.#elements.select(
            this.buildSelector(eventName)
        )
    }
    
    async clickTitle(eventName) {
        const element = await this.#elements.get(
            this.buildSelector(eventName) + ' a'
        );
        await element.click();
    }
    
    async clickEdit(eventName) {
        const rootElement = await this.getElement( eventName );
        const actions = this.#driver.actions({async: true});
        await actions.move({origin: rootElement}).perform();

        const button = await this.#elements.get(
            'a.jscheduler_ui-event-edit',
            { rootElement },
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