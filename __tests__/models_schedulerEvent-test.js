
const { 
    SchedulerEvent, 
    withEventDefaultValues,
    isEventDisplayable
} = require('../src/jscheduler_ui/models');

const UUID_REG_EXP = /^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i;

test('withEventDefaultValues() should return missing values', () => {
    
    const event = {};
    
    const actual = withEventDefaultValues( event );
    
    expect(event).not.toBe(actual);
    expect(actual._uuid).toMatch(UUID_REG_EXP);
    expect(actual.start).toBe(null);
    expect(actual.end).toBe(null);
    expect(actual.color).toBe('white');
    expect(actual.bgColor).toBe('#0288d1');
    
});

test('withEventDefaultValues() should compute default ending date', () => {
    
    const actual = withEventDefaultValues( { start: "2020-01-01 10:00"} );
    expect(actual.end).toStrictEqual( 
        new Date("2020-01-01 12:00") 
    );
    
});

test('withEventDefaultValues() should convert dates', () => {
    
    const actual = withEventDefaultValues( { 
        start: "2020-01-01 10:00",
        end:   "2020-01-07 18:00",
    } );
    expect(actual.start).toStrictEqual( 
        new Date("2020-01-01 10:00") 
    );
    expect(actual.end).toStrictEqual( 
        new Date("2020-01-07 18:00") 
    );
    
});

test('withEventDefaultValues() should keep existing values', () => {
    
    const event = {
        _uuid: '42a9ea4a-3ae0-483b-8fdb-617c92e0e1b5',
        color: 'red',
        bgColor: 'yellow',
        start: new Date("2020-01-01 10:00"),
        end: new Date("2020-01-07 18:00"),
    };
    
    const actual = withEventDefaultValues( event );
    expect(actual._uuid).toBe(event._uuid);
    expect(actual.color).toBe(event.color);
    expect(actual.bgColor).toBe(event.bgColor);
    expect(actual.start).not.toBe(event.start);
    expect(actual.start).toStrictEqual(event.start);
    expect(actual.end).not.toBe(event.end);
    expect(actual.end).toStrictEqual(event.end);
    
});


test('isEventDisplayable() with valid values should return true', () => {
   
    const values = {
        label: 'valid event', 
        start: '2020-10-10 10:00', 
        end :  '2020-10-10 12:00'         
    };
    
    expect(isEventDisplayable(values)).toBe(true);
    
});

test.each([
    { },
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
])('isEventDisplayable(%s) should return false', ( values ) => {

    expect(isEventDisplayable(values)).toBe(false);

});