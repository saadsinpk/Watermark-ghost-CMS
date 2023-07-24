const NodeCache = require('node-cache');

// Replace 'CACHE_KEY_PREFIX' with the prefix you used in your application for the cache keys
const cache = new NodeCache({ stdTTL: 0, checkperiod: 0, useClones: false });

function clearCache() {
  cache.flushAll();
}

// Call the function to clear the cache
clearCache();
