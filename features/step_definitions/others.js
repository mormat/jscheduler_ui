const { 
    When,
    Then
} = require('@cucumber/cucumber');

const { expect }  = require('expect');

const path = require('path');
const { writeFileSync } = require('fs');
const TEMP_FOLDER = path.join(__dirname, '../../public/temp')

When('I render a scheduler with the options below:', async function (schedulerOptions) {
    
    const html = `<!DOCTYPE html>
        <html>
          <body>
            <div id="scheduler"></div>
            <script src="../jscheduler_ui.js"></script>
            <script>
              jscheduler_ui.render(
                document.getElementById('scheduler'), 
                ${schedulerOptions}
              );
            </script>
          </body>
        </html>
    `;
    
    writeFileSync( path.join(TEMP_FOLDER, 'scheduler.html'), html);
    
    await this.driver.get( 'http://localhost:8080/temp/scheduler.html');
    
    const logs = await this.driver.manage().logs().get("browser");
    for (const log of logs) {
        const { level, message } = log;
        if (level.name_ === 'SEVERE') {
            throw message;
        }
    }
    
    
});

When(
    'I select the {string} example in {string}', 
    async function (exampleName, sectionName) {
        const element = await this.elements.get([
            `.list-group-item:contains( "${sectionName}" )`,
            `.list-group-item:contains( "${exampleName}" )`
        ].join(' ~ '));

        const actions = this.driver.actions({async: true});
        await actions.move({origin: element}).perform();
        await element.click();
    }            
);

Then(
    '{string} should be loaded from {string} to {string}', 
    async function (url, startDate, endDate) {

        const start = (new Date(startDate)).getTime();
        const end   = (new Date(endDate)).getTime();
    
        const expectedText = `loading '${url}?start=${start}&end=${end}'`;

        const pageText = await this.page.getText();

        expect(pageText).toContain(expectedText);

    }
);

Then(
    'the height of {string} element should be between {int} and {int}', 
    async function (selector, minHeight, maxHeight) {
        const element = await this.elements.get(selector);
        const rect = await element.getRect();
        expect(rect.height).toBeGreaterThanOrEqual(minHeight);
        expect(rect.height).toBeLessThanOrEqual(maxHeight);
    }
)

