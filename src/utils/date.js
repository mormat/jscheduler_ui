
const formatters = {
    'yyyy': (d) => String(d.getFullYear()),
    'mm':   (d) => ('0' + (d.getMonth() + 1)).slice(-2),
    'dd':   (d) => ('0' + d.getDate()).slice(-2),
    'uuu':  d  => String(d.getMilliseconds()).padStart(3, '0'),
    'yyyy-mm': (d) => formatters['yyyy'](d) + '-' + formatters['mm'](d),
    'yyyy-mm-dd': (d) => formatters['yyyy-mm'](d) + '-' + formatters['dd'](d),
    'hh':   (d) => ('0' + d.getHours()).slice(-2),
    'ii':   (d) => ('0' + d.getMinutes()).slice(-2),
    'ss':   (d) => ('0' + d.getSeconds()).slice(-2),
    'hh:ii': (d) => formatters['hh'](d) + ':' + formatters['ii'](d),
    'hh:ii:ss': (d) => formatters['hh'](d) + ':' + formatters['ii'](d) + ':' + formatters['ss'](d),
    'hh:ii:ss.uuu': (d) => formatters['hh'](d) + ':' + formatters['ii'](d) + ':' + formatters['ss'](d) + '.' + formatters['uuu'](d),
    'yyyy-mm-dd hh:ii': (d) => formatters['yyyy-mm-dd'](d) + ' ' + formatters['hh:ii'](d),
    'yyyy-mm-dd hh:ii:ss': (d) => formatters['yyyy-mm-dd'](d) + ' ' + formatters['hh:ii:ss'](d),
    'yyyy-mm-dd hh:ii:ss.uuu': (d) => formatters['yyyy-mm-dd'](d) + ' ' + formatters['hh:ii:ss.uuu'](d)
}

function date_add_hour(date, numHours) {
    
    const output = new Date(date);
    output.setTime(output.getTime() + (numHours * 60 * 60 * 1000));
    
    return output;
    
}

function format_date(format, value) {
    
    const date = new Date(value);
    
    return formatters[format](date);
    
}

class Day {
    
    constructor(date) {
        this.date = new Date(date);
    }
    
    get vars() {
        return {
            year:       this.date.getFullYear(),
            monthIndex: this.date.getMonth(),
            day:        this.date.getDate()
        }
    }
        
    getFirstDayOfWeek()
    {
        const d = new Date(this.date);
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) );
        
        return new Day(d);
    }
    
    getLastDayOfWeek()
    {
        const d = new Date(this.date);
        d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? 0 : 7) );

        return new Day(d);
    }
    
    getFirstDayOfMonth()
    {
        const d = new Date(this.date);
        d.setDate(1);
        
        return new Day(d);
    }
    
    getLastDayOfMonth()
    {
        const d = new Date(this.date);
        d.setDate(1);
        d.setMonth( d.getMonth() + 1 );
        d.setDate( d.getDate() - 1);
        
        return new Day(d);
    }
    
    addDays(numDays) {
        const output = new Date(this.date);

        output.setDate(this.date.getDate() + numDays);
        
        return new Day(output);
    }
    
    addMonths(numMonths) {
        
        const output = new Date(this.date);
        
        output.setMonth(this.date.getMonth() + numMonths);
        
        return new Day(output);
        
    }
    
    addYears(numYears) {
        
        const output = new Date(this.date);
        
        output.setYear(output.getFullYear() + numYears);
        
        return new Day(output);
        
    }
    
    getDate() {
        return this.date;
    }
    
    get numday() {
        return this.date.getDate();
    }
    
    get month() {
        return this.date.getMonth();
    }
    
    toString()
    {
        return formatters['yyyy-mm-dd'](this.date);
    }
    
}

class DateRange {
    
    constructor(start, end) {
        this.start = new Date(start);
        this.end   = new Date(end);
    }

    static fromObject({ start, end }) {
        return new DateRange(start, end);
    }

    static createForMonth(dateMonth) {
        const start = format_date('yyyy-mm', dateMonth) + '-01 00:00:00.000';
        const end   = new Date( start );
        end.setMonth( end.getMonth() + 1);
        end.setTime( end.getTime() - 1);
        return new DateRange(start, end);
    }
    
    get length() {
        return this.end.getTime() - this.start.getTime();
    }
    
    contains(anotherDateRange) {
        const start = new Date(anotherDateRange.start);
        const end   = new Date(anotherDateRange.end);
        
        return this.start <= start && end <= this.end;
    }
        
    intersects(anotherDateRange) {
        const start = new Date(anotherDateRange.start);
        const end   = new Date(anotherDateRange.end);

        if (end < this.start || this.end < start) {
            return null;
        }

        return new DateRange(
            Math.max(this.start.getTime(), start.getTime()),
            Math.min(this.end.getTime(),   end.getTime()),
        );
        
    }
        
    calcPercentPosition(date) {
        const value  = new Date(date);
        const length = this.end.getTime() - this.start.getTime();
        
        return (value.getTime() - this.start.getTime()) * 100 / length;
    }
    
    countDays() {
        return Math.round(
            this.length / (24 * 60 * 60 * 1000)
        );
    }
    
