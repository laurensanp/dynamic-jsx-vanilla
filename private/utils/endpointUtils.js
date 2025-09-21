const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const cache = require("./cache");

let ACTIVE_TESTS_RUNNING = 0;

let testUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];
let nextUserId = 3;

let testData = {
  records: [
    { id: 1, value: "test data 1" },
    { id: 2, value: "test data 2" }
  ]
};

module.exports = {
  testUsers,
  nextUserId,
  testData,
  ACTIVE_TESTS_RUNNING,
  updateActiveTestsRunning: (delta) => {
    ACTIVE_TESTS_RUNNING = Math.max(0, ACTIVE_TESTS_RUNNING + delta);
    return ACTIVE_TESTS_RUNNING;
  },
  getHealthChecks: async () => {
    const api = { ok: true, message: "API responding" };

    let database = { ok: false, message: "Unavailable" };
    try {
      const hasUsers = Array.isArray(testUsers);
      database = hasUsers
        ? { ok: true, message: `In-memory data available (${testUsers.length} users)` }
        : { ok: false, message: "In-memory data missing" };
    } catch (e) {
      database = { ok: false, message: e.message };
    }

    let cacheCheck = { ok: false, message: "Cache ping failed" };
    try {
      const ok = await cache.ping();
      cacheCheck = ok ? { ok: true, message: "Cache OK" } : { ok: false, message: "Cache ping failed" };
    } catch (e) {
      cacheCheck = { ok: false, message: e.message };
    }

    let monitoring = { ok: false, message: "Log file not accessible" };
    try {
      const exists = fs.existsSync(LOG_FILE);
      if (exists) {
        const stat = fs.statSync(LOG_FILE);
        monitoring = { ok: true, message: `Log file size ${stat.size} bytes` };
      } else {
        monitoring = { ok: false, message: "Log file missing" };
      }
    } catch (e) {
      monitoring = { ok: false, message: e.message };
    }

    const checks = { api, database, cache: cacheCheck, monitoring };
    const okCount = Object.values(checks).filter(c => c.ok).length;
    const overall = okCount === 4 ? "ok" : okCount >= 2 ? "degraded" : "down";
    return { status: overall, checks, timestamp: new Date().toISOString() };
  },
  updateNextUserId: () => { 
    return nextUserId++;
  }
};
