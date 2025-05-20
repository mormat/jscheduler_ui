
class AbstractViewHelper {
    
    _world;
    _debugRects = [];
    
    constructor(world, { debugRects }) {
        this._world = world;
        this._debugRects = debugRects;
    }
    
}

module.exports = AbstractViewHelper;