const express = require("express");
const analyzeController = require("../controllers/analyzer-controllers");
const { fileUpload } = require("../middleWares/file-upload");
const router = express.Router();
const path = require("path");
router.get("/", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../react/flow-analyzer/build/", "index.html")
  );
});

router.get("/intf/:sender", analyzeController.fetchIntf);
router.get("/analyze", analyzeController.fetchData);

router.post("/intf", fileUpload.any(), analyzeController.createIntf);

router.post("/analyze", fileUpload.any(), analyzeController.analyzeData);
router.post("/analyze/server", analyzeController.analyzeDataOnServer);
router.post("/dns", analyzeController.dns);

//router.use(authCheck);

//router.post(
// "/",
//  upload.any(),
//  [
//   check("header").not().isEmpty(),
//   check("address").not().isEmpty(),
//   check("isHomePage").isBoolean(),
//   check("isWordingPage").isBoolean(),
// ],
//  articleController.createArticle
//);

module.exports = router;
