const express = require("express");
const http = require("http");
const https = require("https");
const fs = require("fs");
const path = require("path");
require("dotenv").config();
const app = express();
const analyzerRoutes = require("./routes/analyzer-routes");
const bodyParser = require("body-parser");

const port = 8087;
let host = "0.0.0.0";

let server;

if (process.env.USE_HTTPS === "true") {
  try {
    const options = {
      key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH)),
      cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH)),
    };
    server = https.createServer(options, app);
    console.log(`SECURE: Server initialized with HTTPS on port ${port}`);
  } catch (err) {
    console.error("SSL Certificate Error: Falling back to HTTP.", err.message);
    server = http.createServer(app);
  }
} else {
  server = http.createServer(app);
  console.log(`Standard: Server initialized with HTTP on port ${port}`);
}

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);
app.use((req, res, next) => {
  res.append("Access-Control-Allow-Origin", ["*"]);
  res.append("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.append("Access-Control-Allow-Headers", "Content-Type");
  next();
});

app.use(express.static(path.join(__dirname, "react/flow-analyzer/build")));
app.get("/", (req, res) => res.send("express"));

app.use("/flow-analyzer", analyzerRoutes);

app.set("Host", host);
app.set("Port", port);

module.exports = { app, server };
