const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { ACTIVE_TESTS_RUNNING, updateActiveTestsRunning, getHealthChecks, resetTestState } = require("../utils/endpointUtils");
const child_process = require("child_process");
const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const { resetLoginAttempts } = require("../utils/authUtils");
const http = require("http"); // Import http module
const { HELLO_ENDPOINT, HEALTH_ENDPOINT, HEALTH_FULL_ENDPOINT, RESET_LOGIN_ATTEMPTS_ENDPOINT, RESET_TEST_STATE_ENDPOINT, RUN_BRUTE_FORCE_TEST_ENDPOINT, LOG_SIZE_ENDPOINT, CLEANUP_USER_ENDPOINT, CLEANUP_DATA_ENDPOINT, TEST_ERROR_ENDPOINT, SHUTDOWN_ENDPOINT, LOGS_ENDPOINT, HELLO_MESSAGE, HEALTH_STATUS_MESSAGE, HEALTH_FULL_ERROR_MESSAGE, RESET_LOGIN_ATTEMPTS_MESSAGE, RESET_TEST_STATE_MESSAGE, BRUTE_FORCE_FAILED_MESSAGE, LOG_SIZE_ERROR_MESSAGE, USER_CLEANUP_SUCCESS_MESSAGE, USER_CLEANUP_NOT_FOUND_MESSAGE, DATA_CLEANUP_SUCCESS_MESSAGE, DATA_CLEANUP_NOT_FOUND_MESSAGE, TEST_ERROR_MESSAGE, SHUTDOWN_TEST_SUCCESS_MESSAGE, SHUTDOWN_INITIATED_MESSAGE, SHUTDOWN_COMMAND_FAILED_MESSAGE, SHUTDOWN_INITIATED_LOG_MESSAGE, LOG_READ_ERROR_MESSAGE, LOG_CLEAR_SUCCESS_MESSAGE, LOG_CLEAR_ERROR_MESSAGE, BRUTE_FORCE_ATTEMPTS_COUNT, BRUTE_FORCE_USERNAME, BRUTE_FORCE_PASSWORD, BRUTE_FORCE_HOSTNAME, BRUTE_FORCE_PORT, BRUTE_FORCE_AUTH_PATH, BRUTE_FORCE_UNAUTHORIZED_STATUS, SHUTDOWN_COMMAND, SHUTDOWN_DELAY_MS } = require("../settings/serverMetaSettings");

const BRUTE_FORCE_ATTEMPTS = BRUTE_FORCE_ATTEMPTS_COUNT;

router.get(HELLO_ENDPOINT, isAuthenticated, (req, res) => {
  res.json({ message: HELLO_MESSAGE });
});

router.get(HEALTH_ENDPOINT, isAuthenticated, (req, res) => {
  res.json({ status: HEALTH_STATUS_MESSAGE, timestamp: new Date().toISOString() });
});

router.get(HEALTH_FULL_ENDPOINT, isAuthenticated, async (req, res) => {
  try {
    const healthStatus = await getHealthChecks();
    res.json(healthStatus);
  } catch (e) {
    if (console.warn && console.warn.api) console.warn.api(`[HEALTH_FULL] ${HEALTH_FULL_ENDPOINT} error: ${e.message}`);
    res.status(500).json({ error: HEALTH_FULL_ERROR_MESSAGE });
  }
});


router.post(RESET_LOGIN_ATTEMPTS_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[META] ${RESET_LOGIN_ATTEMPTS_ENDPOINT} POST called by ${req.userIp || "unknown IP"}`);
  const { targetIp } = req.body;
  resetLoginAttempts(targetIp || null); // Reset for specific IP or all
  res.json({ message: RESET_LOGIN_ATTEMPTS_MESSAGE });
});

router.post(RESET_TEST_STATE_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[META] ${RESET_TEST_STATE_ENDPOINT} POST called by ${req.userIp || "unknown IP"}`);
  resetTestState();
  res.json({ message: RESET_TEST_STATE_MESSAGE });
});

