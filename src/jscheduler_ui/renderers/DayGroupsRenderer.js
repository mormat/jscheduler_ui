
const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

const { date_format } = require('@src/utils/date');

class DayGroupsRenderer extends AbstractGroupsRenderer {
    
    constructor(otherParams) {
        super({
            ...otherParams,
            data: { 
                type_view: 'day',
                column_unit: 'day_hour'
            }
        });
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
    
}

module.exports = DayGroupsRenderer;

