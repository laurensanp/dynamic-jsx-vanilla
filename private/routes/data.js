const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { updateNextDataId, testData } = require("../utils/endpointUtils");

router.get("/api/v1/data", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[DATA] /api/v1/data GET called by ${req.userIp || "unknown IP"}`);
  try {
    res.json(testData);
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested test data`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[DATA] /api/v1/data GET: ${e.stack}`);
    if (console.warn && console.warn.api) console.warn.api(`[DATA] /api/v1/data GET: failed to return test data`);
    res.status(500).json({ error: "Failed to get test data" });
  }
});

router.delete("/api/v1/data/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[DATA] /api/v1/data/:id DELETE called by ${req.userIp || "unknown IP"}`);
  const dataId = parseInt(req.params.id, 10);
  const dataIndex = testData.records.findIndex(d => d.id === dataId);

  if (dataIndex !== -1) {
    try {
      const deletedData = testData.records.splice(dataIndex, 1)[0];
      if (console.log && console.log.api) console.log.api(`user: ${req.userIp} deleted data record ${dataId}`);
      res.json({ message: "Data deleted successfully", data: deletedData });
    } catch (e) {
      if (console.error && console.error.api) console.error.api(`[DATA] /api/v1/data/:id DELETE: ${e.stack}`);
      if (console.warn && console.warn.api) console.warn.api(`[DATA] /api/v1/data/:id DELETE: failed to delete data`);
      res.status(500).json({ error: "Failed to delete data" });
    }
  } else {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/data/:id DELETE data not found: ${dataId}`);
    res.status(404).json({ error: "Data record not found" });
  }
});

router.post("/api/v1/data", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[DATA] /api/v1/data POST called by ${req.userIp || "unknown IP"} with body: ${JSON.stringify(req.body)}`);
  const { value, content } = req.body;

  if (!value && !content) {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/data POST missing value or content: ${JSON.stringify(req.body)}`);
    return res.status(400).json({ error: "Value or content is required" });
  }

  try {
    const newData = { id: updateNextDataId(), value, content };
    testData.records.push(newData);
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} created new data record with id ${newData.id}`);
    res.status(201).json({ message: "Data created successfully", data: newData });
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[DATA] /api/v1/data POST: ${e.stack}`);
    if (console.warn && console.warn.api) console.warn.api(`[DATA] /api/v1/data POST: failed to create data`);
    res.status(500).json({ error: "Failed to create data" });
  }
});

router.put("/api/v1/data/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[DATA] /api/v1/data/:id PUT called by ${req.userIp || "unknown IP"} with body: ${JSON.stringify(req.body)}`);
  const dataId = parseInt(req.params.id, 10);
  const { value, content } = req.body;

  const dataIndex = testData.records.findIndex(d => d.id === dataId);

  if (dataIndex !== -1) {
    try {
      testData.records[dataIndex] = { ...testData.records[dataIndex], value, content };
      if (console.log && console.log.api) console.log.api(`user: ${req.userIp} updated data record ${dataId}`);
      res.json({ message: "Data updated successfully", data: testData.records[dataIndex] });
    } catch (e) {
      if (console.error && console.error.api) console.error.api(`[DATA] /api/v1/data PUT: ${e.stack}`);
      if (console.warn && console.warn.api) console.warn.api(`[DATA] /api/v1/data PUT: failed to update data`);
      res.status(500).json({ error: "Failed to update data" });
    }
  } else {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/data/:id PUT data not found: ${dataId}`);
    res.status(404).json({ error: "Data record not found" });
  }
});

router.get("/api/v1/data/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[DATA] /api/v1/data/:id GET called by ${req.userIp || "unknown IP"}`);
  const dataId = parseInt(req.params.id, 10);
  const data = testData.records.find(d => d.id === dataId);

  if (data) {
    res.json({ data });
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested data record ${dataId}`);
  } else {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/data/:id GET data not found: ${dataId}`);
    res.status(404).json({ error: "Data record not found" });
  }
});

module.exports = router;
