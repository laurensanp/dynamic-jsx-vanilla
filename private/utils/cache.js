
const store = new Map();
const { CACHE_HEALTH_TEST_KEY, CACHE_HEALTH_TEST_VALUE, CACHE_HEALTH_TEST_TTL_MS } = require("../settings/serverCacheSettings");

function set(key, value, ttlMs = 0) {
  const expiresAt = ttlMs > 0 ? Date.now() + ttlMs : 0;
  store.set(key, { value, expiresAt });
}

function get(key) {
  const entry = store.get(key);
  if (!entry) return undefined;
  if (entry.expiresAt && entry.expiresAt > 0 && Date.now() > entry.expiresAt) {
    store.delete(key);
    return undefined;
  }
  return entry.value;
}

function del(key) {
  store.delete(key);
}

function clear() {
  store.clear();
}

async function ping() {
  try {
    const testKey = CACHE_HEALTH_TEST_KEY;
    const testVal = CACHE_HEALTH_TEST_VALUE;
    set(testKey, testVal, CACHE_HEALTH_TEST_TTL_MS);
    const got = get(testKey);
    const ok = got === testVal;
    del(testKey);
    return ok;
  } catch (e) {
    return false;
  }
}

module.exports = { set, get, del, clear, ping };