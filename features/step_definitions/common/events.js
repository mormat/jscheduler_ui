const { Given, When, Then } = require('@cucumber/cucumber');
const { Before, After, BeforeStep } = require('@cucumber/cucumber');
const { expect }  = require('expect');
const css2xpath   = require('css2xpath');

const debugRects = {}
const currentStep = {}

When('I click on the {string} event', async function (eventName) {
    
    const element = await this.getElement(
        getEventSelector(eventName) + ' a'
    );
    
    await element.click();

});

Then(
    'the {string} event should be displayed from {string} to {string}', 
    async function (eventName, fromDate, toDate) {
        
        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );
        
        const expectedRect = await getDayRangeRect(this, fromDate, toDate);
        
        debugRects[currentStep.text] = expectedRect;
        
        const actualRect = await eventElement.getRect();
                
        expect(Math.abs(actualRect.x     - expectedRect.x)    ).toBeLessThan(1.1);
        expect(Math.abs(actualRect.width - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.height).toBeLessThanOrEqual(expectedRect.height);
                
    }
);

Then('the {string} event should not be displayed', async function (eventName) {
    
    const elements = await this.findElements(
        getEventSelector(eventName)            
    );
    
    expect(elements.length).toBe(0);
    
});

Then(
    'the {string} event should be displayed at {string} from {string} to {string}', 
    async function (eventName, atDate, fromHour, toHour) {
    
        const eventElement = await this.getElement(
            getEventSelector(eventName)            
        );
       
        const expectedRect  = await getDayRect(this, atDate);
        expectedRect.y      = await getHourTop(this, fromHour);
        expectedRect.height = await getHourTop(this, toHour) - expectedRect.y;
        debugRects[currentStep.text] = expectedRect;
        
        const eventRect = await eventElement.getRect();
        
        expect(Math.abs(eventRect.x      - expectedRect.x)    ).toBeLessThan(2);
        expect(Math.abs(eventRect.width  - expectedRect.width)).toBeLessThan(4);
        expect(Math.abs(eventRect.y      - expectedRect.y)    ).toBeLessThan(2);
        expect(Math.abs(eventRect.height - expectedRect.height)).toBeLessThan(4);
    
    }
);

// for events displayed in year view
Then(
    'the {string} event should be displayed in {string} from {int} to {int}', 
    async function (eventName, inMonth, fromDayInMonth, toDayInMonth) {
        
         const eventElement = await this.getElement(
            getEventSelector(eventName)
        );
        
        const expectedRect = await getDayRangeRectInYearView(
            this, inMonth, fromDayInMonth, toDayInMonth
        );
        debugRects[currentStep.text] = expectedRect;

        const actualRect = await eventElement.getRect();
                
        // actual rect should fit in expected rect
        expect(Math.abs(actualRect.x     - expectedRect.x)    ).toBeLessThan(1.1);
        expect(Math.abs(actualRect.width - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.height).toBeLessThanOrEqual(expectedRect.height);

    }
);


// for events displayed in timeline
Then(
    'the {string} event should be displayed from {string} to {string} in {string} section', 
    async function (eventName, from, to, inSection) {
        
        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );
        
        const expectedRect = await getDayRangeInSection(
            this, inSection, from, to
        );
        debugRects[currentStep.text] = expectedRect;
        
        const actualRect = await eventElement.getRect();

        // actual rect should fit in expected rect
        expect(Math.abs(actualRect.x      - expectedRect.x)    ).toBeLessThan(1.25);
        expect(Math.abs(actualRect.width  - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.y + actualRect.height).toBeLessThanOrEqual(expectedRect.y + expectedRect.height + 1);
        
    }
);

// for events displayed in default timeline
Then(
    'the {string} event should be displayed from {string} to {string} in default section', 
    async function (eventName, from, to, inSection) {
        
        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );
        
        const expectedRect = await getDayRangeInSection(
            this, null, from, to
        );
        debugRects[currentStep.text] = expectedRect;
        
        const actualRect = await eventElement.getRect();
        
        // actual rect should fit in expected rect
        expect(Math.abs(actualRect.x      - expectedRect.x)    ).toBeLessThan(1.25);
        expect(Math.abs(actualRect.width  - expectedRect.width)).toBeLessThan(4);
        expect(Math.abs(actualRect.y      - expectedRect.y)    ).toBeLessThan(1.25);
        expect(Math.abs(actualRect.height - expectedRect.height)).toBeLessThan(4);
        
    }
);

