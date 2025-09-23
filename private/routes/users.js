const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { testUsers, updateNextUserId } = require("../utils/endpointUtils");
const { USERS_BASE_ENDPOINT, USERS_ID_ENDPOINT, USERS_GET_ERROR_MESSAGE, USER_NAME_EMAIL_REQUIRED_MESSAGE, USER_CREATED_SUCCESS_MESSAGE, USER_CREATE_ERROR_MESSAGE, USER_NOT_FOUND_MESSAGE, USER_UPDATED_SUCCESS_MESSAGE, USER_DELETE_SUCCESS_MESSAGE } = require("../settings/serverUsersSettings");

router.get(USERS_BASE_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] ${USERS_BASE_ENDPOINT} GET called by ${req.userIp || "unknown IP"}`);
  try {
    res.json({ users: testUsers, count: testUsers.length });
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested users list.`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[USERS] ${USERS_BASE_ENDPOINT}: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_BASE_ENDPOINT}: failed to return users`);
    res.status(500).json({ error: USERS_GET_ERROR_MESSAGE });
  }
});

router.post(USERS_BASE_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] ${USERS_BASE_ENDPOINT} POST body: ${JSON.stringify(req.body)}`);
  const { name, email } = req.body;

  if (!name || !email) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_BASE_ENDPOINT} POST missing name or email: name=${name}, email=${email}`);
    return res.status(400).json({ error: USER_NAME_EMAIL_REQUIRED_MESSAGE });
  }

  try {
    const newUser = {
      id: updateNextUserId(),
      name,
      email
    };

    testUsers.push(newUser);
    res.status(201).json({ user: newUser, message: USER_CREATED_SUCCESS_MESSAGE });
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} created user: ${name} (${email})`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[USERS] ${USERS_BASE_ENDPOINT} POST: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_BASE_ENDPOINT} POST: failed to create user`);
    res.status(500).json({ error: USER_CREATE_ERROR_MESSAGE });
  }
});

router.get(USERS_ID_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] ${USERS_ID_ENDPOINT} GET called by ${req.userIp || "unknown IP"} for id=${req.params.id}`);
  const userId = parseInt(req.params.id);
  const user = testUsers.find(u => u.id === userId);

  if (!user) {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] ${USERS_ID_ENDPOINT} GET user not found: ${userId}`);
    return res.status(404).json({ error: USER_NOT_FOUND_MESSAGE });
  }

  res.json({ user });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested user ${userId}`);
});

router.put(USERS_ID_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] ${USERS_ID_ENDPOINT} PUT called by ${req.userIp || "unknown IP"} for id=${req.params.id} with body: ${JSON.stringify(req.body)}`);
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;

  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_ID_ENDPOINT} PUT user not found: ${userId}`);
    return res.status(404).json({ error: USER_NOT_FOUND_MESSAGE });
  }

  if (!name || !email) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_ID_ENDPOINT} PUT missing name or email: name=${name}, email=${email}`);
    return res.status(400).json({ error: USER_NAME_EMAIL_REQUIRED_MESSAGE });
  }

  testUsers[userIndex] = { ...testUsers[userIndex], name, email };
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} updated user ${userId}`);
  res.json({ user: testUsers[userIndex], message: USER_UPDATED_SUCCESS_MESSAGE });
});

router.delete(USERS_ID_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] ${USERS_ID_ENDPOINT} DELETE called by ${req.userIp || "unknown IP"} for id=${req.params.id}`);
  const userId = parseInt(req.params.id);
  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] ${USERS_ID_ENDPOINT} DELETE user not found: ${userId}`);
    return res.status(404).json({ error: USER_NOT_FOUND_MESSAGE });
  }

  const deletedUser = testUsers.splice(userIndex, 1)[0];
  res.json({ user: deletedUser, message: USER_DELETE_SUCCESS_MESSAGE });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} deleted user ${userId}`);
});

module.exports = router;
