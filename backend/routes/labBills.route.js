const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

// Get all test results
router.get('/',
    // passport.authenticate("jwt", { session: false }),
    controller.labBills.getAllTestBills
);

// Get patient by result ID
router.get('/:patientTestId', 
// passport.authenticate("jwt", { session: false }),
controller.labBills.getTestBillsByPatientTestId,
);

module.exports = router;