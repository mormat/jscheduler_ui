
const { Day, DateRange } = require('@src/utils/date');

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
                events: this.#events.filter(e => dateRange.contains(e)),
                label, 
                dateRange
            }
        });
        
        const spannedEvents = this.#events.filter( function( otherEvent ) {
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

module.exports = { DayView, WeekView, MonthView }