// dragging grouped events
When(
    'I drag the {string} event to {string} in {string} section', 
    async function (eventName, to, inSection) {

        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );
        const eventRect  = await eventElement.getRect();

        const targetRect = await getDayRangeInSection(
            this, inSection, to, to
        );

        const fromPoint = {
            x: eventRect.x + 2,
            y: eventRect.y + 2,
            color: 'blue'
        };
        
        const toPoint = {
            x: targetRect.x + 2,
            y: targetRect.y + 10,
            color: 'red'
        };
        
        debugRects[currentStep.text + ' (fromPoint)'] = fromPoint;
        debugRects[currentStep.text + ' (toPoint)'] = toPoint;

        await this.dragAndDrop(fromPoint, toPoint);

    }
);

When(
    'I drag the {string} event to {string} at {string}', 
    async function (eventName, toDate, atHour) {

        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );

        const eventRect  = await eventElement.getRect();
        const dayRect = await getDayRect(this, toDate);
        
        const yHour = await getHourTop(this, atHour);
        
        const fromPoint = {
            x: eventRect.x + eventRect.width / 2,
            y: yHour + 2,
            color: 'blue'
        };
        const toPoint = {
            x: dayRect.x + dayRect.width / 2,
            y: yHour + 2,
            color: 'red'
        };
        
        debugRects[currentStep.text + ' (fromPoint)'] = fromPoint;
        debugRects[currentStep.text + ' (toPoint)'] = toPoint;
        
        await this.dragAndDrop(fromPoint, toPoint);

    }
);

 When(
    'I drag the {string} event to {string}', 
    async function (eventName, atDate) {
        
        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );

        const eventRect = await eventElement.getRect();        
        
        const targetRect = await getDayRangeRect(this, atDate, atDate);
        
        const fromPoint = {
            x: eventRect.x + 2,
            y: eventRect.y + 2,
            color: 'blue'
        }
        const toPoint = {
            x: targetRect.x + targetRect.width  / 2,
            y: targetRect.y + targetRect.height / 2,
            color: 'red'
        };
        debugRects[currentStep.text + '(fromPoint)'] = fromPoint;
        debugRects[currentStep.text + '(toPoint)']   = toPoint;
        
        await this.dragAndDrop(fromPoint, toPoint);
        
    }
);

When('I resize the {string} event to {string}', async function (eventName, toHour) {
    
    const eventElement = await this.getElement(
        getEventSelector(eventName)
    );
    
    const eventRect = await eventElement.getRect();
    
    const fromPoint = {
        x: eventRect.x + eventRect.width / 2,
        y: eventRect.y + eventRect.height - 8
    }
    debugRects[currentStep.text + '(fromPoint)'] = fromPoint;
    
    const toPoint = {
        x: fromPoint.x,
        y: (await getHourTop(this, toHour)) + 4,
    }
    debugRects[currentStep.text + '(toPoint)'] = toPoint;
    
    await this.dragAndDrop(fromPoint, toPoint);
    
});

When('I edit the {string} event', async function (eventName) {
        
    const parent = await this.getElement( getEventSelector(eventName) );
    const actions = this.driver.actions({async: true});
    await actions.move({origin: parent}).perform();
    
    const button = await this.getElement(
        'a.jscheduler_ui-event-edit',
        parent,
    );
    await button.click();
        
});


When(
    'I drag the {string} event to {int} of {string}', 
    async function (eventName, dayMonth, inMonth) {
        
        const eventElement = await this.getElement(
            getEventSelector(eventName)
        );

        const eventRect = await eventElement.getRect();        
        
        const targetRect = await getDayRangeRectInYearView(
            this, inMonth, dayMonth, dayMonth
        );
        
        const fromPoint = {
            x: eventRect.x + 2,
            y: eventRect.y + 2,
            color: 'blue'
        }
        const toPoint = {
            x: targetRect.x + targetRect.width  / 2,
            y: targetRect.y + targetRect.height / 2,
            color: 'red'
        };
        debugRects[currentStep.text + '(fromPoint)'] = fromPoint;
        debugRects[currentStep.text + '(toPoint)']   = toPoint;
        
        await this.dragAndDrop(fromPoint, toPoint);
        
    }
);


