
const { 
    utils,
    name, 
    version
} = require('../src/jscheduler_ui');

const UUID_REG_EXP = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

test("utils.generate_uuid()", () => {
   
    const uuid = utils.generate_uuid();
   
    expect( uuid ).toMatch(UUID_REG_EXP);
    
    const other_uuid = utils.generate_uuid();

    expect( uuid ).not.toBe( other_uuid );
    
});

test("export package name and package version", () => {
    
    expect(name).toBe("jest_package_name");
    expect(version).toBe("jest_package_version")
    
})