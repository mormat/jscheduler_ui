const AbstractGroupsRenderer = require('./AbstractGroupsRenderer');

class YearGroupsRenderer extends AbstractGroupsRenderer {
        
    constructor(otherParams) {
        super(
            {...otherParams,
            data: { 
                type_view: 'year',
                column_unit: 'month' 
            }
        });
    }
        
    getCols( ) {
        
        const cols = [];
        
        for (let i = 1; i <= 12; i++) {
            const date = new Date(`1970-${i}-01`);
            const text = date.toLocaleString(
                "en",
                { month: 'short' }
            );
            cols.push({ text });
        }
        
        return cols;
        
    }
    
}

module.exports = YearGroupsRenderer;