router.post(RUN_BRUTE_FORCE_TEST_ENDPOINT, isAuthenticated, async (req, res) => {
  if (console.debug) console.debug(`[META] ${RUN_BRUTE_FORCE_TEST_ENDPOINT} POST called by ${req.userIp || "unknown IP"}`);
  try {
    const promises = [];
    for (let i = 0; i < BRUTE_FORCE_ATTEMPTS_COUNT; i++) {
      promises.push(new Promise((resolve, reject) => {
        const postData = JSON.stringify({ username: BRUTE_FORCE_USERNAME, password: BRUTE_FORCE_PASSWORD });
        const requestOptions = {
          hostname: BRUTE_FORCE_HOSTNAME,
          port: BRUTE_FORCE_PORT,
          path: BRUTE_FORCE_AUTH_PATH,
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
    const failedCount = responses.filter(r => r.status === BRUTE_FORCE_UNAUTHORIZED_STATUS).length;

    res.json({
      success: failedCount === BRUTE_FORCE_ATTEMPTS_COUNT,
      failedCount,
      totalAttempts: BRUTE_FORCE_ATTEMPTS_COUNT,
      message: `${failedCount}/${BRUTE_FORCE_ATTEMPTS_COUNT} Anfragen führten zu erwartetem 401 Unauthorized/Ratelimit`
    });
  } catch (error) {
    console.error(`[META] ${RUN_BRUTE_FORCE_TEST_ENDPOINT} error: ${error.message}`);
    res.status(500).json({ error: BRUTE_FORCE_FAILED_MESSAGE });
  }
});

router.get(LOG_SIZE_ENDPOINT, isAuthenticated, (req, res) => {
  try {
    const stats = fs.statSync(LOG_FILE);
    res.json({ size: stats.size });
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[META] ${LOG_SIZE_ENDPOINT} GET: ${e.stack}`);
    res.status(500).json({ error: LOG_SIZE_ERROR_MESSAGE });
  }
});

const { testUsers } = require("../utils/endpointUtils"); // Import testUsers
const { testData } = require("../utils/endpointUtils"); // Import testData

router.post(CLEANUP_USER_ENDPOINT, isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id, 10);
  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex !== -1) {
    testUsers.splice(userIndex, 1);
    res.json({ message: USER_CLEANUP_SUCCESS_MESSAGE(userId) });
  } else {
    res.status(200).json({ message: USER_CLEANUP_NOT_FOUND_MESSAGE(userId) });
  }
});

router.post(CLEANUP_DATA_ENDPOINT, isAuthenticated, (req, res) => {
  const dataId = parseInt(req.params.id, 10);
  const dataIndex = testData.records.findIndex(d => d.id === dataId);

  if (dataIndex !== -1) {
    testData.records.splice(dataIndex, 1);
    res.json({ message: DATA_CLEANUP_SUCCESS_MESSAGE(dataId) });
  } else {
    res.status(200).json({ message: DATA_CLEANUP_NOT_FOUND_MESSAGE(dataId) });
  }
});

router.get(TEST_ERROR_ENDPOINT, isAuthenticated, (req, res, next) => {
  if (console.debug) console.debug(`[META] ${TEST_ERROR_ENDPOINT} triggered by ${req.userIp || "unknown IP"}`);
  try {
    throw new Error(TEST_ERROR_MESSAGE);
  } catch (error) {
    if (console.error && console.error.os) console.error.os(`${TEST_ERROR_ENDPOINT}: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
});

router.post(SHUTDOWN_ENDPOINT, isAuthenticated, (req, res) => {
  const userAgent = req.headers['user-agent'] || '';
  const isTestCall = req.headers['x-test-mode'] === 'true';

  if (console.debug) console.debug(`[SHUT] ${SHUTDOWN_ENDPOINT} called by ${req.userIp || "unknown IP"} (User-Agent: ${userAgent})${isTestCall ? " [TEST MODE]" : ""}`);

  if (isTestCall) {
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} tested shutdown endpoint (test mode).`);
    if (console.debug) console.debug(`[SHUT] ${SHUTDOWN_ENDPOINT} test mode - no shutdown performed`);
    res.json({ message: SHUTDOWN_TEST_SUCCESS_MESSAGE, testMode: true });
    return;
  }

  if (console.warn && console.warn.api) console.warn.api(`[SHUT] ${SHUTDOWN_ENDPOINT}: shutdown initiated by ${req.userIp || "unknown IP"}`);
  res.json({ message: SHUTDOWN_INITIATED_MESSAGE });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested shutdown.`);

  setTimeout(() => {
    child_process.exec(SHUTDOWN_COMMAND, (error, stdout, stderr) => {
      if (error) {
        if (console.error && console.error.shutdown) console.error.shutdown(`Error: ${error.message}`);
        if (console.warn && console.warn.shutdown) console.warn.shutdown(`[SHUT] Shutdown command failed: ${error.message}`);
        return;
      }
      if (console.log && console.log.shutdown) console.log.shutdown(SHUTDOWN_INITIATED_LOG_MESSAGE);
    });
  }, SHUTDOWN_DELAY_MS);
});

router.get(LOGS_ENDPOINT, isAuthenticated, (req, res) => {
  try {
    const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
    res.json({ logs: logs });
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[LOGS] ${LOGS_ENDPOINT}: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[LOGS] ${LOGS_ENDPOINT}: failed to read logs`);
    res.status(500).json({ error: LOG_READ_ERROR_MESSAGE });
  }
});

router.delete(LOGS_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[LOGS] ${LOGS_ENDPOINT} DELETE called by ${req.userIp || "unknown IP"}`);
  try {
    fs.writeFileSync(LOG_FILE, '');
    res.json({ message: LOG_CLEAR_SUCCESS_MESSAGE });
    if (console.warn && console.warn.api) console.warn.api(`[LOGS] ${LOGS_ENDPOINT} DELETE: log file cleared by ${req.userIp}${req.headers['x-test-mode'] === 'true' ? " (test mode)" : ""}`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[LOGS] ${LOGS_ENDPOINT} DELETE: ${e.message}`);
    res.status(500).json({ error: LOG_CLEAR_ERROR_MESSAGE });
  }
});

module.exports = router;
