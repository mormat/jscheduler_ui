
const { escape_html, build_html_style } = require('@src/utils/html');
const { Day, format_date } = require('@src/utils/date');
const { groupDateRangedItemsByPosition } = require('@src/utils/date');
const eventHeight = '20';

function TimelineView( { schedulerSettings } ) {
    
    this.renderRow = ( { events, dateRange, eventDroppableTarget } ) => {
        
        const groupedEvents = groupDateRangedItemsByPosition(
            events.filter(e => dateRange.intersects(e))
        );
        
        const style = [
            'width: 100%',
            `height: ${eventHeight * groupedEvents.length}px`,
            'position: relative'
        ].join(';');
        
        const attrs = [
            `data-daterange_start="${ format_date('yyyy-mm-dd hh:ii:ss', dateRange.start)}"`,
            `data-daterange_end="${ format_date('yyyy-mm-dd hh:ii:ss', dateRange.end)}"`,
        ].join(' ');

        return `
            <div style="${ style }" ${attrs} >

                ${ 
                    groupedEvents.map((events, eventIndex) => {
                        return events.map(function(event) {
                            return renderEvent({
                                event, dateRange, eventDroppableTarget,
                                totalEvent: groupedEvents.length,
                                eventIndex
                            });
                        }).join('');
                    }).join('')
                } 
                
            </div>
        `;

    }
    
    function renderInnerEvent( { event } ) {
        
        const contents = [];
        
        if (schedulerSettings.eventsDraggable) {
            const style = [
                'position: absolute',
                'top: 0',
                'left: 0',
                'right: 0',
                'bottom: 0',
                'z-index: 1'
            ].join(';');
            
            contents.push(`
                <div class="jscheduler_ui-draggable" style="${style}" >
                </div>
            `);
        }
        
        if (schedulerSettings.onEventClick) {
            contents.push(`
                <span style="position: relative; z-index: 2">
                    <a href="#" style="color: ${ event.color }">
                        ${ escape_html(event.label) }
                    </a>
                </span>
            `);
        } else {
            
            contents.push(`
                <span style="color: ${ event.color }">
                    ${ escape_html(event.label) }
                </span>
            `);
        }
        
        return contents.join('');
    }
    
    function renderEvent( { event, dateRange, eventDroppableTarget, eventIndex, eventTotal } ) {
        
        const intersect = dateRange.intersects(event);
        
        const start = new Day(intersect.start) + ' 00:00:00';
        const end   = new Day(intersect.end)   + ' 23:59:59';

        const style = build_html_style({
            ...event.styles,
            'position': 'absolute',
            'top': (eventIndex * eventHeight) + 'px',
            'left':  dateRange.calcPercentPosition(start) + '%',
            'right': (100 - dateRange.calcPercentPosition(end)) + '%',
            'height': eventHeight + 'px',
            'line-height': eventHeight + 'px',
        });

        const attrs = [
            `class="jscheduler_ui-event jscheduler_ui-event-timeline ${event.className}"`,
            `style="${ style }"`,
            `data-event-id="${event.id}"`,
            eventDroppableTarget ?  
                `data-jscheduler_ui-droppable-target="${eventDroppableTarget}"`:
                ''
        ].join(' ');
        
        return `
            <div ${attrs} >
                ${ renderInnerEvent( { event }) }
            </div>
        `;
        
    }

}

module.exports = { TimelineView }