    // @todo refactor MonthView using this function
    // @todo missing unit test
    getWeeks() {
        const startingDay = new Day(this.start);
        const endingDay   = new Day(this.end);
        
        const weeks = [];
        let currentDay = startingDay.getFirstDayOfWeek();
        let lastDay    = endingDay.getLastDayOfWeek();
        while (currentDay <= lastDay) {
            const days = [ currentDay ];
            for (let n = 1; n < 7; n++) {
                days.push( days[0].addDays(n) );
            }
            weeks.push(days);
            currentDay = currentDay.addDays(7);
        }
        return weeks;
    }
    
    fill(type) {
        
        if (type === 'month') {
            const end = new Date(this.end);
            end.setDate(1);
            end.setMonth(end.getMonth() + 1);
            end.setDate(end.getDate() - 1);
            return new DateRange(
                format_date('yyyy-mm', this.start)   + '-01 00:00:00.000',
                format_date('yyyy-mm-dd', end) + ' 23:59:59.999'
            )
        }
        
        
        if (type === 'day_hour') {
            const start = new Date(this.start);
            const end   = new Date(this.end);
            start.setMinutes(0);
            if (end.getMinutes() == 0) {
                end.setHours( end.getHours() - 1);
            }
            end.setMinutes(59);
            return new DateRange(
                format_date('yyyy-mm-dd hh:ii', start)   + ':00.000',
                format_date('yyyy-mm-dd hh:ii', end)     + ':59.999'
            )
        }
        
        if (type === 'day') {
            return new DateRange(
                new Day(this.start) + ' 00:00:00.000',
                new Day(this.end)   + ' 23:59:59.999'
            )
        }
        
    }
}

// @todo missing unittest
function groupDateRangedItemsByPosition(dateRangeditems) {

    const results = [];

    loop_items: for (const item of dateRangeditems) {

        const constraint = new DateRange(item.start, item.end - 1);

        for (const position in results) {

            const overlapping = results[position].find(
                (v) => {
                    const other = new DateRange(v.start, v.end - 1);
                    return constraint.intersects(other);
                }
            );

            if (!overlapping) {
                results[position].push(item);
                continue loop_items;
            }

        }

        results.push([item]);

    }

    return results;

}

function _groupDateRanges(dateRanges) {
    
    const groups = [];
    const ignoredDateRanges = new Set();
    
    for (const dateRange of dateRanges) {
        
        if (ignoredDateRanges.has(dateRange)) {
            continue;
        }
        
        const overlappingDateRanges = dateRanges.filter(
            i => i !== dateRange && dateRange.intersects(i)
        );

        if (overlappingDateRanges.length) {
            const otherGroups = _groupDateRanges(overlappingDateRanges);
            
            for (const items of otherGroups) {
                groups.push([dateRange, ...items]);
            }
            
            for (const overlappingDateRange of overlappingDateRanges) {
                ignoredDateRanges.add(overlappingDateRange);
            }
            
            continue;
        }
        
        groups.push([dateRange]);
    }
    
    return groups;
    
}

function _mapGroupedDateRanges(groupedDateRanges) {
    const results = new Map();
    
    const sortedGroups = groupedDateRanges.sort(
        (a, b) => b.length - a.length
    );
    
    for (const items of sortedGroups) {
        let length = 1 / items.length;
        let offset = 0;
        for (const n in items) {
            
            if (results.has(items[n])) {
                const result = results.get(items[n]);
                offset = result.offset + result.length;
                length = (1 - offset) / (items.length - n - 1);
                continue;
            }
            
            results.set(items[n], { offset, length });
            offset += length;
        }
    }
    
    return results;
}

function getOffsetAndLengthByDateRanges(dateRanges) {
    return _mapGroupedDateRanges(_groupDateRanges(dateRanges));
}

function getWeekDays({ dateLocale = 'en'} = {}) {
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date("1970-01-01");
        d.setDate(i + 5);
        weekDays.push(d.toLocaleString(
           dateLocale,
           { weekday: 'short' }
        ));
    }
    return weekDays;
}

/**
 * DateStringFormatter ?
 */
class DateStringFormatter {
   
    #value;
    
    constructor(value) {
        this.#value = value;
    }
    
    with(type, otherValue) {
    
        if (type === 'month') {
            return new DateStringFormatter(
                format_date('yyyy-mm', otherValue) + 
                '-' + format_date('dd', this.#value) +
                ' ' + format_date('hh:ii:ss.uuu', this.#value)
            );
        }
        
        if (type === 'day') {
            return new DateStringFormatter(
                format_date('yyyy-mm-dd', otherValue) + 
                ' ' + format_date('hh:ii:ss.uuu', this.#value)
            );
        }
        
        if (type === 'day_hour') {
            return new DateStringFormatter(
                format_date('yyyy-mm-dd', otherValue) + 
                ' ' + format_date('hh', otherValue) +
                ':' + format_date('ii', this.#value) +
                ':' + format_date('ss', this.#value) +
                '.' + format_date('uuu', this.#value)
            );
        }
        
    }
    
    toString() {
        return format_date('yyyy-mm-dd hh:ii:ss.uuu', this.#value);
    }
}

module.exports = { 
    format_date,
    DateRange,
    Day,
    date_add_hour,
    groupDateRangedItemsByPosition,
    getOffsetAndLengthByDateRanges,
    _groupDateRanges,
    _mapGroupedDateRanges,
    getWeekDays,
    DateStringFormatter
}
