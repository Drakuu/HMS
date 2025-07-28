const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");


// Submit Test Results (corrected path)
router.patch(
  "/:patientTestId/tests/:testId/results",

  controller.testResult.submitTestResults
);

// Get all test results
router.get(
  "/",

  controller.testResult.getAllTestResults
);

// Get patient by result ID
router.get(
  "/:resultId/patient",

  controller.testResult.getPatientByResultId
);

router.get(
  "/get-patient-summery-by-date",
  // passport.authenticate("jwt", { session: false }),
  controller.testResult.getSummaryByDate
);

module.exports = router;
