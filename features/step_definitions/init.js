const { 
    Before,
    AfterAll,
    setDefaultTimeout,
    setWorldConstructor
} = require('@cucumber/cucumber');

const { Builder } = require('selenium-webdriver');
const chrome  = require("selenium-webdriver/chrome");

const { SeleniumWorld } = require('@mormat/test-utils');

const helpers = require('../helpers');

setDefaultTimeout( 60 * 1000 );

setWorldConstructor(class extends SeleniumWorld {
    
    constructor() {
        super({});
        
        return this.withDynamicGetters(
            helpers.buildInstances(this)
        );
    }
    
    // @todo move to common lib
    withDynamicGetters(getters) {
        return new Proxy(this, {
            get: function(self, field) {
                if (field in self) return self[field]; // normal case
                return getters[field];
            }
        });
    }
    
    createDriver() {
        const builder = new Builder().withCapabilities(
            this.getBrowserCapabilities()
        );

        const options = new chrome.Options();
        options.addArguments("--lang=en");
        builder.setChromeOptions(options);

        return builder.build();
    }
    
    getBrowserCapabilities() {
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
    
});


Before(async function() {
    
    this.driver.manage().window().setRect({width: 1200, height: 1024});
    
});

AfterAll(async function() {
    
    if (!process.argv.includes('--fail-fast')) {
        SeleniumWorld.driver.close();
    }
    
});
