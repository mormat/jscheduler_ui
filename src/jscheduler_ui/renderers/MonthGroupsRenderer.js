
const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class MonthGroupsRenderer extends AbstractGroupsRenderer {
    
    constructor(otherParams) {
        super({
            ...otherParams,
            data: { type_view: 'month' }
        });
    }
    
    getCols( view ) {
    
        const cols = [];
       
        const days = view.weeks.map(w => w.getDays()).flat();
        for (const day of days) {
            const classes = [];
            
            const d = new Date(day);
            const text = d.toLocaleString(
                'en',
                { weekday: 'short' }
            )[0];
            const subtext = d.toLocaleString(
                'en',
                { day: 'numeric' }
            )
    
            if (d.getMonth() !== view.month) {
                classes.push('jscheduler_ui-disabled');
            }
            
            const data = {
                is_dayoff: [0, 6].includes(d.getDay())
            };

            cols.push({ 
                text, subtext, data, className: classes.join(' ') 
            });
        }
        
        return cols;
        
    }
    
}

module.exports = MonthGroupsRenderer;