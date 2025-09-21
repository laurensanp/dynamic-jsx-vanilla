const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { testData } = require("../utils/endpointUtils");

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
