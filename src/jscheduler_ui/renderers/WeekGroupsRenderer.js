const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class WeekGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'week'
        };
    }
    
    getCols( view ) {
        return view.getDays().map((day) => {
        
            const text = new Date(day).toLocaleString(
                'en', 
                { weekday: 'short' }
            )
            const subtext = new Date(day).toLocaleString(
                'en', 
                { day:'numeric' }
            )
            const style = {
                width: ((100 - this.yaxisWidthPercent) / 7) + '%',
            }

            return { text, subtext, style }

        });
    }
    
    getDaysOff( view ) {
        return view.getDays().map((day, k) => {
            const date = new Date(day) ;
            const style = {   
                width: ( 100 / 7 )     + '%',
                left:  ( k * 100 / 7 ) + '%'
            }
            return { date, style }
        }).filter(v => [0, 6].includes(v.date.getDay()) );
    }
    
}

module.exports = WeekGroupsRenderer;