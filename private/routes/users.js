const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { testUsers, updateNextUserId } = require("../utils/endpointUtils");

router.get("/api/v1/users", isAuthenticated, (req, res) => {
  res.json({ users: testUsers, count: testUsers.length });
  console.log.api(`user: ${req.userIp} requested users list.`);
});

router.post("/api/v1/users", isAuthenticated, (req, res) => {
  const { name, email } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({ error: "Name and email are required" });
  }
  
  const newUser = {
    id: updateNextUserId(),
    name,
    email
  };
  
  testUsers.push(newUser);
  res.status(201).json({ user: newUser, message: "User created successfully" });
  console.log.api(`user: ${req.userIp} created user: ${name}`);
});

router.get("/api/v1/users/:id", isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id);
  const user = testUsers.find(u => u.id === userId);
  
  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }
  
  res.json({ user });
  console.log.api(`user: ${req.userIp} requested user ${userId}`);
});

router.delete("/api/v1/users/:id", isAuthenticated, (req, res) => {
  const userId = parseInt(req.params.id);
  const userIndex = testUsers.findIndex(u => u.id === userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found" });
  }
  
  const deletedUser = testUsers.splice(userIndex, 1)[0];
  res.json({ user: deletedUser, message: "User deleted successfully" });
  console.log.api(`user: ${req.userIp} deleted user ${userId}`);
});

module.exports = router;
