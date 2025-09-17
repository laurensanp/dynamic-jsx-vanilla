exports.getIp = (req, res, next) => {
  req.userIp = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  next();
};

exports.isAuthenticated = (req, res, next) => {
  if (req.cookies.authenticated === "true") {
    next();
  } else {
    res.status(403).json({ message: "access denied: need to be authenticated." });
  }
};
