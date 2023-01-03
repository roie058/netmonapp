const multer = require("multer");

const MIME_TYPE_MAP = {
  "text/plain": "txt",
  "text/csv": "csv",
};

const fileUpload = multer({
  limits: 50000000,
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "uploads/analyzes");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = { fileUpload };
