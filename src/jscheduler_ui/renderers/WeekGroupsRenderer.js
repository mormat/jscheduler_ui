const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class WeekGroupsRenderer extends AbstractGroupsRenderer {
    
    constructor(otherParams) {
        super(
            {...otherParams,
            data: { type_view: 'week' }
        });
    }
        
    getCols( view ) {
        return view.getDays().map((day) => {
        
            const d = new Date(day);
            
            const text = d.toLocaleString(
                'en', 
                { weekday: 'short' }
            );
            const subtext = d.toLocaleString(
                'en', 
                { day:'numeric' }
            );

            const data = {
                'is_dayoff': [0, 6].includes(d.getDay())
            };
            
            return { text, subtext, data }

        });
    }
    
}

module.exports = WeekGroupsRenderer;