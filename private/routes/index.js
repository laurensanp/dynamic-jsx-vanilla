const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { isAuthenticated } = require("../middleware/auth");
const { LOG_FILE } = require("../utils/logger");


router.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "../../public/index.html"));
  console.log(`user: ${req.userIp} entered main.`);
});

router.get("/api/v1/login", (req, res) => {
  res.cookie("authenticated", "true");
  console.log(`user: ${req.userIp} logged in.`);
  res.redirect("/");
});

router.get("/api/v1/logout", (req, res) => {
  res.clearCookie("authenticated");
  console.log(`user: ${req.userIp} logged out.`);
  res.redirect("/");
});

router.get("/api/v1/hello", (req, res) => {
  res.json({ message: "here da data." });
  console.log(`user: ${req.userIp} requested hello_data.`);
});

router.get("/api/v1/shut", (req, res) => {
  res.json({ message: "shut down, temporarily disabled." });
  console.log(`user: ${req.userIp} requested shutdown.`);
  // child_process.exec("shutdown /s /t 0", (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error: ${error.message}`);
  //     return;
  //   }
  //   console.log(`shut executed`);
  // });
});

router.get("/api/v1/logs", isAuthenticated, (req, res) => {
  const logs = fs.readFileSync(LOG_FILE, 'utf8').split('\n').filter(Boolean);
  res.json({ logs: logs });
});

module.exports = router;
