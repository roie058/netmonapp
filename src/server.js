const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const analyzerRoutes = require("./routes/analyzer-routes");
const server = http.createServer(app);
const bodyParser = require("body-parser");

const port = 8087;
let host = "0.0.0.0";

app.use(bodyParser.json());

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
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
