const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  ACTIVE_TESTS_RUNNING,
  updateActiveTestsRunning,
  getHealthChecks,
  resetTestState,
} = require("../utils/endpointUtils");
const child_process = require("child_process");
const fs = require("fs");
const { LOG_FILE } = require("../utils/logger");
const { resetLoginAttempts } = require("../utils/authUtils");
const http = require("http");
const ServerMetaSettings = require("../settings/serverMetaSettings");

const BRUTE_FORCE_ATTEMPTS = ServerMetaSettings.BRUTE_FORCE_ATTEMPTS_COUNT;

router.get(ServerMetaSettings.HELLO_ENDPOINT, isAuthenticated, (req, res) => {
  res.json({ message: ServerMetaSettings.HELLO_MESSAGE });
});

router.get(ServerMetaSettings.HEALTH_ENDPOINT, isAuthenticated, (req, res) => {
  res.json({
    status: ServerMetaSettings.HEALTH_STATUS_MESSAGE,
    timestamp: new Date().toISOString(),
  });
});

router.get(
  ServerMetaSettings.HEALTH_FULL_ENDPOINT,
  isAuthenticated,
  async (req, res) => {
    try {
      const healthStatus = await getHealthChecks();
      res.json(healthStatus);
    } catch (e) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[HEALTH_FULL] ${ServerMetaSettings.HEALTH_FULL_ENDPOINT} error: ${e.message}`
        );
      res
        .status(500)
        .json({ error: ServerMetaSettings.HEALTH_FULL_ERROR_MESSAGE });
    }
  }
);

router.post(
  ServerMetaSettings.RESET_LOGIN_ATTEMPTS_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[META] ${
          ServerMetaSettings.RESET_LOGIN_ATTEMPTS_ENDPOINT
        } POST called by ${req.userIp || "unknown IP"}`
      );
    const { targetIp } = req.body;
    resetLoginAttempts(targetIp || null);
    res.json({ message: ServerMetaSettings.RESET_LOGIN_ATTEMPTS_MESSAGE });
  }
);

router.post(
  ServerMetaSettings.RESET_TEST_STATE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[META] ${
          ServerMetaSettings.RESET_TEST_STATE_ENDPOINT
        } POST called by ${req.userIp || "unknown IP"}`
      );
    resetTestState();
    res.json({ message: ServerMetaSettings.RESET_TEST_STATE_MESSAGE });
  }
);

router.post(
  ServerMetaSettings.RUN_BRUTE_FORCE_TEST_ENDPOINT,
  isAuthenticated,
  async (req, res) => {
    if (console.debug)
      console.debug(
        `[META] ${
          ServerMetaSettings.RUN_BRUTE_FORCE_TEST_ENDPOINT
        } POST called by ${req.userIp || "unknown IP"}`
      );
    try {
      const promises = [];
      for (let i = 0; i < ServerMetaSettings.BRUTE_FORCE_ATTEMPTS_COUNT; i++) {
        promises.push(
          new Promise((resolve, reject) => {
            const postData = JSON.stringify({
              username: ServerMetaSettings.BRUTE_FORCE_USERNAME,
              password: ServerMetaSettings.BRUTE_FORCE_PASSWORD,
            });
            const requestOptions = {
              hostname: ServerMetaSettings.BRUTE_FORCE_HOSTNAME,
              port: ServerMetaSettings.BRUTE_FORCE_PORT,
              path: ServerMetaSettings.BRUTE_FORCE_AUTH_PATH,
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
              },
            };

            const clientReq = http.request(requestOptions, (clientRes) => {
              let responseBody = "";
              clientRes.on("data", (chunk) => {
                responseBody += chunk;
              });
              clientRes.on("end", () => {
                resolve({ status: clientRes.statusCode, data: responseBody });
              });
            });

            clientReq.on("error", (e) => {
              reject(e);
            });
            clientReq.write(postData);
            clientReq.end();
          })
        );
      }

      const responses = await Promise.all(promises);
      const failedCount = responses.filter(
        (r) => r.status === ServerMetaSettings.BRUTE_FORCE_UNAUTHORIZED_STATUS
      ).length;

      res.json({
        success: failedCount === ServerMetaSettings.BRUTE_FORCE_ATTEMPTS_COUNT,
        failedCount,
        totalAttempts: ServerMetaSettings.BRUTE_FORCE_ATTEMPTS_COUNT,
        message: `${failedCount}/${ServerMetaSettings.BRUTE_FORCE_ATTEMPTS_COUNT} Anfragen führten zu erwartetem 401 Unauthorized/Ratelimit`,
      });
    } catch (error) {
      console.error(
        `[META] ${ServerMetaSettings.RUN_BRUTE_FORCE_TEST_ENDPOINT} error: ${error.message}`
      );
      res
        .status(500)
        .json({ error: ServerMetaSettings.BRUTE_FORCE_FAILED_MESSAGE });
    }
  }
);

router.get(
  ServerMetaSettings.LOG_SIZE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    try {
      const stats = fs.statSync(LOG_FILE);
      res.json({ size: stats.size });
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[META] ${ServerMetaSettings.LOG_SIZE_ENDPOINT} GET: ${e.stack}`
        );
      res
        .status(500)
        .json({ error: ServerMetaSettings.LOG_SIZE_ERROR_MESSAGE });
    }
  }
);

const { testUsers } = require("../utils/endpointUtils");
const { testData } = require("../utils/endpointUtils");

