const express = require("express");
const router = express.Router();
const path = require("path");
const { isAuthenticated } = require("../middleware/auth");
const { PUBLIC_INDEX_HTML_PATH } = require("../settings/serverPathsSettings");

const authRoutes = require("./authRoutes");
const userRoutes = require("./users");
const metaRoutes = require("./meta");
const dataRoutes = require("./data");

router.use(authRoutes);
router.use(userRoutes);
router.use(metaRoutes);
router.use(dataRoutes);

router.get("/", isAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, PUBLIC_INDEX_HTML_PATH));
});

module.exports = router;
