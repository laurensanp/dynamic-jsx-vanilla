
const store = new Map();

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
    const testKey = '__health_ping__';
    const testVal = 'health_ping_value';
    set(testKey, testVal, 1000);
    const got = get(testKey);
    const ok = got === testVal;
    del(testKey);
    return ok;
  } catch (e) {
    return false;
  }
}

module.exports = { set, get, del, clear, ping };