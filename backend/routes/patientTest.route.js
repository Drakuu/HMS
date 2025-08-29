const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

router.post(
  '/patient-test',
  passport.authenticate("jwt", { session: false }),
//   middleware.adminRoleCheck,
  controller.patientTest.createPatientTest
);

// Get All Patient Tests (with pagination and search)
router.get('/', 
  passport.authenticate("jwt", { session: false }),

    // authMiddleware,
    controller.patientTest.getAllPatientTests
);

// Get Patient Test by ID
router.get('/:id', 
  passport.authenticate("jwt", { session: false }),

    // authMiddleware,
    controller.patientTest.getPatientTestById
);
// Get Patient Test by ID
router.get('/mrno/:mrNo', 
  passport.authenticate("jwt", { session: false }),

    // authMiddleware,
    controller.patientTest.getPatientTestByMRNo
);

// Soft Delete Patient Test
router.delete('/:id', 
  passport.authenticate("jwt", { session: false }),

    // authMiddleware,
    controller.patientTest.softDeletePatientTest
);



// Restore Soft Deleted Patient Test (Bonus)
router.patch('/:id/restore', 
  passport.authenticate("jwt", { session: false }),

    // authMiddleware,
    controller.patientTest.restorePatientTest
);



router.get('/test/patient-test-history',
  passport.authenticate("jwt", { session: false }),
  controller.patientTest.PatientTestStates
);

router.patch('/test/payment-after-report/:patientId',
  passport.authenticate("jwt", { session: false }),
  controller.patientTest.paymentAfterReport
);

router.patch('/update-patienttest/:id',
  passport.authenticate("jwt", { session: false }),
  controller.patientTest.updatePatientTest
);

module.exports = router;