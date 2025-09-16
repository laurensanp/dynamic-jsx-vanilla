const express = require("express");
const app = express();
const PORT = 8000;
const path = require("path");
const cors = require("cors");
const child_process = require("child_process");

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/index.html"));
});

app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/private", express.static(path.join(__dirname, "private")))

app.get("/api/v1/hello", (req, res) => {
  res.json({ message: `here da data` });
  console.log(`date requested`);
});

app.get("/api/v1/shut", (req, res) => {
  res.json({ message: `shut down` });
  child_process.exec("shutdown /s /t 0", (error, stdout, stderr) => {
    if (error) {
      console.error(`Error: ${error.message}`);
      return;
    }
    console.log(`shut executed`);
  });
});

app.listen(PORT, () => {
  console.log(`server running on http://localhost:${PORT}`);
});
