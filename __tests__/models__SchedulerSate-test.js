const { 
    BaseSchedulerState,
    EventsDecorator,
    CurrentDateDecorator
} = require('../src/models/SchedulerState');

const { SchedulerEvent } = require('../src/models/SchedulerEvent');

jest.mock('../src/models/SchedulerEvent', () => ({
    SchedulerEvent: function(values) {
        for (const k in values) {
            this[k] = values[k];
        }
    }
}));

describe("SchedulerState", () => {

    test('SchedulerState.get() should return default values', () => {
        
        const state = new BaseSchedulerState( { foo: 'bar' });
        
        expect(state.get('foo')).toBe('bar');
        
    });
    
    test('SchedulerState.get() should return updated values', () => {
        
        const state = new BaseSchedulerState( { foo: 'bar' });
        
        state.update({foo: 'baz'});
        
        expect(state.get('foo')).toBe('baz');
        
    });

    test('SchedulerState.update() should trigger onUpdate', () => {

        const onUpdate = jest.fn();

        const state = new BaseSchedulerState( { foo: 'bar'}, onUpdate );

        expect(onUpdate).not.toHaveBeenCalled();

        state.update({foo: 'baz'});

        expect(onUpdate).toHaveBeenCalledWith(state);
        
    });
    
    test.each([
        ['CurrentDateDecorator', CurrentDateDecorator],
        ['EventsDecorator',      EventsDecorator],
    ])("%s should handle 'update()' and 'get()'", (_, DecoratorClass) => {
        
        const state = {
            update: jest.fn(),
            get: v => 'mocked ' + v
        }
        
        const decorator = new DecoratorClass(state);
        decorator.update({ foo: 'bar'});
        expect(state.update).toHaveBeenCalledWith({ foo: 'bar'});
        
        expect(decorator.get('baz')).toBe('mocked baz');
        
    });
    
    test('EventsDecorator.update() should convert each `events` to SchedulerEvent if needed', () => {

        const events = [
            { label: 'foo', start: '2020-10-10 10:00' },
            new SchedulerEvent({ foo: 'bar'})
        ]

        const state = { update: jest.fn() }
        const decorator = new EventsDecorator(state);
        decorator.update({ events });
        expect(state.update).toHaveBeenCalled();
        
        const cleanedEvents = state.update.mock.calls[0][0].events;
        expect(cleanedEvents[0]).toBeInstanceOf(SchedulerEvent);
        expect(cleanedEvents[0]).toEqual( events[0] );
        expect(cleanedEvents[1]).toBe( events[1] );
                
    });
    
    test('CurrentDateDecorator.get() should return default date', function() {
        const state = {
            get: n => null
        }
        
        Date.now = () => 1729668132234;
        
        const decorator = new CurrentDateDecorator(state);
        expect(decorator.get('currentDate').getTime()).toEqual(
            Date.now()
        );
    });
    
    test('CurrentDateDecorator.get() should return default date', function() {
        const state = {
            get: function(n) {
                if (n === 'events') {
                    return [
                        {'start': 1000},
                        {'start': new Date(1001) },
                        {'start': 'invalid date' }
                    ];
                }
            }
        }
        
        const decorator = new CurrentDateDecorator(state);
        expect(decorator.get('currentDate').getTime()).toEqual(1000);
    });
    
    test('CurrentDateDecorator.get() should return default date', function() {
        
        const state = {
            get: function(n) {
                if (n === 'events') {
                    return [ {'start': 1000} ];
                }
                if (n === 'currentDate') {
                    return 2000
                }
            }
        }
        
        const decorator = new CurrentDateDecorator(state);
        expect(decorator.get('currentDate').getTime()).toEqual(2000);
        
    });
    
    test('EventsDecorator.get() should return only valid events', function() {
        
        const events = [
            { }, // empty event
            { 
                label: 'valid event', 
                start: '2020-10-10 10:00', 
                end :  '2020-10-10 12:00' 
            },
            { 
                // missing label
                start: '2020-10-10 10:00', 
                end :  '2020-10-10 12:00' 
            },
            { 
                label: 'missing start date', 
                end :  '2020-10-10 12:00' 
            },
            { 
                label: 'missing end date', 
                start: '2020-10-10 12:00' 
            },
            { 
                label: 'invalid start date', 
                start: new Date('invalid'), 
                end:   '2020-10-10 12:00' 
            },
            { 
                label: 'invalid end date', 
                start: '2020-10-10 12:00',
                end:   new Date('invalid') 
            },
            { 
                label: 'invalid date range', 
                start: '2020-10-10 18:00', 
                end:   '2020-10-10 12:00' 
            }
        ];
        
        const state = { 
            get: (n) => n === 'events' ? events: 'some value'
        };
        const decorator = new EventsDecorator(state);
        
        expect(decorator.get('whatever')).toBe('some value');
        expect(decorator.get('events')).toEqual([
           { 
                label: 'valid event', 
                start: '2020-10-10 10:00', 
                end :  '2020-10-10 12:00' 
            }
        ]);
        
    });

});
