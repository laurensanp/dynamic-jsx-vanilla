const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const cache = require("./cache");
const http = require("http");


let testUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];
let nextUserId = 3;
let nextDataId = 3;

let testData = {
  records: [
    { id: 1, value: "test data 1" },
    { id: 2, value: "test data 2" }
  ]
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
  ACTIVE_TESTS_RUNNING = 0; // Reset active test count
  
  // Clear server logs
  const requestOptions = {
    hostname: 'localhost',
    port: 8000, // Assuming your server runs on port 8000
    path: '/api/v1/logs',
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'X-Test-Mode': 'true', // Add a header to indicate this is a test cleanup request
    },
  };

  const clientReq = http.request(requestOptions, (clientRes) => {
    if (clientRes.statusCode !== 200) {
      console.error(`[RESET_TEST_STATE] Failed to clear logs, status: ${clientRes.statusCode}`);
    } else {
      console.debug(`[RESET_TEST_STATE] Server logs cleared successfully.`);
    }
  });

  clientReq.on('error', (e) => {
    console.error(`[RESET_TEST_STATE] Error clearing logs: ${e.message}`);
  });
  clientReq.end();
};

module.exports = {
  testUsers,
  nextUserId,
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
  },
  nextDataId,
  updateNextDataId: () => {
    return nextDataId++;
  },
  testData,
  resetTestState // Export the new function
};
