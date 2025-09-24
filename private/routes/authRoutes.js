const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const {
  checkRateLimit,
  loginAttempts,
  resetLoginAttempts,
} = require("../utils/authUtils");
const ServerAuthSettings = require("../settings/serverAuthSettings");

router.get(ServerAuthSettings.LOGIN_ENDPOINT, (req, res) => {
  if (console.debug)
    console.debug(
      `[LOGIN] ${ServerAuthSettings.LOGIN_ENDPOINT} GET called by ${
        req.userIp || "unknown IP"
      }`
    );
  res.cookie(ServerAuthSettings.AUTH_COOKIE_NAME, "true");
  if (console.log && console.log.user)
    console.log.user(`user: ${req.userIp} logged in.`);
  res.redirect(ServerAuthSettings.LOGIN_REDIRECT_PATH);
});

router.get(ServerAuthSettings.LOGOUT_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug)
    console.debug(
      `[LOGOUT] ${ServerAuthSettings.LOGOUT_ENDPOINT} GET called by ${
        req.userIp || "unknown IP"
      }`
    );
  res.clearCookie(ServerAuthSettings.AUTH_COOKIE_NAME);
  resetLoginAttempts(req.userIp);
  if (console.log && console.log.user)
    console.log.user(`user: ${req.userIp} logged out.`);
  res.redirect(ServerAuthSettings.LOGOUT_REDIRECT_PATH);
});

router.post(
  ServerAuthSettings.AUTH_POST_ENDPOINT,
  checkRateLimit,
  (req, res) => {
    if (console.debug)
      console.debug(
        `[AUTH] ${ServerAuthSettings.AUTH_POST_ENDPOINT} POST called by ${
          req.userIp || "unknown IP"
        } with body: ${JSON.stringify(req.body)}`
      );
    const { username, password } = req.body;

    if (!username || !password) {
      if (console.warn && console.warn.api)
        console.warn.api(
          `[WARN] ${ServerAuthSettings.AUTH_POST_ENDPOINT} POST missing username or password: username=${username}, password=${password}`
        );
      return res.status(400).json({
        success: false,
        message: ServerAuthSettings.USERNAME_PASSWORD_REQUIRED_MESSAGE,
      });
    }
    if (console.log && console.log.api)
      console.log.api(
        `user: ${req.userIp} attempted authentication as ${username}`
      );

    const validUsername = ServerAuthSettings.ADMIN_USERNAME;
    const validPassword = ServerAuthSettings.ADMIN_PASSWORD;

    if (username === validUsername && password === validPassword) {
      resetLoginAttempts(req.userIp);
      res.json({
        success: true,
        message: ServerAuthSettings.AUTHENTICATION_SUCCESS_MESSAGE,
      });
    } else {
      loginAttempts[req.userIp].count++;
      res.status(401).json({
        success: false,
        message: ServerAuthSettings.INVALID_CREDENTIALS_MESSAGE,
      });
    }
  }
);

module.exports = router;
