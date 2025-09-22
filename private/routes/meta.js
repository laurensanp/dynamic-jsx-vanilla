const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { ACTIVE_TESTS_RUNNING, updateActiveTestsRunning, getHealthChecks, resetTestState } = require("../utils/endpointUtils");
const child_process = require("child_process");
const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const { resetLoginAttempts } = require("../utils/authUtils");
const http = require("http"); // Import http module

const BRUTE_FORCE_ATTEMPTS = 5; // Define BRUTE_FORCE_ATTEMPTS here

router.get("/api/v1/hello", isAuthenticated, (req, res) => {
  res.json({ message: "here da data." });
});

router.get("/api/v1/health", isAuthenticated, (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
});

router.get("/api/v1/health/full", isAuthenticated, async (req, res) => {
  try {
    const healthStatus = await getHealthChecks();
    res.json(healthStatus);
  } catch (e) {
    if (console.warn && console.warn.api) console.warn.api(`[HEALTH_FULL] /api/v1/health/full error: ${e.message}`);
    res.status(500).json({ error: "Failed to get full health status" });
  }
});


router.post("/api/v1/meta/reset-login-attempts", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[META] /api/v1/meta/reset-login-attempts POST called by ${req.userIp || "unknown IP"}`);
  const { targetIp } = req.body;
  resetLoginAttempts(targetIp || null); // Reset for specific IP or all
  res.json({ message: "Login attempts reset successfully" });
});

router.post("/api/v1/meta/reset-test-state", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[META] /api/v1/meta/reset-test-state POST called by ${req.userIp || "unknown IP"}`);
  resetTestState();
  res.json({ message: "Test state reset successfully" });
});

router.post("/api/v1/meta/run-brute-force-test", isAuthenticated, async (req, res) => {
  if (console.debug) console.debug(`[META] /api/v1/meta/run-brute-force-test POST called by ${req.userIp || "unknown IP"}`);
  try {
    const promises = [];
    for (let i = 0; i < BRUTE_FORCE_ATTEMPTS; i++) {
      promises.push(new Promise((resolve, reject) => {
        const postData = JSON.stringify({ username: 'invalid_user', password: 'wrong_password' });
        const requestOptions = {
          hostname: 'localhost',
          port: 8000,
          path: '/api/v1/auth',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(postData)
          }
        };

        const clientReq = http.request(requestOptions, (clientRes) => {
          let responseBody = '';
          clientRes.on('data', (chunk) => { responseBody += chunk; });
          clientRes.on('end', () => {
            resolve({ status: clientRes.statusCode, data: responseBody });
          });
        });

        clientReq.on('error', (e) => { reject(e); });
        clientReq.write(postData);
        clientReq.end();
      }));
    }

    const responses = await Promise.all(promises);
    const failedCount = responses.filter(r => r.status === 401).length;

    res.json({
      success: failedCount === BRUTE_FORCE_ATTEMPTS,
      failedCount,
      totalAttempts: BRUTE_FORCE_ATTEMPTS,
      message: `${failedCount}/${BRUTE_FORCE_ATTEMPTS} Anfragen führten zu erwartetem 401 Unauthorized/Ratelimit`
    });
  } catch (error) {
    console.error(`[META] /api/v1/meta/run-brute-force-test error: ${error.message}`);
    res.status(500).json({ error: "Failed to run brute-force test server-side" });
  }
});

router.get("/api/v1/meta/log-size", isAuthenticated, (req, res) => {
  try {
    const stats = fs.statSync(LOG_FILE);
    res.json({ size: stats.size });
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[META] /api/v1/meta/log-size GET: ${e.stack}`);
    res.status(500).json({ error: "Failed to get log file size" });
  }
});

const { testUsers } = require("../utils/endpointUtils"); // Import testUsers
const { testData } = require("../utils/endpointUtils"); // Import testData

router.post("/api/v1/meta/cleanup-user/:id", isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    testUsers.splice(userIndex, 1);
    res.json({ message: `User ${userId} cleaned up successfully.` });
  } else {
    res.status(200).json({ message: `User ${userId} not found, already cleaned up or never existed.` });
  }
});

router.post("/api/v1/meta/cleanup-data/:id", isAuthenticated, (req, res) => {
  const dataId = parseInt(req.params.id, 10);
  const dataIndex = testData.records.findIndex(d => d.id === dataId);

  if (dataIndex !== -1) {
    testData.records.splice(dataIndex, 1);
    res.json({ message: `Data ${dataId} cleaned up successfully.` });
  } else {
    res.status(200).json({ message: `Data ${dataId} not found, already cleaned up or never existed.` });
  }
});

router.get("/api/v1/meta/test-error", isAuthenticated, (req, res, next) => {
  if (console.debug) console.debug(`[META] /api/v1/meta/test-error triggered by ${req.userIp || "unknown IP"}`);
  try {
    throw new Error("This is a test error from /api/v1/meta/test-error");
  } catch (error) {
    if (console.error && console.error.os) console.error.os(`/api/v1/meta/test-error: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.get("/api/v1/shut", isAuthenticated, (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isTestCall = req.headers['x-test-mode'] === 'true';

  if (console.debug) console.debug(`[SHUT] /api/v1/shut called by ${req.userIp || "unknown IP"} (User-Agent: ${userAgent})${isTestCall ? " [TEST MODE]" : ""}`);

  if (isTestCall) {
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} tested shutdown endpoint (test mode).`);
    if (console.debug) console.debug(`[SHUT] /api/v1/shut test mode - no shutdown performed`);
    res.json({ message: "shutdown test successful - system would shut down in production.", testMode: true });
    return;
  }

  if (console.warn && console.warn.api) console.warn.api(`[SHUT] /api/v1/shut: shutdown initiated by ${req.userIp || "unknown IP"}`);
  res.json({ message: "shutdown initiated." });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested shutdown.`);

  setTimeout(() => {
    child_process.exec("shutdown /s /t 5", (error, stdout, stderr) => {
      if (error) {
        if (console.error && console.error.shutdown) console.error.shutdown(`Error: ${error.message}`);
        if (console.warn && console.warn.shutdown) console.warn.shutdown(`[SHUT] Shutdown command failed: ${error.message}`);
        return;
      }
      if (console.log && console.log.shutdown) console.log.shutdown(`Shutdown initiated - system will shut down in 5 seconds`);
    });
  }, 1000); 
});

router.get("/api/v1/logs", isAuthenticated, (req, res) => {
  try {
    const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
    res.json({ logs: logs });
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[LOGS] /api/v1/logs: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[LOGS] /api/v1/logs: failed to read logs`);
    res.status(500).json({ error: "Failed to read logs" });
  }
});

router.delete("/api/v1/logs", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[LOGS] /api/v1/logs DELETE called by ${req.userIp || "unknown IP"}`);
  try {
    fs.writeFileSync(LOG_FILE, '');
    res.json({ message: "Log file cleared successfully" });
    if (console.warn && console.warn.api) console.warn.api(`[LOGS] /api/v1/logs DELETE: log file cleared by ${req.userIp}${req.headers['x-test-mode'] === 'true' ? " (test mode)" : ""}`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[LOGS] /api/v1/logs DELETE: ${e.message}`);
    res.status(500).json({ error: "Failed to clear log file" });
  }
});

module.exports = router;
