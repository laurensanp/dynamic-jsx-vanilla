const { AUTH_COOKIE_NAME, ACCESS_DENIED_MESSAGE } = require("../settings/serverAuthSettings");

exports.getIp = (req, res, next) => {
  req.userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  next();
};

exports.isAuthenticated = (req, res, next) => {
  if (req.cookies[AUTH_COOKIE_NAME] === "true") {
    next();
  } else {
    res.status(403).json({ message: ACCESS_DENIED_MESSAGE });
  }
};
