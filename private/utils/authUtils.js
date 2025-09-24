const loginAttempts = {};
const TestSettings = require("../../public/settings/testSettings.js");
const ServerAuthSettings = require("../settings/serverAuthSettings");

function checkRateLimit(req, res, next) {
  const ip = req.userIp;
  if (!loginAttempts[ip]) {
    loginAttempts[ip] = { count: 0, lastAttempt: 0 };
  }

  const now = Date.now();
  if (now - loginAttempts[ip].lastAttempt > TestSettings.AUTH_COOLDOWN_TIME) {
    loginAttempts[ip].count = 0;
  }

  if (loginAttempts[ip].count >= TestSettings.AUTH_MAX_ATTEMPTS) {
    if (console.warn && console.warn.security)
      console.warn.security(`[AUTH] Rate limit exceeded for IP: ${ip}`);
    return res.status(429).json({
      success: false,
      message: ServerAuthSettings.RATE_LIMIT_EXCEEDED_MESSAGE,
    });
  }
  loginAttempts[ip].lastAttempt = now;
  next();
}

function resetLoginAttempts(ip = null) {
  if (ip) {
    if (loginAttempts[ip]) {
      loginAttempts[ip].count = 0;
      if (console.log && console.log.security)
        console.log.security(
          `[AUTH] ${ServerAuthSettings.IP_RESET_LOG_MESSAGE(ip)}`
        );
    }
  } else {
    for (const key in loginAttempts) {
      if (Object.hasOwnProperty.call(loginAttempts, key)) {
        loginAttempts[key].count = 0;
      }
    }
    if (console.log && console.log.security)
      console.log.security(
        `[AUTH] ${ServerAuthSettings.ALL_RESET_LOG_MESSAGE}`
      );
  }
}

module.exports = {
  checkRateLimit,
  resetLoginAttempts,
  loginAttempts,
};
