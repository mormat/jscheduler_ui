const { 
    Before,
    AfterAll,
    setDefaultTimeout,
    setWorldConstructor
} = require('@cucumber/cucumber');

const { 
    PageHelper,
    ElementsHelperWithThrowingError,
    createDriver
} = require('@mormat/test-utils');

const { buildHelpers } = require('../helpers');

setDefaultTimeout( 60 * 1000 );

let driver;

setWorldConstructor(function() {
    
    if (!driver) {
        driver = createDriver( getDriverCapabilities() );
    }
    
    this.driver   = driver;
    this.elements = new ElementsHelperWithThrowingError(driver);
    this.page     = new PageHelper(driver);
    
    const helpers = buildHelpers(this);;
    for (const k in helpers) {
        this[k] = helpers[k];
    }
    
    this.waitForText = async (expectedText, options) => {
        await this.elements.waitFor(`:contains("${expectedText}")`, options);
    }
    
});

function getDriverCapabilities() {
    // --profile firefox 
    // -p firefox
    if (process.argv.includes('firefox')) {
        return {
            'browserName': 'firefox',
        }
    }

    return {
        'browserName': 'chrome',
        'goog:loggingPrefs': { 'browser':'ALL' },
    }
}

Before(async function() {
    
    this.driver.manage().window().setRect({width: 1200, height: 1024});
    
});

AfterAll(async function() {
    
    if (!process.argv.includes('--fail-fast')) {
        driver.close();
    }
    
});
