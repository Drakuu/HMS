const express = require("express");
const router = express.Router();
const multer = require("multer");
const google_Drive = require("../controllers/google_Drive.controller");
const passport = require("../middleware/passportAuth.middleware");
// Use memory storage so file is not saved to disk
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/upload",
  passport.authenticate("jwt", { session: false }),
  upload.single("file"),
  google_Drive.uploadFileToDrive
);

module.exports = router;
