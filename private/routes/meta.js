const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { ACTIVE_TESTS_RUNNING, updateActiveTestsRunning, getHealthChecks } = require("../utils/endpointUtils");
const child_process = require("child_process");
const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");

router.get("/api/v1/hello", isAuthenticated, (req, res) => {
  res.json({ message: "here da data." });
  
});

router.get("/api/v1/health", isAuthenticated, (req, res) => {
  res.json({ status: "online", timestamp: new Date().toISOString() });
  
});

router.get("/api/v1/health/full", isAuthenticated, async (req, res) => {
  const healthStatus = await getHealthChecks();
  res.json(healthStatus);
});

router.get("/api/v1/meta/active-tests", isAuthenticated, (req, res) => {
  console.debug(`[DEBUG_CONFIRM] Current active tests: ${ACTIVE_TESTS_RUNNING}`); 
  res.json({ active: ACTIVE_TESTS_RUNNING });
});

router.post("/api/v1/meta/active-tests", isAuthenticated, (req, res) => {
  const delta = parseInt((req.body && req.body.delta) ?? 0, 10);
  if (Number.isNaN(delta) || delta === 0) {
    return res.status(400).json({ error: "delta must be a non-zero integer" });
  }
  const updatedActiveTests = updateActiveTestsRunning(delta);
  res.json({ active: updatedActiveTests });
});

router.get("/api/v1/meta/test-error", isAuthenticated, (req, res, next) => {
  try {
    throw new Error("This is a test error from /api/v1/meta/test-error");
  } catch (error) {
    console.error.os(error.message); 
    res.status(500).json({ error: error.message });
  }
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

module.exports = router;
