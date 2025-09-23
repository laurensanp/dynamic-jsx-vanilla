const loginAttempts = {};
const testConfig = require("../../public/settings/testSettings.js");
const MAX_ATTEMPTS = testConfig.AUTH_MAX_ATTEMPTS;
const COOLDOWN_TIME = testConfig.AUTH_COOLDOWN_TIME;
const { RATE_LIMIT_EXCEEDED_MESSAGE, IP_RESET_LOG_MESSAGE, ALL_RESET_LOG_MESSAGE } = require("../settings/serverAuthSettings");

function checkRateLimit(req, res, next) {
  const ip = req.userIp;
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: 0 };
  }

  const now = Date.now();
  if (now - loginAttempts[ip].lastAttempt > COOLDOWN_TIME) {
    loginAttempts[ip].count = 0;
  }

  if (loginAttempts[ip].count >= MAX_ATTEMPTS) {
    if (console.warn && console.warn.security) console.warn.security(`[AUTH] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({ success: false, message: RATE_LIMIT_EXCEEDED_MESSAGE });
  }
  loginAttempts[ip].lastAttempt = now;
  next();
}

function resetLoginAttempts(ip = null) {
  if (ip) {
    if (loginAttempts[ip]) {
      loginAttempts[ip].count = 0;
      if (console.log && console.log.security) console.log.security(`[AUTH] ${IP_RESET_LOG_MESSAGE(ip)}`);
    }
  } else {
    for (const key in loginAttempts) {
      if (Object.hasOwnProperty.call(loginAttempts, key)) {
        loginAttempts[key].count = 0;
      }
    }
    if (console.log && console.log.security) console.log.security(`[AUTH] ${ALL_RESET_LOG_MESSAGE}`);
  }
}

module.exports = {
  checkRateLimit,
  resetLoginAttempts,
  loginAttempts
};
