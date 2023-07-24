// cacheManager.js
import fileCache from 'node-file-cache';


const cache = fileCache.create({ life: 60 * 60 * 24 * 7, tmpDir: '/tmp' });

export default cache;