router.post(
  ServerMetaSettings.CLEANUP_USER_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    const userId = parseInt(req.params.id, 10);
    const userIndex = testUsers.findIndex((u) => u.id === userId);

    if (userIndex !== -1) {
      testUsers.splice(userIndex, 1);
      res.json({
        message: ServerMetaSettings.USER_CLEANUP_SUCCESS_MESSAGE(userId),
      });
    } else {
      res.status(200).json({
        message: ServerMetaSettings.USER_CLEANUP_NOT_FOUND_MESSAGE(userId),
      });
    }
  }
);

router.post(
  ServerMetaSettings.CLEANUP_DATA_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    const dataId = parseInt(req.params.id, 10);
    const dataIndex = testData.records.findIndex((d) => d.id === dataId);

    if (dataIndex !== -1) {
      testData.records.splice(dataIndex, 1);
      res.json({
        message: ServerMetaSettings.DATA_CLEANUP_SUCCESS_MESSAGE(dataId),
      });
    } else {
      res.status(200).json({
        message: ServerMetaSettings.DATA_CLEANUP_NOT_FOUND_MESSAGE(dataId),
      });
    }
  }
);

router.get(
  ServerMetaSettings.TEST_ERROR_ENDPOINT,
  isAuthenticated,
  (req, res, next) => {
    if (console.debug)
      console.debug(
        `[META] ${ServerMetaSettings.TEST_ERROR_ENDPOINT} triggered by ${
          req.userIp || "unknown IP"
        }`
      );
    try {
      throw new Error(ServerMetaSettings.TEST_ERROR_MESSAGE);
    } catch (error) {
      if (console.error && console.error.os)
        console.error.os(
          `${ServerMetaSettings.TEST_ERROR_ENDPOINT}: ${error.message}`
        );
      res.status(500).json({ error: error.message });
    }
  }
);

router.post(
  ServerMetaSettings.SHUTDOWN_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    const userAgent = req.headers["user-agent"] || "";
    const isTestCall = req.headers["x-test-mode"] === "true";

    if (console.debug)
      console.debug(
        `[SHUT] ${ServerMetaSettings.SHUTDOWN_ENDPOINT} called by ${
          req.userIp || "unknown IP"
        } (User-Agent: ${userAgent})${isTestCall ? " [TEST MODE]" : ""}`
      );

    if (isTestCall) {
      if (console.log && console.log.api)
        console.log.api(
          `user: ${req.userIp} tested shutdown endpoint (test mode).`
        );
      if (console.debug)
        console.debug(
          `[SHUT] ${ServerMetaSettings.SHUTDOWN_ENDPOINT} test mode - no shutdown performed`
        );
      res.json({
        message: ServerMetaSettings.SHUTDOWN_TEST_SUCCESS_MESSAGE,
        testMode: true,
      });
      return;
    }

    if (console.warn && console.warn.api)
      console.warn.api(
        `[SHUT] ${
          ServerMetaSettings.SHUTDOWN_ENDPOINT
        }: shutdown initiated by ${req.userIp || "unknown IP"}`
      );
    res.json({ message: ServerMetaSettings.SHUTDOWN_INITIATED_MESSAGE });
    if (console.log && console.log.api)
      console.log.api(`user: ${req.userIp} requested shutdown.`);

    setTimeout(() => {
      child_process.exec(
        ServerMetaSettings.SHUTDOWN_COMMAND,
        (error, stdout, stderr) => {
          if (error) {
            if (console.error && console.error.shutdown)
              console.error.shutdown(`Error: ${error.message}`);
            if (console.warn && console.warn.shutdown)
              console.warn.shutdown(
                `[SHUT] Shutdown command failed: ${error.message}`
              );
            return;
          }
          if (console.log && console.log.shutdown)
            console.log.shutdown(
              ServerMetaSettings.SHUTDOWN_INITIATED_LOG_MESSAGE
            );
        }
      );
    }, ServerMetaSettings.SHUTDOWN_DELAY_MS);
  }
);

router.get(ServerMetaSettings.LOGS_ENDPOINT, isAuthenticated, (req, res) => {
  try {
    const logs = fs.readFileSync(LOG_FILE, "utf8").split("\n").filter(Boolean);
    res.json({ logs: logs });
  } catch (e) {
    if (console.error && console.error.api)
      console.error.api(
        `[LOGS] ${ServerMetaSettings.LOGS_ENDPOINT}: ${e.message}`
      );
    if (console.warn && console.warn.api)
      console.warn.api(
        `[LOGS] ${ServerMetaSettings.LOGS_ENDPOINT}: failed to read logs`
      );
    res.status(500).json({ error: ServerMetaSettings.LOG_READ_ERROR_MESSAGE });
  }
});

router.delete(ServerMetaSettings.LOGS_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug)
    console.debug(
      `[LOGS] ${ServerMetaSettings.LOGS_ENDPOINT} DELETE called by ${
        req.userIp || "unknown IP"
      }`
    );
  try {
    fs.writeFileSync(LOG_FILE, "");
    res.json({ message: ServerMetaSettings.LOG_CLEAR_SUCCESS_MESSAGE });
    if (console.warn && console.warn.api)
      console.warn.api(
        `[LOGS] ${
          ServerMetaSettings.LOGS_ENDPOINT
        } DELETE: log file cleared by ${req.userIp}${
          req.headers["x-test-mode"] === "true" ? " (test mode)" : ""
        }`
      );
  } catch (e) {
    if (console.error && console.error.api)
      console.error.api(
        `[LOGS] ${ServerMetaSettings.LOGS_ENDPOINT} DELETE: ${e.message}`
      );
    res.status(500).json({ error: ServerMetaSettings.LOG_CLEAR_ERROR_MESSAGE });
  }
});

module.exports = router;
