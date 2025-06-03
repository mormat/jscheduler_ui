
const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

const { date_format } = require('@src/utils/date');

class DayGroupsRenderer extends AbstractGroupsRenderer {
    
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'day'
        };
    }
    
    getCols() {
        const cols = [];
        
        for (let i = 0; i < 12; i++) {
            const strtime = `1970-01-01 ${i * 2}:00`;
            const text    = date_format(strtime, 'hh:ii');
            cols.push({ text })
        }
        
        return cols;
    }
    
    getColumnTimeRangeType() {
       return 'day_hour' 
    }
    
}

module.exports = DayGroupsRenderer;

