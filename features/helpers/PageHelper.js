
class PageHelper {
   
   #world;
    
    constructor(world) {
        this.#world = world;
    }
   
    async clickOn(clickableText) {
        const selectors = [
            `//label[normalize-space()='${clickableText}']`,
            `a:contains("${clickableText}")`,
            `a[title="${clickableText}"]`,
            `button:contains("${clickableText}")`,
        ];

        for (const selector of selectors) {
            const [ element ] = await this.#world.findElements( selector );
            if (element) {
                await element.click();
                return;
            }
        }

        throw `No clickable "${clickableText}" found `; 
    }
    
}

module.exports = PageHelper;

