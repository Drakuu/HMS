const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

// Submit Test Results (corrected path)
router.patch('/:patientTestId/tests/:testId/results', 
    passport.authenticate("jwt", { session: false }),
    controller.testResult.submitTestResults
);

module.exports = router;