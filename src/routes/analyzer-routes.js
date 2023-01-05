const express = require("express");
const analyzeController = require("../controllers/analyzer-controllers");
const router = express.Router();
const path = require("path");

router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../react/flow-analyzer/build/", "index.html")
  );
});

router.get("/api/analyze", analyzeController.fetchData);

router.post("/api/analyze", analyzeController.analyzeDataOnServer);
router.post("/api/intf", analyzeController.createIntf);

router.post("/api/dns", analyzeController.dns);

module.exports = router;
