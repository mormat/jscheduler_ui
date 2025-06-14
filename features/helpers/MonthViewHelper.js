const { expect }  = require('expect');

const AbstractViewHelper  = require('./AbstractViewHelper');

class MonthViewHelper extends AbstractViewHelper {

    get selector() {
        return '.jscheduler_ui-month_view';
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

    async dragElementToDay(draggableElement, atDayNum) {
        const draggableRect = await draggableElement.getRect();        

        const targetRect = await this.getDayRangeRect(atDayNum, atDayNum);

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
    
    async getDayRangeRect(fromDate, toDate) {

        const selectors = {
            'fromDate': `.jscheduler_ui-daterange-header:contains('${fromDate}')`,
            'toDate':   `.jscheduler_ui-daterange-header:contains('${toDate}')`,
            'row':      `.jscheduler_ui-daterange-row`,
        }

        const parent = await this._world.getElement(
            '.jscheduler_ui-daterange' + 
            Object.values(selectors).map(s => `:has(${s})`).join('')
        );

        const rects = {};
        for (const key in selectors) {
            const node = await this._world.getElement(selectors[key], parent);
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

module.exports = MonthViewHelper;