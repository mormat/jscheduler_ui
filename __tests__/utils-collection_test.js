const { composeMaps } = require('../src/utils/collection');

describe("collection-utils", () => {
    
    test("composeMaps() with 2 maps", () => {
        
        const first = new Map();
        const second = new Map();
        
        first.set('nope', 'nope');
        
        first.set('foo', 'foo_');
        second.set('foo_', '_foo');
        
        first.set('bar', 'bar_');
        second.set('bar_', '_bar');
        
        const actual = composeMaps(first, second);
        
        expect(actual.get('nope')).toBe(undefined);
        expect(actual.get('foo')).toBe('_foo');
        
        expect(true).toBe(true);
        
    })
    
})