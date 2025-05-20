const { expect }  = require('expect');

const AbstractViewHelper  = require('./AbstractViewHelper');

class YearViewHelper extends AbstractViewHelper {

    async expectElementBetweenDayNumsInMonth(
        actualElement,
        fromDayInMonth,
        toDayInMonth,
        inMonth
    ) {
        const expectedRect = await this.getDayRangeRectInYearView(
            inMonth, fromDayInMonth, toDayInMonth
        );
        this._debugRects.push(expectedRect);

        const actualRect = await actualElement.getRect();
                
        // actual rect should fit in expected rect
        expect(Math.abs(actualRect.x     - expectedRect.x)    ).toBeLessThan(1.1);
        expect(Math.abs(actualRect.width - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.height).toBeLessThanOrEqual(expectedRect.height);
    }
    
    async dragElementToDayNumInMonth(
        draggableElement,
        dayMonth,
        inMonth
    ) {
        const draggableRect = await draggableElement.getRect();        
        
        const targetRect = await this.getDayRangeRectInYearView(
            inMonth, dayMonth, dayMonth
        );
        
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

    async getDayRangeRectInYearView(inMonth, fromNumDay, toNumDay) {

        const rowElement = await this._world.getElement(
            `.jscheduler_ui tbody tr:has(th:contains('${inMonth}'))`
        );

        const fromDayElement = await this._world.getElement(
            `[data-monthday="${fromNumDay}"]`,
            rowElement
        );

        const toDayElement = await this._world.getElement(
            `[data-monthday="${toNumDay}"]`,
            rowElement
        );

        const { y,  height } = await rowElement.getRect();
        const { x } = await fromDayElement.getRect();
        const toDayRect = await toDayElement.getRect();
        const width = (toDayRect.x + toDayRect.width)  - x;

        return { x, y, height, width};

    }

}

module.exports = YearViewHelper;