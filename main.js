const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const cors = require("cors");
// const child_process = require("child_process");
// const os = require("os");
const cookieParser = require("cookie-parser");

const getIp = (req, res, next) => {
  req.userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  next();
};

const isAuthenticated = (req, res, next) => {
  if (req.cookies.authenticated === "true") {
    next();
  } else {
    res.status(403).json({ message: "access denied: need to be authenticated." });
  }
};

app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(getIp);
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/private", express.static(path.join(__dirname, "private")));

app.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
  console.log(`user main: ${req.userIp}`);
});

app.get("/api/v1/login", (req, res) => {
  res.cookie("authenticated", "true");
  //res.json({ message: "logged in successfully." });
  console.log(`user login: ${req.userIp}`);
  res.redirect("/");
});

app.get("/api/v1/logout", (req, res) => {
  res.clearCookie("authenticated");
  res.json({ message: "logged out successfully." });
  console.log(`user logout: ${req.userIp}`);
  res.redirect("/");
});

app.get("/api/v1/hello", (req, res) => {
  res.json({ message: "here da data." });
  console.log(`date requested: ${req.userIp}`);
});

app.get("/api/v1/shut", (req, res) => {
  res.json({ message: "shut down, temporarily disabled." });
  console.log(`shut requested: ${req.userIp}`);
  // child_process.exec("shutdown /s /t 0", (error, stdout, stderr) => {
  //   if (error) {
  //     console.error(`Error: ${error.message}`);
  //     return;
  //   }
  //   console.log(`shut executed`);
  // });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on http://0.0.0.0:${PORT}`);
});
