const express = require("express");
const router = express.Router();
const { isAuthenticated } = require("../middleware/auth");
const { checkRateLimit, loginAttempts, resetLoginAttempts } = require("../utils/authUtils");
const { AUTH_COOKIE_NAME, LOGIN_ENDPOINT, LOGOUT_ENDPOINT, AUTH_POST_ENDPOINT, LOGIN_REDIRECT_PATH, LOGOUT_REDIRECT_PATH, ADMIN_USERNAME, ADMIN_PASSWORD, USERNAME_PASSWORD_REQUIRED_MESSAGE, AUTHENTICATION_SUCCESS_MESSAGE, INVALID_CREDENTIALS_MESSAGE } = require("../settings/serverAuthSettings");

router.get(LOGIN_ENDPOINT, (req, res) => {
  if (console.debug) console.debug(`[LOGIN] ${LOGIN_ENDPOINT} GET called by ${req.userIp || "unknown IP"}`);
  res.cookie(AUTH_COOKIE_NAME, "true");
  if (console.log && console.log.user) console.log.user(`user: ${req.userIp} logged in.`);
  res.redirect(LOGIN_REDIRECT_PATH);
});

router.get(LOGOUT_ENDPOINT, isAuthenticated, (req, res) => {
  if (console.debug) console.debug(`[LOGOUT] ${LOGOUT_ENDPOINT} GET called by ${req.userIp || "unknown IP"}`);
  res.clearCookie(AUTH_COOKIE_NAME);
  resetLoginAttempts(req.userIp);
  if (console.log && console.log.user) console.log.user(`user: ${req.userIp} logged out.`);
  res.redirect(LOGOUT_REDIRECT_PATH);
});

router.post(AUTH_POST_ENDPOINT, checkRateLimit, (req, res) => {
  if (console.debug) console.debug(`[AUTH] ${AUTH_POST_ENDPOINT} POST called by ${req.userIp || "unknown IP"} with body: ${JSON.stringify(req.body)}`);
  const { username, password } = req.body;

  if (!username || !password) {
    if (console.warn && console.warn.api) console.warn.api(`[WARN] ${AUTH_POST_ENDPOINT} POST missing username or password: username=${username}, password=${password}`);
    return res.status(400).json({ success: false, message: USERNAME_PASSWORD_REQUIRED_MESSAGE });
  }
  if (console.log && console.log.api) console.log.api(`user: ${req.userIp} attempted authentication as ${username}`);
  
  const validUsername = ADMIN_USERNAME;
  const validPassword = ADMIN_PASSWORD;
  
  if (username === validUsername && password === validPassword) {
    resetLoginAttempts(req.userIp);
    res.json({ success: true, message: AUTHENTICATION_SUCCESS_MESSAGE });
  } else {
    loginAttempts[req.userIp].count++;
    res.status(401).json({ success: false, message: INVALID_CREDENTIALS_MESSAGE });
  }
});

module.exports = router;
