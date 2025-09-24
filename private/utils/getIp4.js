const https = require("https");

function getPublicIPv4() {
  return new Promise((resolve, reject) => {
    https
      .get("https://ipv4.icanhazip.com", (res) => {
        res.on("data", (d) => {
          resolve(d.toString().trim());
        });
      })
      .on("error", (e) => {
        reject(e);
      });
  });
}

module.exports = getPublicIPv4;