Before(function() {
    for (const key in debugRects) {
        delete debugRects[key];
    }
});

BeforeStep(function({ pickleStep }) {
    currentStep.text = pickleStep.text;
});

// render some specifics rects on the page for debugging
After(function() {
    for (const k in debugRects) {
        
        const {x, y, width = 1, height = 1, color = 'blue'} = debugRects[k];
        
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
        
        this.driver.executeScript(
            `(function() { ${scripts.join(';')} })();`        
        );
    }
})

function getEventSelector(eventName) {
    
    const fn = (s) => `.jscheduler_ui-event:contains("${s}")`;
    
    const match = eventName.match(/ \(\d\)/);
    if (match) {
        const nth = match[0].slice(2, -1);
        const selector = fn(eventName.substring(0, match.index));
        return `(${ css2xpath(selector) })[${nth}]`;
    }
    
    return fn(eventName);
    
}

async function getHourTop(self, atHour) {
    const element = await self.getElement(
        `[data-hour]:contains('${atHour}')`
    );

    const { y } = await element.getRect();
    return y;
}

async function getDayRect(self, atDay) {

    const dayHeaderElement = await self.getElement(
        `.jscheduler_ui-day-header:contains('${atDay}')`
    );

    const bodyElement = await self.getElement(
        `.jscheduler_ui-day_view-body`
    );

    const { x, width }  = await dayHeaderElement.getRect();
    const { y, height } = await bodyElement.getRect();

    return { x, y, width, height }

}

async function getDayRangeRectInYearView(self, inMonth, fromNumDay, toNumDay) {
    
    const rowElement = await self.getElement(
        `.jscheduler_ui tbody tr:has(th:contains('${inMonth}'))`
    );
    
    const fromDayElement = await self.getElement(
        `[data-monthday="${fromNumDay}"]`,
        rowElement
    );
    
    const toDayElement = await self.getElement(
        `[data-monthday="${toNumDay}"]`,
        rowElement
    );
    
    const { y,  height } = await rowElement.getRect();
    const { x } = await fromDayElement.getRect();
    const toDayRect = await toDayElement.getRect();
    const width = (toDayRect.x + toDayRect.width)  - x;
        
    return { x, y, height, width};
    
}

async function getDayRangeInSection(self, inSection, from, to) {
    
    const rowElement = await self.getElement(
        `//th[normalize-space()='${inSection}']`,
        await self.getElement(`.jscheduler_ui tbody`)
    );
    
    const fromElement = await self.getElement(
        `.jscheduler_ui thead th:contains('${from}')`
    );
    
    const toElement = await self.getElement(
        `.jscheduler_ui thead th:contains('${to}')`
    );
    
    const { y,  height } = await rowElement.getRect();
    const { x } = await fromElement.getRect();
    const toRect = await toElement.getRect();
    const width = (toRect.x + toRect.width)  - x;
    
    return { x, y, height, width};
    
}

// @todo rename to getDayRangeRect in daysview ?
async function getDayRangeRect(self, fromDate, toDate) {

    const selectors = {
        'fromDate': `.jscheduler_ui-daterange-header:contains('${fromDate}')`,
        'toDate':   `.jscheduler_ui-daterange-header:contains('${toDate}')`,
        'row':      `.jscheduler_ui-daterange-row`,
    }

    const parent = await self.getElement(
        '.jscheduler_ui-daterange' + 
        Object.values(selectors).map(s => `:has(${s})`).join('')
    );

    const rects = {};
    for (const key in selectors) {
        const node = await self.getElement(selectors[key], parent);
        rects[key] = await node.getRect();
    }

    return {
        x:      rects['fromDate'].x,
        width:  rects['toDate'].x + rects['toDate'].width - rects['fromDate'].x,
        y:      rects['row'].y,
        height: rects['row'].height
    }
}
