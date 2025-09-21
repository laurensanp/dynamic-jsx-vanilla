const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { getIp } = require("./private/middleware/auth");
const routes = require("./private/routes");

require("./private/utils/logger");
const { getAllEndpoints } = require("./private/utils/routerUtils");

app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(getIp);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", routes);

app.get("/api/v1/meta/endpoints", (req, res) => {
  const endpoints = getAllEndpoints(routes);
  res.json({ count: endpoints.length, endpoints });
});


module.exports = app;

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log.server(`running on http://localhost:${PORT}`);
  });
}
