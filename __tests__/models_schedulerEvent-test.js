
const { 
    SchedulerEvent, 
} = require('../src/jscheduler_ui/models');

test('SchedulerEvent with valid values', () => {
   
    const schedulerEvent = new SchedulerEvent({
        label: 'valid event', 
        start: '2020-10-10 10:00', 
        end :  '2020-10-10 12:00'         
    });
    
    expect(schedulerEvent.isValid()).toBe(true);
    
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
    /*
    { 
        label: 'missing end date', 
        start: '2020-10-10 12:00' 
    },*/
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
])('SchedulerEvent with invalid values %s', ( values ) => {

    const schedulerEvent = new SchedulerEvent(values);
    
    expect(schedulerEvent.isValid()).toBe(false);

});