const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { checkRateLimit, loginAttempts, resetLoginAttempts } = require("../utils/authUtils");

router.get("/api/v1/login", (req, res) => {
  if (console.debug) console.debug(`[LOGIN] /api/v1/login GET called by ${req.userIp || "unknown IP"}`);
  res.cookie("authenticated", "true");
  if (console.log && console.log.user) console.log.user(`user: ${req.userIp} logged in.`);
  res.redirect("/");
});

router.get("/api/v1/logout", isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[LOGOUT] /api/v1/logout GET called by ${req.userIp || "unknown IP"}`);
  res.clearCookie("authenticated");
  resetLoginAttempts(req.userIp);
  if (console.log && console.log.user) console.log.user(`user: ${req.userIp} logged out.`);
  res.redirect("/");
});

router.post("/api/v1/auth", checkRateLimit, (req, res) => {
  if (console.debug) console.debug(`[AUTH] /api/v1/auth POST called by ${req.userIp || "unknown IP"} with body: ${JSON.stringify(req.body)}`);
  const { username, password } = req.body;

  if (!username || !password) {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] /api/v1/auth POST missing username or password: username=${username}, password=${password}`);
    return res.status(400).json({ success: false, message: "Username and password are required" });
  }
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} attempted authentication as ${username}`);
  
  const validUsername = "admin";
  const validPassword = "password";
  
  if (username === validUsername && password === validPassword) {
    resetLoginAttempts(req.userIp);
    res.json({ success: true, message: "Authentication successful" });
  } else {
    loginAttempts[req.userIp].count++;
    res.status(401).json({ success: false, message: "Invalid credentials" });
  }
});

module.exports = router;
