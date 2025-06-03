
const _date_formatters = {
    'yyyy': (d) => String(d.getFullYear()),
    'mm':   (d) => ('0' + (d.getMonth() + 1)).slice(-2),
    'dd':   (d) => ('0' + d.getDate()).slice(-2),
    'hh':   (d) => ('0' + d.getHours()).slice(-2),
    'ii':   (d) => ('0' + d.getMinutes()).slice(-2),
    'ss':   (d) => ('0' + d.getSeconds()).slice(-2),
    'uuu':  d  => String(d.getMilliseconds()).padStart(3, '0'),
}

function date_format(date, format) {
    const d = new Date(date);
    let output = format;
    for (const k in _date_formatters) {
        output = output.replaceAll(k, _date_formatters[k](d));
    }
    return output;
}

function date_add(date, num, type) {
    const output = new Date(date);
    if (type === 'day') {
        output.setDate(output.getDate() + num);
    }
    if (type === 'week') {
        output.setDate(output.getDate() + 7 * num + 1);
    }
    if (type === 'month') {
        output.setMonth(output.getMonth() + num);
    }
    if (type === 'year') {
        output.setYear(output.getFullYear() + num);
    }
    if (type === 'hour') {
        output.setTime(output.getTime() + (num * 60 * 60 * 1000));
    }
    return output;
}

function day_add(...vars) {
    return date_format( date_add(...vars), 'yyyy-mm-dd' );
}

function get_first_day_of_week(date)
{
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? -6 : 1) );

    return date_format(d, 'yyyy-mm-dd');
}

function get_last_day_of_week(date)
{
    const d = new Date(date);
    d.setDate(d.getDate() - d.getDay() + (d.getDay() === 0 ? 0 : 7) );

    return date_format(d, 'yyyy-mm-dd');
}

function get_first_day_of_month(date)
{
    const d = new Date(date);
    d.setDate(1);

    return date_format(d, 'yyyy-mm-dd');
}
    
function get_last_day_of_month(date)
{
    const d = new Date(date);
    d.setDate(1);
    d.setMonth( d.getMonth() + 1 );
    d.setDate( d.getDate() - 1);

    return date_format(d, 'yyyy-mm-dd');
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
        const start = date_format(dateMonth, 'yyyy-mm-01 00:00:00.000');
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
    
    fill(type) {
        
        if (type === 'month') {
            const end = new Date(this.end);
            end.setDate(1);
            end.setMonth(end.getMonth() + 1);
            end.setDate(end.getDate() - 1);
            return new DateRange(
                date_format(this.start, 'yyyy-mm-01 00:00:00.000'),
                date_format(end, 'yyyy-mm-dd 23:59:59.999')
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
                date_format(start, 'yyyy-mm-dd hh:ii:00.000'),
                date_format(end,   'yyyy-mm-dd hh:ii:59.999')
            )
        }
        
        if (type === 'day') {
            return new DateRange(
                date_format(this.start, 'yyyy-mm-dd 00:00:00.000'),
                date_format(this.end,   'yyyy-mm-dd 23:59:59.999'),
            )
        }
        
    }
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
                date_format(otherValue, 'yyyy-mm') + 
                '-' + date_format(this.#value, 'dd') +
                ' ' + date_format(this.#value, 'hh:ii:ss.uuu')
            );
        }
        
        if (type === 'day') {
            return new DateStringFormatter(
                date_format(otherValue, 'yyyy-mm-dd') + 
                ' ' + date_format(this.#value, 'hh:ii:ss.uuu')
            );
        }
        
        if (type === 'day_hour') {
            return new DateStringFormatter(
                date_format(otherValue, 'yyyy-mm-dd') + 
                ' ' + date_format(otherValue, 'hh') +
                ':' + date_format(this.#value, 'ii') +
                ':' + date_format(this.#value, 'ss') +
                '.' + date_format(this.#value, 'uuu')
            );
        }
        
    }
    
    toString() {
        return date_format(this.#value, 'yyyy-mm-dd hh:ii:ss.uuu');
    }
}

module.exports = { 
    DateRange,
    getOffsetAndLengthByDateRanges,
    _groupDateRanges,
    _mapGroupedDateRanges,
    getWeekDays,
    DateStringFormatter,
    date_add,
    date_format,
    get_first_day_of_week,
    get_last_day_of_week,
    get_first_day_of_month,
    get_last_day_of_month,
    day_add
}
