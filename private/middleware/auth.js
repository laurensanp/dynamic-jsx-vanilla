const ServerAuthSettings = require("../settings/serverAuthSettings");

exports.getIp = (req, res, next) => {
  req.userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  next();
};

exports.isAuthenticated = (req, res, next) => {
  if (req.cookies[ServerAuthSettings.AUTH_COOKIE_NAME] === "true") {
    next();
  } else {
    res.status(403).json({ message: ServerAuthSettings.ACCESS_DENIED_MESSAGE });
  }
};
