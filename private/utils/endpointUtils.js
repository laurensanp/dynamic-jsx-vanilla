const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const cache = require("./cache");
const http = require("http");
const { INITIAL_TEST_USERS, INITIAL_NEXT_USER_ID, INITIAL_TEST_DATA_RECORDS, INITIAL_NEXT_DATA_ID, HEALTH_API_RESPONDING, HEALTH_DATABASE_UNAVAILABLE, HEALTH_DATABASE_AVAILABLE, HEALTH_DATABASE_MISSING, HEALTH_CACHE_PING_FAILED, HEALTH_CACHE_OK, HEALTH_MONITORING_NOT_ACCESSIBLE, HEALTH_MONITORING_AVAILABLE, HEALTH_MONITORING_MISSING, HEALTH_OK_THRESHOLD, HEALTH_DEGRADED_THRESHOLD } = require("../settings/serverEndpointSettings");


let testUsers = INITIAL_TEST_USERS;
let nextUserId = INITIAL_NEXT_USER_ID;
let nextDataId = INITIAL_NEXT_DATA_ID;

let testData = {
  records: INITIAL_TEST_DATA_RECORDS
};

const initialTestUsers = JSON.parse(JSON.stringify(testUsers)); // Store initial state as a deep copy
const initialNextUserId = nextUserId; // Store initial state
const initialTestData = JSON.parse(JSON.stringify(testData)); // Deep copy
const initialNextDataId = nextDataId; // Store initial state

const resetTestState = () => {
  testUsers = [...initialTestUsers];
  nextUserId = initialNextUserId;
  testData = JSON.parse(JSON.stringify(initialTestData));
  nextDataId = initialNextDataId;
  ACTIVE_TESTS_RUNNING = 0;
};

module.exports = {
  testUsers,
  nextUserId,
  getHealthChecks: async () => {
    const api = { ok: true, message: HEALTH_API_RESPONDING };

    let database = { ok: false, message: HEALTH_DATABASE_UNAVAILABLE };
    try {
      const hasUsers = Array.isArray(testUsers);
      database = hasUsers
        ? { ok: true, message: HEALTH_DATABASE_AVAILABLE(testUsers.length) }
        : { ok: false, message: HEALTH_DATABASE_MISSING };
    } catch (e) {
      database = { ok: false, message: e.message };
    }

    let cacheCheck = { ok: false, message: HEALTH_CACHE_PING_FAILED };
    try {
      const ok = await cache.ping();
      cacheCheck = ok ? { ok: true, message: HEALTH_CACHE_OK } : { ok: false, message: HEALTH_CACHE_PING_FAILED };
    } catch (e) {
      cacheCheck = { ok: false, message: e.message };
    }

    let monitoring = { ok: false, message: HEALTH_MONITORING_NOT_ACCESSIBLE };
    try {
      const exists = fs.existsSync(LOG_FILE);
      if (exists) {
        const stat = fs.statSync(LOG_FILE);
        monitoring = { ok: true, message: HEALTH_MONITORING_AVAILABLE(stat.size) };
      } else {
        monitoring = { ok: false, message: HEALTH_MONITORING_MISSING };
      }
    } catch (e) {
      monitoring = { ok: false, message: e.message };
    }

    const checks = { api, database, cache: cacheCheck, monitoring };
    const okCount = Object.values(checks).filter(c => c.ok).length;
    const overall = okCount === HEALTH_OK_THRESHOLD ? "ok" : okCount >= HEALTH_DEGRADED_THRESHOLD ? "degraded" : "down";
    return { status: overall, checks, timestamp: new Date().toISOString() };
  },
  updateNextUserId: () => {
    return nextUserId++;
  },
  nextDataId,
  updateNextDataId: () => {
    return nextDataId++;
  },
  testData,
  resetTestState // Export the new function
};
