

class DebugRectsHelper {
    
    #driver;
    #items;
    
    constructor({ driver }) {
        this.#driver = driver;
        this.#items = [];
    }
    
    push(...items) {
        this.#items.push(...items);
    }
    
    display() {
        
        for (const k in this.#items) {

            const {
                x, y, 
                width = 1, 
                height = 1, 
                color = 'blue'
            } = this.#items[k];

            const styles = [
                'position: absolute',
                `border: 3px dashed ${ color }`,
                `left:   ${x}px`,
                `top:    ${y}px`,
                `width:  ${width}px`,
                `height: ${height}px`,
            ];

            const title = k.replaceAll(/"/g, '\\"');

            const scripts = [
                `var elt = document.createElement('div')`,
                `elt.style.cssText = "${ styles.join(';') }"`,
                `elt.setAttribute("title", "${ title }")`,
                `document.body.appendChild(elt)`

            ];

            this.#driver.executeScript(
                `(function() { ${scripts.join(';')} })();`        
            );
        }
        
    }
    
}

module.exports = DebugRectsHelper;