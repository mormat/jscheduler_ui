
const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class MonthGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'month'
        };
    }
    
    getDays( view ) {
        
        const days = [];
        for (const week of view.weeks) {
            days.push(...week.days);
        }
        
        return days;
        
    }
    
    getCols( view ) {
    
        const cols = [];
       
        const weeks = view.weeks;
        
        const days = weeks.map(w => w.getDays()).flat();
        for (const day of days) {
            const date = new Date(day);
            const text = date.toLocaleString(
                'en',
                { weekday: 'short' }
            )[0];
            const subtext = date.toLocaleString(
                'en',
                { day: 'numeric' }
            )
            const disabled = date.getMonth() !== view.month;

            const style = {
                width: ((100 - this.yaxisWidthPercent) / (weeks.length * 7)) + '%',
            }

            cols.push({ text, subtext, style, disabled });
        }
        
        return cols;
        
    }
    
    getDaysOff( view ) {
        const days = view.weeks.map(w => w.getDays()).flat();
        
        return days.map((day, k) => {
            const date = new Date(day);
            const style = {   
                width: ( 100 / (view.weeks.length * 7) )     + '%',
                left:  ( k * 100 / (view.weeks.length * 7) ) + '%'
            }
            return { date, style }
        }).filter(v => [0, 6].includes(v.date.getDay()) );
    }
    
}

module.exports = MonthGroupsRenderer;