const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { testUsers, updateNextUserId } = require("../utils/endpointUtils");
const ServerUsersSettings = require("../settings/serverUsersSettings");

router.get(
  ServerUsersSettings.USERS_BASE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT} GET called by ${
          req.userIp || "unknown IP"
        }`
      );
    try {
      res.json({ users: testUsers, count: testUsers.length });
      if (console.log && console.log.api)
        console.log.api(`user: ${req.userIp} requested users list.`);
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT}: ${e.message}`
        );
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT}: failed to return users`
        );
      res
        .status(500)
        .json({ error: ServerUsersSettings.USERS_GET_ERROR_MESSAGE });
    }
  }
);

router.post(
  ServerUsersSettings.USERS_BASE_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[USERS] ${
          ServerUsersSettings.USERS_BASE_ENDPOINT
        } POST body: ${JSON.stringify(req.body)}`
      );
    const { name, email } = req.body;

    if (!name || !email) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT} POST missing name or email: name=${name}, email=${email}`
        );
      return res
        .status(400)
        .json({ error: ServerUsersSettings.USER_NAME_EMAIL_REQUIRED_MESSAGE });
    }

    try {
      const newUser = {
        id: updateNextUserId(),
        name,
        email,
      };

      testUsers.push(newUser);
      res
        .status(201)
        .json({
          user: newUser,
          message: ServerUsersSettings.USER_CREATED_SUCCESS_MESSAGE,
        });
      if (console.log && console.log.api)
        console.log.api(`user: ${req.userIp} created user: ${name} (${email})`);
    } catch (e) {
      if (console.error && console.error.api)
        console.error.api(
          `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT} POST: ${e.message}`
        );
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_BASE_ENDPOINT} POST: failed to create user`
        );
      res
        .status(500)
        .json({ error: ServerUsersSettings.USER_CREATE_ERROR_MESSAGE });
    }
  }
);

router.get(
  ServerUsersSettings.USERS_ID_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} GET called by ${
          req.userIp || "unknown IP"
        } for id=${req.params.id}`
      );
    const userId = parseInt(req.params.id);
    const user = testUsers.find((u) => u.id === userId);

    if (!user) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[WARN] ${ServerUsersSettings.USERS_ID_ENDPOINT} GET user not found: ${userId}`
        );
      return res
        .status(404)
        .json({ error: ServerUsersSettings.USER_NOT_FOUND_MESSAGE });
    }

    res.json({ user });
    if (console.log && console.log.api)
      console.log.api(`user: ${req.userIp} requested user ${userId}`);
  }
);

router.put(
  ServerUsersSettings.USERS_ID_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} PUT called by ${
          req.userIp || "unknown IP"
        } for id=${req.params.id} with body: ${JSON.stringify(req.body)}`
      );
    const userId = parseInt(req.params.id);
    const { name, email } = req.body;

    const userIndex = testUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} PUT user not found: ${userId}`
        );
      return res
        .status(404)
        .json({ error: ServerUsersSettings.USER_NOT_FOUND_MESSAGE });
    }

    if (!name || !email) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} PUT missing name or email: name=${name}, email=${email}`
        );
      return res
        .status(400)
        .json({ error: ServerUsersSettings.USER_NAME_EMAIL_REQUIRED_MESSAGE });
    }

    testUsers[userIndex] = { ...testUsers[userIndex], name, email };
    if (console.log && console.log.api)
      console.log.api(`user: ${req.userIp} updated user ${userId}`);
    res.json({
      user: testUsers[userIndex],
      message: ServerUsersSettings.USER_UPDATED_SUCCESS_MESSAGE,
    });
  }
);

router.delete(
  ServerUsersSettings.USERS_ID_ENDPOINT,
  isAuthenticated,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} DELETE called by ${
          req.userIp || "unknown IP"
        } for id=${req.params.id}`
      );
    const userId = parseInt(req.params.id);
    const userIndex = testUsers.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[USERS] ${ServerUsersSettings.USERS_ID_ENDPOINT} DELETE user not found: ${userId}`
        );
      return res
        .status(404)
        .json({ error: ServerUsersSettings.USER_NOT_FOUND_MESSAGE });
    }

    const deletedUser = testUsers.splice(userIndex, 1)[0];
    res.json({
      user: deletedUser,
      message: ServerUsersSettings.USER_DELETE_SUCCESS_MESSAGE,
    });
    if (console.log && console.log.api)
      console.log.api(`user: ${req.userIp} deleted user ${userId}`);
  }
);

module.exports = router;
