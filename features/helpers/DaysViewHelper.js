const { expect }  = require('expect');

const AbstractViewHelper  = require('./AbstractViewHelper');

class DaysViewHelper extends AbstractViewHelper {

    get selector() {
        return '.jscheduler_ui-daysview';
    }
    
    async countColumns() {
        const elements = await this._world.findElements(
            this.selector + ' .jscheduler_ui-daysview-columns td'
        )
        return elements.length;
    }

    // expect an element to be displayed in a specific day column and hour range
    async expectElementAtDayFromHourToHour(
        actualElement,
        atDate, 
        fromHour, 
        toHour
    ) {
        
        const expectedRect  = await this.getDayRect(atDate);
        expectedRect.y      = await this.getHourTop(fromHour);
        expectedRect.height = await this.getHourTop(toHour) - expectedRect.y;
        this._debugRects.push(expectedRect);
        
        const actualRect = await actualElement.getRect();
        
        expect(Math.abs(actualRect.x      - expectedRect.x)    ).toBeLessThan(2);
        expect(Math.abs(actualRect.width  - expectedRect.width)).toBeLessThan(4);
        expect(Math.abs(actualRect.y      - expectedRect.y)    ).toBeLessThan(2);
        expect(Math.abs(actualRect.height - expectedRect.height)).toBeLessThan(4);
        
    }

    // expect an element to be displayed in a specific day range
    async expectElementFromDayToDay(actualElement, fromDate, toDate) {
        
        const expectedRect = await this.getDayRangeRect(fromDate, toDate);
        this._debugRects.push(expectedRect);
        
        const actualRect = await actualElement.getRect();
                
        expect(Math.abs(actualRect.x     - expectedRect.x)    ).toBeLessThan(1.1);
        expect(Math.abs(actualRect.width - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.height).toBeLessThanOrEqual(expectedRect.height);
        
    }

    async dragElementToDateAtHour(draggableElement, toDate, atHour) {
        
        const draggableRect  = await draggableElement.getRect();
        const dayRect = await this.getDayRect(toDate);
        
        const yHour = await this.getHourTop(atHour);
        
        const fromPoint = {
            x: draggableRect.x + draggableRect.width - 20,
            y: yHour + 2,
            color: 'blue'
        };
        const toPoint = {
            x: dayRect.x + dayRect.width - 20,
            y: yHour + 2,
            color: 'red'
        };
        
        this._debugRects.push(fromPoint, toPoint);
        
        await this._world.dragAndDrop(fromPoint, toPoint);
    }

    async dragElementAtDate(draggableElement, atDate) {
        
        const draggableRect = await draggableElement.getRect();        
        
        const targetRect = await this.getDayRangeRect(atDate, atDate);
        
        const fromPoint = {
            x: draggableRect.x + 2,
            y: draggableRect.y + 2,
            color: 'blue'
        }
        const toPoint = {
            x: targetRect.x + targetRect.width  / 2,
            y: targetRect.y + targetRect.height / 2,
            color: 'red'
        };
        this._debugRects.push(fromPoint, toPoint);
        
        await this._world.dragAndDrop(fromPoint, toPoint);
    }
    
    async resizeElementUntilHour(resizableElement, toHour) {
        
        const resizableRect = await resizableElement.getRect();

        const fromPoint = {
            x: resizableRect.x + resizableRect.width / 2,
            y: resizableRect.y + resizableRect.height - 8
        }
        
        const toPoint = {
            x: fromPoint.x,
            y: (await this.getHourTop(toHour)) + 4,
        }
        
        this._debugRects.push(fromPoint, toPoint);

        await this._world.dragAndDrop(fromPoint, toPoint);
    }

    async getDayRect(atDay) {

        const dayHeaderElement = await this._world.getElement(
            this.selector + ` thead th:contains('${atDay}')`
        );

        const bodyElement = await this._world.getElement(
            this.selector + ` .jscheduler_ui-daysview-columns`
        );

        const { x, width }  = await dayHeaderElement.getRect();
        const { y, height } = await bodyElement.getRect();

        return { x, y, width, height }

    }
    
    async getHourTop(atHour) {
        
        const element = await this._world.getElement(
            this.selector + ` [data-hour]:contains('${atHour}')`
        );

        const { y } = await element.getRect();
        return y;
        
    }
    
    async getDayRangeRect(fromDate, toDate) {

        const selectors = {
            'fromDate': this.selector + ` thead th:contains('${fromDate}')`,
            'toDate':   this.selector + ` thead th:contains('${toDate}')`,
            'row':      this.selector + ` .jscheduler_ui-daterange-row`,
        }

        const rects = {};
        for (const key in selectors) {
            const node = await this._world.getElement(selectors[key]);
            rects[key] = await node.getRect();
        }

        return {
            x:      rects['fromDate'].x,
            width:  rects['toDate'].x + rects['toDate'].width - rects['fromDate'].x,
            y:      rects['row'].y,
            height: rects['row'].height
        }
    }

}

module.exports = DaysViewHelper;