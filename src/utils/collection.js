
function composeMaps(map1, map2) {
   
   const results = new Map();
   for (const [k1, v1] of map1.entries()) {
       results.set(k1, map2.get(v1));
   }
   
   return results;
    
}

module.exports = {
    composeMaps
}