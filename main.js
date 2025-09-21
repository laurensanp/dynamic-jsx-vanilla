const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { getIp } = require("./private/middleware/auth");
const routes = require("./private/routes");
require("./private/utils/logger");

app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(getIp);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", routes);

// Export the app for testing, and only start the server when run directly
module.exports = app;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log.server(`running on http://localhost:${PORT}`);
  });
}
