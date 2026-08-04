/**
 * Persists TableBack UI state (filters, page size) in localStorage under tableConfigCache.
 */
const setTableConfigCache = (tableKey, config, ttl = null) => {
  try {
    const now = new Date();
    let expiry = null;

    if (ttl != null) {
      expiry = now.getTime() + ttl * 1000;
    }

    const existingCache = getTableConfigCache();
    const updatedCache = {
      ...existingCache,
      [tableKey]: {
        value: config,
        expiry,
      },
    };

    localStorage.setItem('tableConfigCache', JSON.stringify(updatedCache));
  } catch (error) {
    console.error('Error setting table config cache:', error);
  }
};

const getTableConfigCache = (tableKey = null) => {
  try {
    const cacheStr = localStorage.getItem('tableConfigCache');

    if (!cacheStr) {
      return tableKey ? null : {};
    }

    const cache = JSON.parse(cacheStr);
    const now = new Date();

    if (tableKey) {
      const tableData = cache[tableKey];

      if (!tableData) {
        return null;
      }

      if (tableData.expiry != null && now.getTime() > tableData.expiry) {
        delete cache[tableKey];
        localStorage.setItem('tableConfigCache', JSON.stringify(cache));
        return null;
      }

      return tableData.value;
    }

    const cleanedCache = {};
    let hasExpiredEntries = false;

    for (const key in cache) {
      const tableData = cache[key];

      if (tableData.expiry != null && now.getTime() > tableData.expiry) {
        hasExpiredEntries = true;
        continue;
      }

      cleanedCache[key] = tableData;
    }

    if (hasExpiredEntries) {
      localStorage.setItem('tableConfigCache', JSON.stringify(cleanedCache));
    }

    return cleanedCache;
  } catch (error) {
    console.error('Error getting table config cache:', error);
    return tableKey ? null : {};
  }
};

const removeTableConfigCache = (tableKey = null) => {
  try {
    if (tableKey) {
      const cache = getTableConfigCache();
      delete cache[tableKey];
      localStorage.setItem('tableConfigCache', JSON.stringify(cache));
    } else {
      localStorage.removeItem('tableConfigCache');
    }
  } catch (error) {
    console.error('Error removing table config cache:', error);
  }
};

/** @typedef {object} TableConfigCache - Persisted pagination/filter snapshot per table key. */
export { getTableConfigCache, removeTableConfigCache, setTableConfigCache };
