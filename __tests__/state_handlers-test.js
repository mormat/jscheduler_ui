
const { 
    StateHandler, 
    reduceEvents, 
    reduceCurrentDate
} = require('../src/jscheduler_ui/state_handlers');

const { SchedulerEvent } = require('../src/jscheduler_ui/models');

jest.mock('../src/jscheduler_ui/models', () => ({
    SchedulerEvent: function(values) {
        for (const k in values) {
            this[k] = values[k];
        }
    }
}));

describe("StateHandler", () => {
    
    test("StateHandler init", () => {
        
        const initialValues = {
            foo: 'bar',
            baz: 'some_value',
        }
        
        const stateHandler = new StateHandler(initialValues);
        
        expect(stateHandler.values).toStrictEqual(initialValues);
        expect(stateHandler.values).not.toBe(initialValues);
        
        stateHandler.update({ baz: 'another_value', baz2: 'new_value' });
        expect(stateHandler.values).toStrictEqual({
            foo: 'bar',
            baz: 'another_value',
            baz2: 'new_value',
        });
        
    });
    
    test("StateHandler onUpdate", () => {
        
        const onUpdate = jest.fn();
        
        const stateHandler = new StateHandler({}, { onUpdate });
        
        expect(onUpdate).not.toHaveBeenCalled();
      
        stateHandler.update({foo: 'baz'});

        expect(onUpdate).toHaveBeenCalledWith(stateHandler);
        
    });
    
    test("StateHandler reducers", () => {
        
        const reducers = [
            ({foo}) => ({ foo: foo + '_a' }),
            ({foo}) => ({ foo: foo + '_b' }),
        ];
        
        const stateHandler = new StateHandler({}, { reducers });
        
        stateHandler.update({foo: 'baz'});

        expect(stateHandler.values).toStrictEqual({
            foo: 'baz_a_b'
        });
        
    });
    
    test('events reducer should convert each `events` at update', () => {

        expect( reduceEvents( {} )).toEqual( {} );

        const values = {
            events: [
                { label: 'foo', start: '2020-10-10 10:00' },
                new SchedulerEvent({ foo: 'bar'})
            ],
            some_prop: 'some_value'
        };
        
        const actual = reduceEvents( values );
        expect( actual ).toEqual( { events: values.events } );
        expect( actual.events[0] ).toBeInstanceOf(SchedulerEvent);
        expect( actual.events[1] ).toBe( values.events[1] );

    });
    
    test(`currentDate reducer should return default value if not defined`, () => {
        
        Date.now = () => 1729668132234;
        
        expect( reduceEvents( {} )).toEqual( {} );
        
        expect( 
            reduceCurrentDate( { currentDate: null } ) 
        ).toEqual({
            currentDate: Date.now(),
        });
        
        const events = [
            {'start': 1000},
            {'start': new Date(1001) },
            {'start': 'invalid date' }
        ];
        
        expect( 
            reduceCurrentDate( { events, currentDate: null } ) 
        ).toEqual({
            currentDate: 1000
        });
        
        expect( 
            reduceCurrentDate( { events, currentDate: 200 } )
        ).toEqual( {} );
        
    });
        
})
