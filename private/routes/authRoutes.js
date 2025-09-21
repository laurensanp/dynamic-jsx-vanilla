const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");

router.get("/api/v1/login", (req, res) => {
  res.cookie("authenticated", "true");
  console.log.user(`user: ${req.userIp} logged in.`);
  res.redirect("/");
});

router.get("/api/v1/logout", isAuthenticated, (req, res) => {
  res.clearCookie("authenticated");
  console.log.user(`user: ${req.userIp} logged out.`);
  res.redirect("/");
});

router.post("/api/v1/auth", isAuthenticated, (req, res) => {
  const { username, password } = req.body;
  
  
  if (username === "test" && password === "password") {
    res.json({ success: true, message: "Authentication successful", token: "test-token-123" });
  } else {
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
  
  console.log.api(`user: ${req.userIp} attempted authentication as ${username}`);
});

module.exports = router;
