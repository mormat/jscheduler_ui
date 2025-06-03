
const AbstractViewRenderer = require('./AbstractViewRenderer');

class AbstractGroupsRenderer extends AbstractViewRenderer {
    
    get yaxisWidthPercent() {
        return 15;
    }
    
    getCols() {
        return [];
    }
    
    getAttr() {
        return {
            id: 'jscheduler_ui-' + this.getUniqueId(),
        };
    }
    
    getColumnTimeRangeType() {
       return 'day' 
    }
    
    getDaysOff() {
        return [];
    }
    
    render(view, { groups, ...otherOptions }) {
        
        const vars = {  };
        
        const yaxis_width_percent = 15;
        
        const dateRange = view.eventsDateRange;
        
        const groupIds = groups.map(g => g.id);
        const events    = view
            .filterEvents( otherOptions.events )
            .map(function(e) {
                if (e.group_id === undefined) {
                    return { ...e, group_id: null }
                }
                if (!groupIds.includes(e.group_id)) {
                    if (Number.isInteger(e.group_id)) {
                        return { ...e, group_id: null };
                    }
                }
                return e;
            }
        );
        
        const missingGroupIds = new Set(events
            .map(e => e.group_id)
            .filter(v => !groupIds.includes(v))
        );
        // put null at the end
        if (missingGroupIds.has(null)) {    
            missingGroupIds.delete(null);
            missingGroupIds.add(null);
        }
        
        for (const group_id of missingGroupIds) {
            groups.push({
                id:   group_id, 
                label: group_id || ''
            });
        }
        
        vars.attr = this.getAttr();
        
        vars.xaxis = {
            cols: this.getCols(view),
        }
        
        vars.yaxis = {
            style: {
                width: yaxis_width_percent + '%'
            },
            rows: groups.map((section) => {
                const { label } = section;

                const events_row = this.withEventsRowPartial({
                    eventDroppableTarget: '#' + vars.attr['id'],
                    dateRange: dateRange,
                    events:    events.filter(
                        e => (e.group_id || null) == section.id
                    ),
                    columnDateRangeType: this.getColumnTimeRangeType(),
                    groupId: section.id,
                    labelType: 'showGroups'
                });
                
                const grid = this.withGridPartial(
                    { cols: vars.xaxis.cols.length }
                );

                const daysoff = this.getDaysOff(view);
                
                return { label, events_row, grid, daysoff }
            })
        }
        
        return this._renderTemplate('groups', vars);
    }
    
}

module.exports = AbstractGroupsRenderer;