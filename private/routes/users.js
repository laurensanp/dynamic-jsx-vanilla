const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { testUsers, updateNextUserId } = require("../utils/endpointUtils");

router.get("/api/v1/users", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] /api/v1/users GET called by ${req.userIp || "unknown IP"}`);
  try {
    res.json({ users: testUsers, count: testUsers.length });
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested users list.`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[USERS] /api/v1/users: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users: failed to return users`);
    res.status(500).json({ error: "Failed to get users" });
  }
});

router.post("/api/v1/users", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] /api/v1/users POST body: ${JSON.stringify(req.body)}`);
  const { name, email } = req.body;

  if (!name || !email) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users POST missing name or email: name=${name}, email=${email}`);
    return res.status(400).json({ error: "Name and email are required" });
  }

  try {
    const newUser = {
      id: updateNextUserId(),
      name,
      email
    };

    testUsers.push(newUser);
    res.status(201).json({ user: newUser, message: "User created successfully" });
    if (console.log && console.log.api) console.log.api(`user: ${req.userIp} created user: ${name} (${email})`);
  } catch (e) {
    if (console.error && console.error.api) console.error.api(`[USERS] /api/v1/users POST: ${e.message}`);
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users POST: failed to create user`);
    res.status(500).json({ error: "Failed to create user" });
  }
});

router.get("/api/v1/users/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] /api/v1/users/:id GET called by ${req.userIp || "unknown IP"} for id=${req.params.id}`);
  const userId = parseInt(req.params.id);
  const user = testUsers.find(u => u.id === userId);

  if (!user) {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/users/:id GET user not found: ${userId}`);
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} requested user ${userId}`);
});

router.put("/api/v1/users/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] /api/v1/users/:id PUT called by ${req.userIp || "unknown IP"} for id=${req.params.id} with body: ${JSON.stringify(req.body)}`);
  const userId = parseInt(req.params.id);
  const { name, email } = req.body;

  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users/:id PUT user not found: ${userId}`);
    return res.status(404).json({ error: "User not found" });
  }

  if (!name || !email) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users/:id PUT missing name or email: name=${name}, email=${email}`);
    return res.status(400).json({ error: "Name and email are required" });
  }

  testUsers[userIndex] = { ...testUsers[userIndex], name, email };
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} updated user ${userId}`);
  res.json({ user: testUsers[userIndex], message: "User updated successfully" });
});

router.delete("/api/v1/users/:id", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[USERS] /api/v1/users/:id DELETE called by ${req.userIp || "unknown IP"} for id=${req.params.id}`);
  const userId = parseInt(req.params.id);
  const userIndex = testUsers.findIndex(u => u.id === userId);

  if (userIndex === -1) {
    if (console.warn && console.warn.api) console.warn.api(`[USERS] /api/v1/users/:id DELETE user not found: ${userId}`);
    return res.status(404).json({ error: "User not found" });
  }

  const deletedUser = testUsers.splice(userIndex, 1)[0];
  res.json({ user: deletedUser, message: "User deleted successfully" });
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} deleted user ${userId}`);
});

module.exports = router;
