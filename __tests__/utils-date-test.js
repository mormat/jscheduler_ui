const {
    DateRange,
    _groupDateRanges, 
    _mapGroupedDateRanges,
    DateStringFormatter,
    date_add,
    date_format,
    get_first_day_of_week,
    get_last_day_of_week,
    get_first_day_of_month,
    get_last_day_of_month
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
            
        });
        
        test.each([
            ['day',      "2024-02-15 00:00:00.000", "2025-03-18 23:59:59.999"],
            ['day_hour', "2024-02-15 10:00:00.000", "2025-03-18 22:59:59.999"],
            ['month',    "2024-02-01 00:00:00.000", "2025-03-31 23:59:59.999"]
            
        ])(
            "DateRange.fill(%s) should return {start: %s, end: %d}",
            function(filLType, expectedStart, expectedEnd) {
                const dateRange = new DateRange(
                    "2024-02-15 10:32:00.000",
                    "2025-03-18 22:12:15.666"
                )

                const actual = dateRange.fill(filLType);
                expect(actual).toBeInstanceOf(DateRange);
                expect(actual.start).toStrictEqual( new Date(expectedStart) );
                expect(actual.end).toStrictEqual( new Date(expectedEnd) );
            }
        )

        test("DateRange.fill('month') should limit 28 february", () => {
            const dateRange = new DateRange(
                "2025-02-15 10:32:00.000",
                "2025-02-16 22:12:15.666"
            );
    
            const actual = dateRange.fill('month');
            expect(actual.end).toStrictEqual( 
                new Date( "2025-02-28 23:59:59.999" ) 
            );
        })
        
        test("DateRange.fill('day_hour') specific case", () => {
            const dateRange = new DateRange(
                "2025-02-15 10:00:00.000",
                "2025-02-15 12:00:00.000"
            );
    
            const actual = dateRange.fill('day_hour');
            expect(actual.end).toStrictEqual( 
                new Date( "2025-02-15 11:59:59.999" ) 
            );
    
        })
        
    });
    
    describe.each([
        ['1970-01-01 00:00:00.000', 'day',      '2024-12-02 10:00',    '2024-12-02 00:00:00.000'],
        ['1970-01-01 00:00:00.000', 'month',    '2024-12-02 10:00',    '2024-12-01 00:00:00.000'],
        ['1970-01-01 00:00:00.000', 'day_hour', '2024-12-02 10:12',    '2024-12-02 10:00:00.000'],
    ])(
        'new DateStringFormatter(%s).with(%s, %s) should return %s', 
        function(dateValue, withType, withValue, expectedString) {
        
            test("using string formatted dates", () => {
                const instance = new DateStringFormatter(dateValue);
                const actual = instance.with(withType, withValue);
            
                expect(actual).toBeInstanceOf(DateStringFormatter);
                expect(String(actual)).toBe(expectedString);
            });
        
            test("using new Date() as input", () => {
                const instance = new DateStringFormatter( new Date(dateValue) );
                const actual = instance.with(withType, new Date(withValue) );
            
                expect(actual).toBeInstanceOf(DateStringFormatter);
                expect(String(actual)).toBe(expectedString);
            });
            
        }
    );
    
    test.each([
        ["2024-12-02 12:15:10.159", 'uuu', '159'],
        ["2024-12-02 12:15:10.009", 'uuu', '009'],
        ["2024-12-02 12:15:10.009", 'hh:ii:ss.uuu', '12:15:10.009'],
        ["2024-12-02 12:15:10.009", 'yyyy-mm-dd hh:ii:ss.uuu', '2024-12-02 12:15:10.009'],
        ['2024-12-02', 'yyyy-mm-dd + extra', '2024-12-02 + extra']
    ])('date_format(%s, %s) should return %s', (input, format, expected) => {
        
        const actual = date_format(input, format);
        
        expect(actual).toBe(expected);
        
    })
    
    test.each([
        ['2024-01-02', 1, 'day',   2024, 1, 3],
        ['2024-01-02', 2, 'day',   2024, 1, 4],
        ['2024-01-02', 1, 'week',  2024, 1, 10],
        ['2024-01-02', 2, 'week',  2024, 1, 17],
        ['2024-01-02', 5, 'week',  2024, 2, 7],
        ['2024-01-02', 1, 'month', 2024, 2, 2],
        ['2024-01-02', 1, 'year',  2025, 1, 2],
        ['2024-03-01', -1, 'day', 2024, 2, 29],
    ])("date_add(%s, %s; %s) should return %s-%s-%s", (
        input, n, type, expectedYear, expectedMonth, expectedDay
    ) => {
        
        const actual = date_add(input, n, type);
        
        expect(actual.getFullYear()).toBe(expectedYear);
        expect(actual.getMonth() + 1).toBe(expectedMonth);
        expect(actual.getDate()).toBe(expectedDay);
    });
    
    test.each([
        ['10:00', 1, 'hour', 11, 0],
        ['10:00', 2, 'hour', 12, 0],
    ])("date_add(2024-01-02-%s, %s; %s) should return 2024-01-02-%s-%s", (
        input, n, type, expectedHours, expectedMinutes
    ) => {
        
        const actual = date_add('2024-01-02 ' + input, n, type);
        
        expect(actual.getFullYear()).toBe(2024);
        expect(actual.getMonth() + 1).toBe(1);
        expect(actual.getDate()).toBe(2);
        expect(actual.getHours()).toBe(expectedHours);
        expect(actual.getMinutes()).toBe(expectedMinutes);
    });
    
    test.each([
        ['2025-05-01', '2025-04-28'],
        ['2025-04-28', '2025-04-28'],
        ['2025-05-04', '2025-04-28'],
    ])('get_first_day_of_week(%s) should return %s', (input, expected) => {
        
        const actual = get_first_day_of_week(input);
        
        expect(actual).toBe(expected);
        
    });
    
    test.each([
        ['2025-05-01', '2025-05-04'],
        ['2025-04-28', '2025-05-04'],
        ['2025-05-04', '2025-05-04'],
    ])('get_last_day_of_week(%s) should return %s', (input, expected) => {
        
        const actual = get_last_day_of_week(input);
        
        expect(actual).toBe(expected);
        
    });
    
    test.each([
        ['2024-06-02', '2024-06-01'],
        ['2024-06-01', '2024-06-01'],
        ['2024-06-30', '2024-06-01'],
    ])('get_first_day_of_month(%s) should return %s', (input, expected) => {
        
        const actual = get_first_day_of_month(input);
        
        expect(actual).toBe(expected);
        
    });
    
    test.each([
        ['2024-06-02', '2024-06-30'],
        ['2024-06-01', '2024-06-30'],
        ['2024-06-30', '2024-06-30'],
    ])('get_last_day_of_month(%s) should return %s', (input, expected) => {
        
        const actual = get_last_day_of_month(input);
        
        expect(actual).toBe(expected);
        
    });
    
});
