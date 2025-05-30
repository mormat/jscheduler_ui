const { 
    When, 
    Then,
    After
} = require('@cucumber/cucumber');
const { expect }  = require('expect');

Then('the scheduler should be in day view', async function () {

    await this.elements.get( this.daysview.selector );

    const columns = await this.daysview.countColumns();
    
    expect(columns).toBe(1);
    
});

Then('the scheduler should be in week view', async function () {

    await this.elements.get( this.daysview.selector );

    const columns = await this.daysview.countColumns();
    
    expect(columns).toBe(7);

});

Then('the scheduler should be in month view', async function () {
    
    await this.elements.get( this.monthview.selector );
    
});

When('I click on the {string} event', async function (eventName) {
    
    await this.events.clickTitle(eventName);
    
});

When('I edit the {string} event', async function (eventName) {
        
    await this.events.clickEdit(eventName);
        
});

When(
    'I drag the {string} event to {string} at {string}', 
    async function (eventName, toDate, atHour) {

        const eventElement = await this.events.getElement(eventName);
        
        await this.daysview.dragElementToDateAtHour(
            eventElement,
            toDate,
            atHour
        );

    }
);

 When(
    'I drag the {string} event to {string}', 
    async function (eventName, atDate) {
        
        const eventElement = await this.events.getElement(eventName);

        await this.daysview.dragElementAtDate(eventElement, atDate)

    }
);
        
When(
    'I drag the {string} event to day {int}', 
    async function (eventName, atDayNum) {
        
        const eventElement = await this.events.getElement(eventName);

        await this.monthview.dragElementToDay(eventElement, atDayNum);
        
    }
);

When('I resize the {string} event to {string}', async function (eventName, toHour) {
    
    const eventElement = await this.events.getElement(eventName);
   
    await this.daysview.resizeElementUntilHour(eventElement, toHour);
    
});

Then(
    'the {string} event should be displayed at {string} from {string} to {string}', 
    async function (eventName, atDate, fromHour, toHour) {
    
        const eventElement = await this.events.getElement(eventName);
    
        await this.daysview.expectElementAtDayFromHourToHour(
            eventElement,
            atDate, 
            fromHour, 
            toHour
        );
    
    }
);

Then(
    'the {string} event should be displayed from {string} to {string}', 
    async function (eventName, fromDate, toDate) {

        const eventElement = await this.events.getElement(eventName);

        await this.daysview.expectElementFromDayToDay( 
            eventElement, 
            fromDate, 
            toDate 
        );
                
    }
);

Then(
    'the {string} event should be displayed from day {int} to day {int}', 
    async function (eventName, fromDayNum, toDayNum) {
        
        const eventElement = await this.events.getElement(eventName);

        await this.monthview.expectElementFromDayToDay( 
            eventElement, 
            fromDayNum, 
            toDayNum
        );
        
    }
);

// for events displayed in year view
// the {string] event should be displayed between day {int} and day {int} in the month of {string}
Then(
    'the {string} event should be displayed between day {int} and day {int} in the month of {string}', 
    async function (eventName, fromDayInMonth, toDayInMonth, inMonth) {
        
        const eventElement = await this.events.getElement( eventName );
        
        await this.yearview.expectElementBetweenDayNumsInMonth(
            eventElement,
            fromDayInMonth,
            toDayInMonth,
            inMonth
        )

    }
);

// dragging events in year view
When(
    'I drag the {string} event to day {int} in the month of {string}', 
    async function (eventName, dayMonth, inMonth) {
        
        const eventElement = await this.events.getElement( eventName );

        await this.yearview.dragElementToDayNumInMonth(
            eventElement,
            dayMonth,
            inMonth
        )
        
    }
);

Then('the {string} event should not be displayed', async function (eventName) {
    
    const elements = await this.events.findElements(eventName);
    
    expect(elements.length).toBe(0);
    
});

// for events displayed in groups
Then(
    'the {string} event should be displayed from {string} to {string} in {string} group', 
    async function (eventName, from, to,inGroup) {
        
        const eventElement = await this.events.getElement(eventName);
        
        await this.groupsview.expectElementBetweenRangeInGroup(
            eventElement,
            from,
            to,
           inGroup
        );        
        
    }
);

// dragging grouped events
When(
    'I drag the {string} event to {string} in {string} group', 
    async function (eventName, to,inGroup) {

        const eventElement = await this.events.getElement(eventName);
        
        await this.groupsview.dragElementToColumnInGroup(
            eventElement,
            to,
           inGroup
        )
        
    }
);

// render some specifics rects on the page for debugging
After(function() {
    
    this.debugRects.display();
    
})
