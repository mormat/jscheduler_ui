
class AbstractViewHelper {
    
    #driver;
    #elements;
    #debugRects;
    
    constructor({ driver, elements, debugRects }) {
        this.#driver     = driver;
        this.#elements   = elements;
        this.#debugRects = debugRects;
    }
    
    get driver() {
        return this.#driver;
    }
    
    get elements() {
        return this.#elements;
    }
    
    get debugRects() {
        return this.#debugRects;
    }
    
    async dragAndDrop(fromPoint, toPoint) {

        const fn = ({x, y}) => ({
            x: Math.floor(x),
            y: Math.floor(y)
        });
        const actions = this.driver.actions({async: true});
        await actions.move(fn(fromPoint)).press().perform();
        await actions.move(fn(toPoint)).click().perform();

    }
    
}

module.exports = AbstractViewHelper;