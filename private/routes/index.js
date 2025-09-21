const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { isAuthenticated } = require("../middleware/auth");
const { LOG_FILE } = require("../utils/logger");
require("../utils/logger");
const child_process = require("child_process");
const cache = require("../utils/cache");


let ACTIVE_TESTS_RUNNING = 0;


function listRouterEndpoints(r) {
  const endpoints = [];
  const stack = r.stack || [];
  stack.forEach(layer => {
    if (layer.route && layer.route.path) {
      const path = layer.route.path;
      const methods = Object.keys(layer.route.methods || {}).filter(m => layer.route.methods[m]);
      methods.forEach(m => endpoints.push({ method: m.toUpperCase(), path }));
    } else if (layer.name === 'router' && layer.handle && layer.handle.stack) {
      
      layer.handle.stack.forEach(nested => {
        if (nested.route && nested.route.path) {
          const path = nested.route.path;
          const methods = Object.keys(nested.route.methods || {}).filter(m => nested.route.methods[m]);
          methods.forEach(m => endpoints.push({ method: m.toUpperCase(), path }));
        }
      });
    }
  });
  
  return endpoints.filter(ep => ep.path.startsWith('/api/'))
                  .filter(ep => !ep.path.startsWith('/api/v1/meta'));
}

router.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
});

router.get("/api/v1/login", (req, res) => {
  res.cookie("authenticated", "true");
  console.log.user(`user: ${req.userIp} logged in.`);
  res.redirect("/");
});

router.get("/api/v1/logout", isAuthenticated, (req, res) => {
  res.clearCookie("authenticated");
  console.log.user(`user: ${req.userIp} logged out.`);
  res.redirect("/");
});

router.get("/api/v1/hello", isAuthenticated, (req, res) => {
  res.json({ message: "here da data." });
  
});


router.get("/api/v1/health", isAuthenticated, (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
  
});

// Aggregated health check for dashboard
router.get("/api/v1/health/full", isAuthenticated, async (req, res) => {
  // api check: server responds
  const api = { ok: true, message: "API responding" };

  // database check: we don't have a real DB; verify in-memory fixtures exist
  let database = { ok: false, message: "Unavailable" };
  try {
    const hasUsers = Array.isArray(testUsers);
    database = hasUsers
      ? { ok: true, message: `In-memory data available (${testUsers.length} users)` }
      : { ok: false, message: "In-memory data missing" };
  } catch (e) {
    database = { ok: false, message: e.message };
  }

  // cache check: use in-memory cache ping
  let cacheCheck = { ok: false, message: "Cache ping failed" };
  try {
    const ok = await cache.ping();
    cacheCheck = ok ? { ok: true, message: "Cache OK" } : { ok: false, message: "Cache ping failed" };
  } catch (e) {
    cacheCheck = { ok: false, message: e.message };
  }

  // monitoring check: verify log file is readable
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

  res.json({ status: overall, checks, timestamp: new Date().toISOString() });
});


router.get("/api/v1/meta/endpoints", isAuthenticated, (req, res) => {
  const endpoints = listRouterEndpoints(router);
  res.json({ count: endpoints.length, endpoints });
});

router.get("/api/v1/meta/active-tests", isAuthenticated, (req, res) => {
  res.json({ active: ACTIVE_TESTS_RUNNING });
});

router.post("/api/v1/meta/active-tests", isAuthenticated, (req, res) => {
  const delta = parseInt((req.body && req.body.delta) ?? 0, 10);
  if (Number.isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: "delta must be a non-zero integer" });
  }
  ACTIVE_TESTS_RUNNING = Math.max(0, ACTIVE_TESTS_RUNNING + delta);
  res.json({ active: ACTIVE_TESTS_RUNNING });
});

router.get("/api/v1/shut", isAuthenticated, (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isTestCall = req.headers['x-test-mode'] === 'true';
  
  
  if (isTestCall) {
    res.json({ message: "shutdown test successful - system would shut down in production.", testMode: true });
    console.log.api(`user: ${req.userIp} tested shutdown endpoint (test mode).`);
    return;
  }
  
  
  res.json({ message: "shutdown initiated." });
  console.log.api(`user: ${req.userIp} requested shutdown.`);
  
  
  setTimeout(() => {
    child_process.exec("shutdown /s /t 5", (error, stdout, stderr) => {
      if (error) {
        console.error.shutdown(`Error: ${error.message}`);
        return;
      }
      console.log.shutdown(`Shutdown initiated - system will shut down in 5 seconds`);
    });
  }, 1000); 
});

router.get("/api/v1/logs", isAuthenticated, (req, res) => {
  const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
  res.json({ logs: logs });
});

let testUsers = [
  { id: 1, name: "John Doe", email: "john@example.com" },
  { id: 2, name: "Jane Smith", email: "jane@example.com" }
];
let nextUserId = 3;


router.get("/api/v1/users", isAuthenticated, (req, res) => {
  res.json({ users: testUsers, count: testUsers.length });
  console.log.api(`user: ${req.userIp} requested users list.`);
});


router.post("/api/v1/users", isAuthenticated, (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  
  const newUser = {
    id: nextUserId++,
    name,
    email
  };
  
  testUsers.push(newUser);
  res.status(201).json({ user: newUser, message: "User created successfully" });
  console.log.api(`user: ${req.userIp} created user: ${name}`);
});


router.get("/api/v1/users/:id", isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = testUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({ user });
  console.log.api(`user: ${req.userIp} requested user ${userId}`);
});


router.delete("/api/v1/users/:id", isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = testUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const deletedUser = testUsers.splice(userIndex, 1)[0];
  res.json({ user: deletedUser, message: "User deleted successfully" });
  console.log.api(`user: ${req.userIp} deleted user ${userId}`);
});


router.post("/api/v1/auth", isAuthenticated, (req, res) => {
  const { username, password } = req.body;
  
  
  if (username === "test" && password === "password") {
    res.json({ success: true, message: "Authentication successful", token: "test-token-123" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  
  console.log.api(`user: ${req.userIp} attempted authentication as ${username}`);
});


let testData = {
  records: [
    { id: 1, value: "test data 1" },
    { id: 2, value: "test data 2" }
  ]
};


router.get("/api/v1/data", isAuthenticated, (req, res) => {
  res.json(testData);
  console.log.api(`user: ${req.userIp} requested test data`);
});


router.delete("/api/v1/data", isAuthenticated, (req, res) => {
  const recordCount = testData.records.length;
  testData.records = [];
  res.json({ message: `Cleared ${recordCount} records`, previousCount: recordCount });
  console.log.api(`user: ${req.userIp} cleared test data`);
});

module.exports = router;
