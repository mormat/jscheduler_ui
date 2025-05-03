
const { 
    Day, 
    DateRange,
    format_date,
    getWeekDays
} = require('@src/utils/date');

class YearView {
    
    #currentDate;
    #dateLocale;
    #events;
    
    constructor({ currentDate, dateLocale, events }) {
        this.#currentDate = currentDate;
        this.#dateLocale  = dateLocale;
        this.#events      = events;
    }
        
    get label() {
        return format_date('yyyy', this.#currentDate);
    }
    
    get eventsDateRange() {
        const year = format_date('yyyy', this.#currentDate);
        
        return new DateRange(
            year + '-01-01 00:00:00.000',
            year + '-12-31 23:59:59.999',
        )
    }
    
    get vars() {
        
        const days = [];
        
        const months = [];
        for (let i = 1; i <= 12; i++) {
            
            const dateRange = DateRange.createForMonth(
                format_date('yyyy', this.#currentDate) + '-' + i + '-01'
            );
            
            let text = dateRange.start.toLocaleString(
                this.#dateLocale, 
                { month: 'long' }
            );
            text = text[0].toUpperCase() + text.substring(1); // ucfirst
            
            const weeks = dateRange.getWeeks();
            
            const monthdays = [];
            for (let n = 1; n <= dateRange.countDays(); n++) {
                const day  = format_date('yyyy-mm', dateRange.start) + "-"+ n;
                const date = new Date(day);
                const is_dayoff = [0,6].includes(date.getDay());
                monthdays.push({ day_of_month: n, is_dayoff });
            }
            
            const startDay = dateRange.start.getDay() || 7;

            const events = this.#events.filter( 
                e => dateRange.intersects(e) 
            );

            months.push({ 
                text, 
                dateRange, 
                weeks, 
                monthdays,
                startDay,
                events
            });
        };
        
        const maxNumberOfWeeks = Math.max(...months.map(m => m.weeks.length));
        for (let w = 1; w <= maxNumberOfWeeks ; w++) {
            let weekDays = getWeekDays({dateLocale: this.#dateLocale});
            if (w === maxNumberOfWeeks) {
                const maxNumDay = Math.max(...months
                    .filter(m => m.weeks.length === maxNumberOfWeeks)
                    .map(m => m.dateRange.end.getDay() || 7)
                );
                weekDays = weekDays.filter((_, n) => n < maxNumDay);
            }
                        
            days.push(
                ...weekDays.map(function(weekDay, n) {
                    const text = weekDay.substring(0, 1).toUpperCase();
                    const numday_in_week = n + 1;
                    return { text, numday_in_week  };
                })
            );
                
        }
               
        return { 
            days, 
            months
        }
        
    }
    
}

class MonthView {
    
    #currentDate;
    #dateLocale;
    #events;
    
    constructor({ currentDate, dateLocale, events }) {
        this.#currentDate = currentDate;
        this.#dateLocale  = dateLocale;
        this.#events      = events;
    }
    
    get eventsDateRange() {
        const currentDay  = new Day(this.#currentDate);
        const startingDay = currentDay.getFirstDayOfMonth().getFirstDayOfWeek();
        const endingDay   = currentDay.getLastDayOfMonth().getLastDayOfWeek();
    
        return new DateRange(
            startingDay + ' 00:00:00',
            endingDay   + ' 23:59:59.999',
        )
    }
    
    get label() {
        return new Date(this.#currentDate).toLocaleString(
            this.#dateLocale, 
            { month: 'long',  year:'numeric' }
        );
    }
    
    get weeks() {
        const eventsDateRange = this.eventsDateRange;
        
        const weeks = [];
        let day = new Day( eventsDateRange.start );
        let endingDay = new Day ( eventsDateRange.end );
        while (day <= endingDay) {
            const days = [ day ];
            for (let n = 1; n < 7; n++) {
                days.push( days[0].addDays(n) );
            }
            weeks.push(days);
            day = day.addDays(7);
        }
        
        return weeks;
    }
    
    get vars() {
        
        const currentDay = new Day(this.#currentDate);
        
        const weeks = this.weeks.map( (days) => {
            
            const dateRange = new DateRange(
                days.at(0)  + ' 00:00:00',
                days.at(-1) + ' 23:59:59.999'
            );
    
            const events = this.#events.filter(e => dateRange.intersects(e));
            
            return { 
                days: days.map( (day) => ({
                    numday: day.numday,
                    value: day,
                    isCurrentMonth: day.month === currentDay.month
                })), 
                dateRange, 
                events 
            };
            
        });
        
        const weekdays = weeks[0].days.map(( { value } ) => {
            return value.date.toLocaleString(
                this.#dateLocale, 
                { weekday: 'short'}
            )
        });
        
        return { weekdays, weeks }
        
    }
    
}

class AbstractDaysView {
    
    #eventsDateRange;
    #minHour;
    #maxHour; 
    #dateLocale;
    #events;
    
    constructor( { eventsDateRange, minHour, maxHour, dateLocale, events }) {
        this.#eventsDateRange = eventsDateRange;
        this.#minHour = minHour;
        this.#maxHour = maxHour;
        this.#dateLocale = dateLocale;
        this.#events = events;
    }
    
    get eventsDateRange() {
        return this.#eventsDateRange;
    }
    
    get minHour() {
        return this.#minHour;
    }
    
    get maxHour() {
        return this.#maxHour;
    }
    
    get dateLocale() {
        return this.#dateLocale;
    }
    
    get hours() {
        return [...Array(this.#maxHour - this.#minHour + 1)]
            .map( (_, n) => n + this.#minHour);
    }
    
    get days() {
        const lastDay = new Day( this.#eventsDateRange.end );
        const days = [ new Day( this.#eventsDateRange.start ) ];
        while (days.at(-1) < lastDay) {
            days.push( days.at(-1).addDays(1) );
        }
        
        return days;
    }
    
    get vars() {
        
        const { eventsDateRange, minHour, maxHour } = this;
        
        const events = this.#events.filter(
            e => eventsDateRange.intersects(e)
        );
        
        const hours = this.hours.map((hour) => {
            return {
                label: String(hour).padStart(2, '0') + ':00',
                value: hour,
            }
        });
        
        const days = this.days.map((day) => {
    
            const dateRange = new DateRange(
                day + ` ${ this.#minHour }:00:00`,
                day + ` ${ this.#maxHour + 1 }:00:00`,
            );
            
            const label = new Date(day).toLocaleString(
                this.#dateLocale, 
                { weekday: 'short', month: 'short', day:'numeric' }
            )
            
            return { 
                value: day, 
                events: events.filter(e => dateRange.contains(e)),
                label, 
                dateRange
            }
        });
        
        const spannedEvents = events.filter( function( otherEvent ) {
            const filter = d => d.events.includes( otherEvent );
            return (days.findIndex( filter ) === -1);
        });
        
        return { hours, days, spannedEvents, minHour, maxHour, eventsDateRange }
        
    }
}

class WeekView extends AbstractDaysView {
    
    constructor({ currentDate, ...otherParams }) {        
        
        const startingDay = new Day(currentDate || Date.now()).getFirstDayOfWeek();
        const endingDay   = startingDay.addDays(6);
        const eventsDateRange = new DateRange(
            startingDay + ' 00:00:00',
            endingDay + ' 23:59:59.999'
        );
        
        super({ eventsDateRange, ...otherParams });
    }
        
    get label() {
        const { start, end } = this.eventsDateRange;
        
        return start.toLocaleString(
            this.dateLocale, 
            { 
                month: 'short', 
                day:'numeric',
                year: 'numeric'
            }
        ) + ' - ' + 
        end.toLocaleString(
            this.dateLocale, 
            { 
                month: 'short', 
                day:'numeric',
                year: 'numeric'
            }
        );
    }
    
}

class DayView extends AbstractDaysView {
    
    constructor({ currentDate, ...otherParams }) {        
        
        const currentDay = new Day(currentDate || Date.now());
        const eventsDateRange = new DateRange(
            currentDay + ' 00:00:00',
            currentDay + ' 23:59:59.999'
        );
        
        super({ eventsDateRange, ...otherParams });
    }
    
    get label() {
        const { start } = this.eventsDateRange;
        return start.toLocaleString(
            this.dateLocale, 
            { 
                weekday: 'long', 
                month: 'long', 
                day:'numeric',
                year: 'numeric'
            }
        )
    }
    
}

module.exports = { 
    DayView, 
    WeekView, 
    MonthView,
    YearView
}
