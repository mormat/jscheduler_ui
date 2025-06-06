
const AbstractViewRenderer = require('./AbstractViewRenderer');

class AbstractGroupsRenderer extends AbstractViewRenderer {
    
    #data
    
    constructor({ data = {}, ...otherParams} ) {
        super(otherParams);
        this.#data = {
            ...data,
            droppable_id: 'jscheduler_ui-' + this.getUniqueId()
        }
    }
    
    getCols() {
        return [];
    }
    
    render(view, { groups, ...otherOptions }) {
        
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
        
        const cols = this.getCols(view);
        
        const rows = groups.map((section) => {
            const { label } = section;

            const events_row = this.withEventsRowPartial({
                eventDroppableTarget: '#' + this.#data.droppable_id,
                dateRange: dateRange,
                events:    events.filter(
                    e => (e.group_id || null) == section.id
                ),
                columnDateRangeType: this.#data.column_unit,
                groupId: section.id,
                labelType: 'showGroups'
            });

            const cells_layout = this.buildCellsLayout(
                cols.map(({data}) => ({
                    label: '', 
                    is_dayoff: (data || {}).is_dayoff
                }))     
            )

            return { label, events_row, cells_layout }

        });
        
        const yaxis_width_percent = 15;
        
        const data = {
            ...this.#data,
            yaxis_width: yaxis_width_percent + '%',
            column_width: ((100 - yaxis_width_percent) / cols.length) + '%'
        }
        
        const vars = { cols, rows, data };
        
        return this._renderTemplate('groups', vars);
    }
    
}

module.exports = AbstractGroupsRenderer;