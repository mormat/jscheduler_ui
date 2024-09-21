
const { Day, DateRange } = require('@src/utils/date');
const { TimelineView } = require('./timeline');

const { getUniqueId } = require('@src/utils/dom');

function MonthView( { schedulerSettings, schedulerState } ) {
    
    function renderGrid() {
        
        return [...Array(6)].map( (_, n) => `
            <div class="jscheduler_ui-hsep"
                 style="position: absolute; 
                        left :${ ((n + 1) * 100 / 7 ) }%;
                        top: 0;
                        height: 100%;
                        width: 1px;
                       "
            >
            </div>
        `).join('')
    }
    
    function renderTimelineRow( row ) {
    
        const { events } = schedulerState;
        
        const view = new TimelineView( { schedulerSettings } );
    
        return view.renderRow( { events, ...row } );
                
    }
    
    this.getEventsDateRange = () => {
        
        const currentDay  = new Day(schedulerState.currentDate);
        
        const startDay = currentDay.getFirstDayOfMonth().getFirstDayOfWeek();
        const endDay = currentDay.getLastDayOfMonth().getLastDayOfWeek();
        
        return new DateRange(
            startDay + ' 00:00:00',
            endDay   + ' 23:59:59.999',
        )
        
    }
    
    this.toString = function(  ) {
        
        const bodyId = 'jscheduler_ui-' + getUniqueId();
        
        const weeks = [];
        const eventsDateRange = this.getEventsDateRange();
        const startingDay = new Day(eventsDateRange.start);
        const endingDay   = new Day(eventsDateRange.end);
        let day = startingDay;
        while (day <= endingDay) {
            const days = [ day ];
            for (let n = 1; n < 7; n++) {
                days.push( days[0].addDays(n) );
            }
            const dateRange = new DateRange(
                days.at(0)  + ' 00:00:00',
                days.at(-1) + ' 23:59:59',
            );
            weeks.push({ 
                eventDroppableTarget: '#' + bodyId, 
                days, dateRange
            });
            day = day.addDays(7);
        }
                
        const weekdays = weeks[0].days.map(function( day ) {
            return day.date.toLocaleString(
                schedulerSettings.dateLocale, 
                { weekday: 'short'}
            );
        });
        
        const currentDay = new Day(schedulerState.currentDate);
        
        return `
            <table  class="jscheduler_ui-month_view"
                    style="width: 100%; 
                           table-layout: fixed; 
                           flex: 1 1 auto;"
            >
                <thead>
                    <tr>
                        ${ weekdays.map( (weekday) => ` 
                            <th style="width: 14.28%">
                                ${ weekday }
                            </th>
                        `).join('') }
                    </tr>
                </thead>
                <tbody id="${bodyId}"
                    data-jscheduler_ui-droppable-type="timeline" 
                >
                    ${ weeks.map( (week, n) => ` 
                        <tr>
                            <td colspan="7" 
                                style="position: relative; height: ${100 / weeks.length}%"
                                class="jscheduler_ui-daterange"
                            >
                            ${ renderGrid() }
                            ${ week['days'].map( (day, n2) => ` 
                                <span style="width: 14.28%;
                                             left:  ${14.28 * n2}%;
                                             top: 0;
                                             position: absolute;
                                             text-align: right;
                                            " 
                                      class="jscheduler_ui-month_view-numday 
                                             jscheduler_ui-month_view-numday-${ day.vars.monthIndex === currentDay.vars.monthIndex ? 'active' : 'inactive' }
                                             jscheduler_ui-daterange-header
                                            "  
                                >
                                    ${ day.vars.day }
                                </span>
                            `).join('') }
                            <div class="jscheduler_ui-daterange-row" >
                                ${ renderTimelineRow( week ) } 
                            </div>
                            </td>
                        </tr>
                    `).join('') }
                    
                </tbody>
            </table>
        `;
    }
    
}

module.exports = { MonthView }