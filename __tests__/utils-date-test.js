const { DateRange, getOffsetAndLengthByDateRanges } = require('../src/utils/date');


describe("date-utils", () => {
    
    test("something", () => {
      
        const item1 = new DateRange(
            new Date("2000-01-01"),
            new Date("2000-01-10")
        );
        
        const item2 = new DateRange(
            new Date("2000-02-01"),
            new Date("2000-02-28")
        );
        
        const item3 = new DateRange(
            new Date("2000-02-05"),
            new Date("2000-02-20")
        );
        
        let actual = getOffsetAndLengthByDateRanges([item1, item2, item3]);
        
        expect(actual.get(item1)).toStrictEqual({ offset: 0,   length: 1   });
        
        expect(actual.get(item2)).toStrictEqual({ offset: 0,   length: 0.5 });
        
        expect(actual.get(item3)).toStrictEqual({ offset: 0.5, length: 0.5 });
        
        const item4 = new DateRange(
            new Date("2000-02-10"),
            new Date("2000-02-09"),
        );
        
        actual = getOffsetAndLengthByDateRanges([item1, item2, item3, item4]);
        
        expect(actual.get(item2)).toStrictEqual({ offset: 0,   length: 1/3 });
        
        expect(actual.get(item3)).toStrictEqual({ offset: 1/3, length: 1/3 });
        
        expect(actual.get(item4)).toStrictEqual({ offset: 2/3, length: 1/3 });
         
    })
    
})
