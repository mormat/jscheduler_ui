const { expect }  = require('expect');

const AbstractViewHelper  = require('./AbstractViewHelper');

class GroupsViewHelper extends AbstractViewHelper {
    
    async expectElementBetweenRangeInGroup(
        actualElement,
        from,
        to,
        inGroup 
    ) {
        const expectedRect = await this.getDayRangeInGroup(
            inGroup, from, to
        );
        this._debugRects.push(expectedRect);
        
        const actualRect = await actualElement.getRect();

        // actual rect should fit in expected rect
        expect(Math.abs(actualRect.x      - expectedRect.x)    ).toBeLessThan(1.25);
        expect(Math.abs(actualRect.width  - expectedRect.width)).toBeLessThan(4);
        expect(actualRect.y).toBeGreaterThanOrEqual(expectedRect.y);
        expect(actualRect.y + actualRect.height).toBeLessThanOrEqual(expectedRect.y + expectedRect.height + 1);
    }
    
    async dragElementToColumnInGroup(draggableElement, to, inGroup) {
        
        const draggableRect  = await draggableElement.getRect();

        const targetRect = await this.getDayRangeInGroup(
            inGroup, to, to
        );

        const fromPoint = {
            x: draggableRect.x + 2,
            y: draggableRect.y + 2,
            color: 'blue'
        };
        
        const toPoint = {
            x: targetRect.x + 2,
            y: targetRect.y + 10,
            color: 'red'
        };
        
        this._debugRects.push(fromPoint, toPoint);
        
        await this._world.dragAndDrop(fromPoint, toPoint);
        
    }
    
    async getDayRangeInGroup(inGroup, from, to) {

        const rowElement = await this._world.getElement(
            `//th[normalize-space()='${inGroup}']`,
            await this._world.getElement(`.jscheduler_ui tbody`)
        );

        const fromElement = await this._world.getElement(
            `.jscheduler_ui thead th:contains('${from}')`
        );

        const toElement = await this._world.getElement(
            `.jscheduler_ui thead th:contains('${to}')`
        );

        const { y,  height } = await rowElement.getRect();
        const { x } = await fromElement.getRect();
        const toRect = await toElement.getRect();
        const width = (toRect.x + toRect.width)  - x;

        return { x, y, height, width};

    }
    
}

module.exports = GroupsViewHelper;