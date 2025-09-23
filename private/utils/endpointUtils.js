const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const cache = require("./cache");
const http = require("http");
const ServerEndpointSettings = require("../settings/serverEndpointSettings");


let testUsers = ServerEndpointSettings.INITIAL_TEST_USERS;
let nextUserId = ServerEndpointSettings.INITIAL_NEXT_USER_ID;
let nextDataId = ServerEndpointSettings.INITIAL_NEXT_DATA_ID;

let testData = {
  records: ServerEndpointSettings.INITIAL_TEST_DATA_RECORDS
};

const initialTestUsers = JSON.parse(JSON.stringify(testUsers));
const initialNextUserId = nextUserId;
const initialTestData = JSON.parse(JSON.stringify(testData));
const initialNextDataId = nextDataId;

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
    const api = { ok: true, message: ServerEndpointSettings.HEALTH_API_RESPONDING };

    let database = { ok: false, message: ServerEndpointSettings.HEALTH_DATABASE_UNAVAILABLE };
    try {
      const hasUsers = Array.isArray(testUsers);
      database = hasUsers
        ? { ok: true, message: ServerEndpointSettings.HEALTH_DATABASE_AVAILABLE(testUsers.length) }
        : { ok: false, message: ServerEndpointSettings.HEALTH_DATABASE_MISSING };
    } catch (e) {
      database = { ok: false, message: e.message };
    }

    let cacheCheck = { ok: false, message: ServerEndpointSettings.HEALTH_CACHE_PING_FAILED };
    try {
      const ok = await cache.ping();
      cacheCheck = ok ? { ok: true, message: ServerEndpointSettings.HEALTH_CACHE_OK } : { ok: false, message: ServerEndpointSettings.HEALTH_CACHE_PING_FAILED };
    } catch (e) {
      cacheCheck = { ok: false, message: e.message };
    }

    let monitoring = { ok: false, message: ServerEndpointSettings.HEALTH_MONITORING_NOT_ACCESSIBLE };
    try {
      const exists = fs.existsSync(LOG_FILE);
      if (exists) {
        const stat = fs.statSync(LOG_FILE);
        monitoring = { ok: true, message: ServerEndpointSettings.HEALTH_MONITORING_AVAILABLE(stat.size) };
      } else {
        monitoring = { ok: false, message: ServerEndpointSettings.HEALTH_MONITORING_MISSING };
      }
    } catch (e) {
      monitoring = { ok: false, message: e.message };
    }

    const checks = { api, database, cache: cacheCheck, monitoring };
    const okCount = Object.values(checks).filter(c => c.ok).length;
    const overall = okCount === ServerEndpointSettings.HEALTH_OK_THRESHOLD ? "ok" : okCount >= ServerEndpointSettings.HEALTH_DEGRADED_THRESHOLD ? "degraded" : "down";
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
  resetTestState
};
