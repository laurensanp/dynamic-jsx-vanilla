const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { updateNextDataId, testData } = require("../utils/endpointUtils");
const ServerDataSettings = require("../settings/serverDataSettings");

router.get(
  ServerDataSettings.DATA_BASE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} GET called by ${
          req.userIp || "unknown IP"
        }`
      );
    try {
      res.json(testData);
      if (console.log && console.log.api)
        console.log.api(`user: ${req.userIp} requested test data`);
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} GET: ${e.stack}`
        );
      if (console.warn && console.warn.api)
        console.warn.api(
          `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} GET: failed to return test data`
        );
      res
        .status(500)
        .json({ error: ServerDataSettings.DATA_GET_ERROR_MESSAGE });
    }
  }
);

router.delete(
  ServerDataSettings.DATA_ID_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} DELETE called by ${
          req.userIp || "unknown IP"
        }`
      );
    const dataId = parseInt(req.params.id, 10);
    const dataIndex = testData.records.findIndex((d) => d.id === dataId);

    if (dataIndex !== -1) {
      try {
        const deletedData = testData.records.splice(dataIndex, 1)[0];
        if (console.log && console.log.api)
          console.log.api(`user: ${req.userIp} deleted data record ${dataId}`);
        res.json({
          message: ServerDataSettings.DATA_DELETED_SUCCESS_MESSAGE,
          data: deletedData,
        });
      } catch (e) {
        if (console.error && console.error.api)
          console.error.api(
            `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} DELETE: ${e.stack}`
          );
        if (console.warn && console.warn.api)
          console.warn.api(
            `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} DELETE: failed to delete data`
          );
        res
          .status(500)
          .json({ error: ServerDataSettings.DATA_DELETE_ERROR_MESSAGE });
      }
    } else {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[WARN] ${ServerDataSettings.DATA_ID_ENDPOINT} DELETE data not found: ${dataId}`
        );
      res
        .status(404)
        .json({ error: ServerDataSettings.DATA_RECORD_NOT_FOUND_MESSAGE });
    }
  }
);

router.post(
  ServerDataSettings.DATA_BASE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} POST called by ${
          req.userIp || "unknown IP"
        } with body: ${JSON.stringify(req.body)}`
      );
    const { value, content } = req.body;

    if (!value && !content) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[WARN] ${
            ServerDataSettings.DATA_BASE_ENDPOINT
          } POST missing value or content: ${JSON.stringify(req.body)}`
        );
      return res
        .status(400)
        .json({
          error: ServerDataSettings.DATA_VALUE_CONTENT_REQUIRED_MESSAGE,
        });
    }

    try {
      const newData = { id: updateNextDataId(), value, content };
      testData.records.push(newData);
      if (console.log && console.log.api)
        console.log.api(
          `user: ${req.userIp} created new data record with id ${newData.id}`
        );
      res
        .status(201)
        .json({
          message: ServerDataSettings.DATA_CREATED_SUCCESS_MESSAGE,
          data: newData,
        });
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} POST: ${e.stack}`
        );
      if (console.warn && console.warn.api)
        console.warn.api(
          `[DATA] ${ServerDataSettings.DATA_BASE_ENDPOINT} POST: failed to create data`
        );
      res
        .status(500)
        .json({ error: ServerDataSettings.DATA_CREATE_ERROR_MESSAGE });
    }
  }
);

router.put(ServerDataSettings.DATA_ID_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug)
    console.debug(
      `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} PUT called by ${
        req.userIp || "unknown IP"
      } with body: ${JSON.stringify(req.body)}`
    );
  const dataId = parseInt(req.params.id, 10);
  const { value, content } = req.body;

  const dataIndex = testData.records.findIndex((d) => d.id === dataId);

  if (dataIndex !== -1) {
    try {
      testData.records[dataIndex] = {
        ...testData.records[dataIndex],
        value,
        content,
      };
      if (console.log && console.log.api)
        console.log.api(`user: ${req.userIp} updated data record ${dataId}`);
      res.json({
        message: ServerDataSettings.DATA_UPDATED_SUCCESS_MESSAGE,
        data: testData.records[dataIndex],
      });
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} PUT: ${e.stack}`
        );
      if (console.warn && console.warn.api)
        console.warn.api(
          `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} PUT: failed to update data`
        );
      res
        .status(500)
        .json({ error: ServerDataSettings.DATA_UPDATE_ERROR_MESSAGE });
    }
  } else {
    if (console.warn && console.warn.api)
      console.warn.api(
        `[WARN] ${ServerDataSettings.DATA_ID_ENDPOINT} PUT data not found: ${dataId}`
      );
    res
      .status(404)
      .json({ error: ServerDataSettings.DATA_RECORD_NOT_FOUND_MESSAGE });
  }
});

router.get(ServerDataSettings.DATA_ID_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug)
    console.debug(
      `[DATA] ${ServerDataSettings.DATA_ID_ENDPOINT} GET called by ${
        req.userIp || "unknown IP"
      }`
    );
  const dataId = parseInt(req.params.id, 10);
  const data = testData.records.find((d) => d.id === dataId);

  if (data) {
    res.json({ data });
    if (console.log && console.log.api)
      console.log.api(`user: ${req.userIp} requested data record ${dataId}`);
  } else {
    if (console.warn && console.warn.api)
      console.warn.api(
        `[WARN] ${ServerDataSettings.DATA_ID_ENDPOINT} GET data not found: ${dataId}`
      );
    res
      .status(404)
      .json({ error: ServerDataSettings.DATA_RECORD_NOT_FOUND_MESSAGE });
  }
});

module.exports = router;
