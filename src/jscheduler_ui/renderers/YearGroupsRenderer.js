const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class YearGroupsRenderer extends AbstractGroupsRenderer {
        
    getAttr() {
        return {
            ...super.getAttr(),
            'data_type_view': 'year'
        };
    }
    
    getCols( ) {
        
        const cols = [];
        
        for (let i = 1; i <= 12; i++) {
            const date = new Date(`1970-${i}-01`);
            const text = date.toLocaleString(
                "en",
                { month: 'short' }
            );
            const style = {
                width: ((100 - this.yaxisWidthPercent) / 12) + '%',
            }
            cols.push({ text, style });
        }
        
        return cols;
        
    }
    
    getColumnTimeRangeType() {
       return 'month' 
    }
    
}

module.exports = YearGroupsRenderer;