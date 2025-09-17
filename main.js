const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const cors = require("cors");
// const child_process = require("child_process");
// const os = require("os");
const cookieParser = require("cookie-parser");
const { getIp } = require("./private/middleware/auth");
require("./private/utils/logger"); // Initialize logging
const routes = require("./private/routes");


app.use(cors({ origin: true }));
app.use(express.json());
app.use(cookieParser());
app.use(getIp);
app.use("/public", express.static(path.join(__dirname, "public")));

app.use("/", routes);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`server running on http://localhost:${PORT}`);
});
