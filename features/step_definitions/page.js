const { 
    Given, 
    When, 
    Then, 
    Before 
} = require('@cucumber/cucumber');
const { expect }  = require('expect');

const urlParams = new URLSearchParams();

When('I open the {string} page', async function (pageName) {

    const url = `http://localhost:8080/${pageName}.html?` + urlParams;
    
    await this.driver.get( url );
    
});

Then('I should see {string}', async function (expectedText) {
    
    const pageText = await this.getPageText();
    
    expect(pageText).toContain(expectedText);
    
});

Then('I should see :', async function (dataTable) {
        
    const pageText = await this.getPageText();

    for (const [expectedText] of dataTable.raw()) {
        expect(pageText).toContain(expectedText);
    }

});

Then('I should not see {string}', async function (expectedText) {
        
    const pageText = await this.getPageText();
    
    expect(pageText).not.toContain(expectedText);
    
});

Then('I should not see :', async function (dataTable) {
    
    const pageText = await this.getPageText();

    for (const [expectedText] of dataTable.raw()) {
        expect(pageText).not.toContain(expectedText);
    }
    
});

Then('I should see a {string} tooltip', async function (string) {
    
    await this.getElement(`[title="${string}"]`);
    
});

Then('I should see {string} in row {int}', async function (string, int) {
    
    await this.getElement(
        `tr:nth-child(${int}):contains('${string}')`
    );
    
});

Then('I should see in {string} only {string}', async function (selector, expectedText) {
    
    const actualText = await this.getPageText(selector);
    
    expect(actualText).toBe(expectedText);
    
})

When('I wait until I see {string}', async function (expectedText) {

    const selector = `:contains("${expectedText}")`;
    
    await this.waitForText(expectedText);
    
});

When('I click on {string}', async function (clickableText) {
    
    await this.page.clickOn(clickableText);
    
});

Then('the page should contains an {string} element', async function ( selector ) {
    
    await this.getElement( selector );
    
});


Given('today is {string}', function (value) {
    
    urlParams.set('today', value);
    
});

Before(function() {
            
    urlParams.forEach( (_, k) => urlParams.delete(k) );
        
});
