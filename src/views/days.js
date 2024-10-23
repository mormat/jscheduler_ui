
const { Day, DateRange, format_date } = require('@src/utils/date');
const { escape_html, build_html_style } = require('@src/utils/html');
const { ceil } = require('@src/utils/math');
const { getUniqueId } = require('@src/utils/dom');
const { TimelineView } = require('./timeline');

const { groupDateRangedItemsByPosition } = require('@src/utils/date');

const HOUR_WIDTH_PERCENT = 5;

function DaysView( { schedulerSettings, schedulerState } ) {
    
    const hours  = [...Array(schedulerSettings.maxHour - schedulerSettings.minHour + 1)]
            .map( (_, n) => n + schedulerSettings.minHour);
    
    function renderHeader( { day, widthPercent } ) {
    
        const text = day.date.toLocaleString(
            schedulerSettings.dateLocale, 
            { 
                weekday: 'short', 
                month: 'short',  
                day:'numeric',
                // year: "numeric"
            }
        );
    
        const style = [
            `width: ${ ceil(widthPercent, 2) }%`,
            'text-align: center'
        ].join(';');

        return `
            <th style="${ style }" class="jscheduler_ui-daterange-header jscheduler_ui-day-header">
                ${ escape_html(text) }
            </th>
        `;

    }
    
    function renderColumn( column ) {

        const { day, dateRange, widthPercent, eventDroppableTarget } = column;

        const groupedEvents = groupDateRangedItemsByPosition(
            schedulerState.events.filter(e => dateRange.contains(e))
        );

        const style = [
            `width: ${ ceil(widthPercent, 2) }%`,
            'position: relative'
        ].join(';');

        // @todo instead of 'data-day', 'data-minhour', 'data-max-hour', using 'data-daterange-start' and 'data-daterange-end' ?????
        return `
            <td style   = "${ style }" 
                rowspan = "${ hours.length }"
                data-jscheduler_ui-day = "${ day }"
                data-day = "${ day }"
                data-minhour = "${ String(hours.at(0)).padStart(2, '0') + ':00' }"
                data-maxhour = "${ String(hours.at(-1) + 1).padStart(2, '0') + ':00' }"
            >
                ${ 
                    groupedEvents.map(function(events, indexEvent) {
                        
                        return events.map((event) => renderEvent({
                            event, 
                            dateRange,
                            eventDroppableTarget,
                            indexEvent,
                            totalEvent: groupedEvents.length
                        })).join('');
                        
                    }).join('')
                }
            </td>
        `;

    }

    function renderGrid() {
        
        const numLines = hours.length;
        
        return [...Array(numLines - 1)].map( (_, n) => `
            <div class="jscheduler_ui-vsep"
                 style="position: absolute; 
                        top:${ ((n + 1) * 100 / numLines ) }%;
                        left: 0;
                        width: 100%;
                        height: 1px;
                       "
            >
            </div>
        `).join('')
    }

    this.renderInnerEvent = function( { event } ) {
        
        const contents = [];
        
        if (schedulerSettings.eventsDraggable) {
            const style = [
                'position: absolute',
                'top: 0',
                'left: 0',
                'right: 0',
                'bottom: 0',
                'z-index: 1',
            ].join(';');
            
            contents.push(`
                <div class="jscheduler_ui-draggable" style="${style}" >
                </div>
            `);
        }
        
        if (schedulerSettings.eventsResizeable) {
            const style = [
                'position: absolute',
                'left: 0',
                'right: 0',
                'bottom: 0',
                'height: 10px',
                'z-index: 2',
            ].join(';');
            
            contents.push(`
                <div class="jscheduler_ui-resize-handler" style="${style}" >
                </div>
            `);
        }
        
        if (schedulerSettings.onEventClick) {
            contents.push(`
                <span style="position: relative; z-index: 3;">
                    <a href="#" style="color: ${ event.color }" class="jscheduler_ui-event-header">
                        ${ event.header }
                    </a>
                    <br/>
                    <a href="#" style="color: ${ event.color }">
                        ${ escape_html(event.label) }
                    </a>
                </span>
            `);
        } else {
            contents.push(`                
                <span style="color: ${ event.color }" class="jscheduler_ui-event-header">
                    ${ event.header }
                </span>
                <br/>
                <span style="color: ${ event.color }">
                    ${ escape_html(event.label) }
                </span>
            `);
        }
        
        return contents.join('');
        
    }

    const renderEvent = ( {dateRange, event, eventDroppableTarget, indexEvent = 0, totalEvent = 1 } ) => {

        const style = build_html_style({
            ...event.styles,
            'position': 'absolute',
            'top': ceil(dateRange.calcPercentPosition(event.start), 2) + '%',
            'bottom': ceil(100 - dateRange.calcPercentPosition(event.end), 2) + '%',
            'left':  (indexEvent * 100 / totalEvent) + '%',
            'width': (100 / totalEvent) + '%'
        });

        const attrs = [
            `style="${style}"`,
            `class="jscheduler_ui-event jscheduler_ui-event-day ${event.className}"`,
            `data-event-id="${event.id}"`,
            eventDroppableTarget ?  
                `data-jscheduler_ui-droppable-target="${eventDroppableTarget}"`:
                ''
        ].join(' ');

        return `
            <div ${ attrs }>
                ${ this.renderInnerEvent( { event } ) }
            </div>
        `;
    }

    function renderTimelineRow( params ) {
        
        const view = new TimelineView( { schedulerSettings } );
    
        return view.renderRow(params);
        
    }
    
    this.getDateRange = () => {
        
        const currentDay = new Day(schedulerState.currentDate);
        if (schedulerSettings.viewMode === 'day') {
            
            return new DateRange(
                currentDay  + ' 00:00:00',
                currentDay + ' 23:59:59.999',
            )
            
        } else {
            
            return new DateRange(
                currentDay.getFirstDayOfWeek() + ' 00:00:00',
                currentDay.getLastDayOfWeek()  + ' 23:59:59.999',
            );
            
        }
        
    }
    
    this.getEventsDateRange = () => {
        
        return this.getDateRange();
        
    }
    
    this.toString = function() {
        
        const headerId = 'jscheduler_ui-' + getUniqueId();
        const bodyId   = 'jscheduler_ui-' + getUniqueId();

        const dateRange = this.getDateRange();

        const lastDay = new Day( dateRange.end );
        const days = [ new Day( dateRange.start ) ];
        while (days.at(-1) < lastDay) {
            days.push( days.at(-1).addDays(1) );
        }
        
        const headers = days.map( day => ({ 
            day,
            widthPercent: (100 - HOUR_WIDTH_PERCENT) / days.length
        }) );
             
        const columns = days.map( (day) => {
    
            const dateRange = new DateRange(
                day + ` ${ schedulerSettings.minHour }:00:00`,
                day + ` ${ schedulerSettings.maxHour + 1 }:00:00`
            );
    
            const events = schedulerState.events.filter(e => dateRange.contains(e));
            
            return { 
                day, dateRange, events,
                widthPercent: (100 - HOUR_WIDTH_PERCENT) / days.length,
                eventDroppableTarget: '#' + bodyId
            }
            
        });
        
        const timelineRow = {
            events:     schedulerState.events.filter( function( otherEvent ) {
                const filter = c => c.events.includes( otherEvent );
                return (columns.findIndex( filter ) === -1);
            }),   
            dateRange:  new DateRange(
                days.at(0)  + ` 00:00:00`,
                days.at(-1) + ` 23:59:59`
            ),
            eventDroppableTarget: '#' + headerId
        }
                
        return `
            <table id="${ headerId }"
                   class="jscheduler_ui-day_view-header jscheduler_ui-daterange"
                   style="width: 100%; 
                       table-layout: fixed; 
                       flex: 0 1 auto;"
                    data-jscheduler_ui-droppable-type="timeline" 
            >
                <thead ${ schedulerSettings.headersVisible ? '': `style="display: none"`}>
                    <tr>
                        <td style="width: ${ HOUR_WIDTH_PERCENT }%">
                        </td>
                        ${ headers.map(h => renderHeader(h)).join('') }
                    </tr>
                </thead>
                ${
                    timelineRow.events.length > 0 ?
                    `<tbody>
                        <tr>
                            <td style="width: ${ HOUR_WIDTH_PERCENT }%">
                            <td class="jscheduler_ui-daterange-row"
                                colspan="${ days.length }"
                            >
                                ${ renderTimelineRow( timelineRow ) }
                            </td>
                        </tr>
                    </tbody>` :
                    ''
                }
            </table>
            <table  id="${ bodyId }"
                    class="jscheduler_ui-day_view-body"
                    style="width: 100%; 
                          table-layout: fixed; 
                          flex: 1 1 auto;"
                    data-jscheduler_ui-droppable-type="days"
            >
                <tbody style="position: relative">
                    ${ hours.map( (hour, n) => `
                        <tr>
                            <th style="width: ${HOUR_WIDTH_PERCENT}%"
                                data-hour
                            >
                                ${ String(hour).padStart(2, '0') + ':00' }
                                
                                ${ n === 0 ? renderGrid() : '' }
                            </th>
                            ${ 
                                n === 0 ? 
                                columns.map(c => renderColumn(c)).join('') :
                                ''
                            }
                        </tr>     
                    ` ).join('')}
                </tbody>
            </table>
        `;
    }
    
}

module.exports = { DaysView }
