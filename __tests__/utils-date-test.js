const {
    DateRange,
    countWeeksInMonth,
    _groupDateRanges, 
    _mapGroupedDateRanges 
} = require('../src/utils/date');

describe("date-utils", () => {
    
    describe("getOffsetAndLengthByDateRanges()", () => {

        const jan_01 = new DateRange(
            new Date("2000-01-01"),
            new Date("2000-01-10")
        );

        const feb_01 = new DateRange(
            new Date("2000-02-01"),
            new Date("2000-02-28")
        );

        const feb_05 = new DateRange(
            new Date("2000-02-05"),
            new Date("2000-02-20")
        );

        const feb_10 = new DateRange(
            new Date("2000-02-10"),
            new Date("2000-03-09"),
        );

        const mar_02 = new DateRange(
            new Date("2000-03-02"),
            new Date("2000-03-05"),
        );
        
        const feb_06 = new DateRange(
            new Date("2000-02-06"),
            new Date("2000-02-20")
        );

        const mar_03 = new DateRange(
            new Date("2000-03-03"),
            new Date("2000-03-05"),
        );
                
        test("_groupDateRanges()1", () => {
            const actual = _groupDateRanges([feb_01]);
            
            expect(actual).toStrictEqual([ [feb_01 ]]);
        });
        
        test("_groupDateRanges()2", () => {
            const actual = _groupDateRanges([feb_01, mar_02]);
            
            expect(actual).toStrictEqual([ [feb_01], [mar_02] ]);
        });
        
        test("_groupDateRanges()3", () => {
            const actual = _groupDateRanges([feb_01, feb_05, mar_02]);
            
            expect(actual).toStrictEqual([ [feb_01, feb_05], [mar_02] ]);
        });
        
        test("_groupDateRanges()4", () => {
            const actual = _groupDateRanges([feb_10, feb_01, feb_05, mar_02]);
            
            expect(actual).toStrictEqual([ 
                [feb_10, feb_01, feb_05], 
                [feb_10, mar_02] 
            ]);
        });
        
        test("_mapGroupedDateRanges()1", () => {
            const actual = _mapGroupedDateRanges([ 
                [feb_01, feb_05], 
                [mar_02] 
            ]);
            
            expect(actual.get(feb_01)).toStrictEqual({ offset: 0, length: 1/2 });
            expect(actual.get(feb_05)).toStrictEqual({ offset: 1/2, length: 1/2 });
            
            expect(actual.get(mar_02)).toStrictEqual({ offset: 0, length: 1 });
        });
        
        test("_mapGroupedDateRanges()2a", () => {
            const actual = _mapGroupedDateRanges([
                [feb_10, feb_01, feb_05], 
                [feb_10, mar_02]         
            ]);
            
            expect(actual.get(feb_10)).toStrictEqual({ offset: 0, length: 1/3 });
            expect(actual.get(feb_01)).toStrictEqual({ offset: 1/3, length: 1/3 });
            expect(actual.get(feb_05)).toStrictEqual({ offset: 2/3, length: 1/3 });
            
            expect(actual.get(mar_02)).toStrictEqual({
                offset: expect.closeTo(1/3),
                length: expect.closeTo(2/3)
            });
            
        });
        
        test("_mapGroupedDateRanges()2b", () => {
            const actual = _mapGroupedDateRanges([
                [feb_10, mar_02],
                [feb_10, feb_01, feb_05]
            ]);
            
            expect(actual.get(feb_10)).toStrictEqual({ offset: 0, length: 1/3 });
            expect(actual.get(feb_01)).toStrictEqual({ offset: 1/3, length: 1/3 });
            expect(actual.get(feb_05)).toStrictEqual({ offset: 2/3, length: 1/3 });
            
            expect(actual.get(mar_02)).toStrictEqual({
                offset: expect.closeTo(1/3),
                length: expect.closeTo(2/3)
            });
        });
        
        test("_mapGroupedDateRanges()3", () => {
            const actual = _mapGroupedDateRanges([
                [feb_10, feb_01, feb_05, feb_06], 
                [feb_10, mar_02, mar_03]         
            ]);
            
            expect(actual.get(feb_10)).toStrictEqual({ offset: 0, length: 1/4 });
            expect(actual.get(feb_01)).toStrictEqual({ offset: 1/4, length: 1/4 });
            expect(actual.get(feb_05)).toStrictEqual({ offset: 2/4, length: 1/4 });
            expect(actual.get(feb_06)).toStrictEqual({ offset: 3/4, length: 1/4 });
            
            expect(actual.get(mar_02)).toStrictEqual({
                offset: expect.closeTo(1/4),
                length: expect.closeTo( 3/8 )
            });
            
            expect(actual.get(mar_03)).toStrictEqual({
                offset: expect.closeTo( 1/4 + 3/8 ),
                length: expect.closeTo( 3/8 )
            });
        });
        
        test("Daterange.createForMonth", () => {
           
            const dateRange = DateRange.createForMonth("2025-02-10");
            
            expect(dateRange.start).toStrictEqual( 
                new Date("2025-02-01 00:00:00.000")
            );
            expect(dateRange.end).toStrictEqual( 
                new Date("2025-02-28 23:59:59.999")
            );
            
        });
        
        test("DateRange.countDays()", () => {
            
            const dateRange = new DateRange(
                "2025-02-01 00:00:00.000",
                "2025-02-28 23:59:59.999"
            )
            
            expect(dateRange.countDays()).toBe(28);
            
        })
        
    });

});
