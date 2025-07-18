const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

router.post(
  "/patient-test",
//   passport.authenticate("jwt", { session: false }),
//   middleware.adminRoleCheck,
  controller.patientTest.createPatientTest
);

// Get All Patient Tests (with pagination and search)
router.get('/', 
    // authMiddleware,
    controller.patientTest.getAllPatientTests
);

// Get Patient Test by ID
router.get('/:id', 
    // authMiddleware,
    controller.patientTest.getPatientTestById
);
// Get Patient Test by ID
router.get('/mrno/:mrNo', 
    // authMiddleware,
    controller.patientTest.getPatientTestByMRNo
);

// Soft Delete Patient Test
router.delete('/:id', 
    // authMiddleware,
    controller.patientTest.softDeletePatientTest
);

// Restore Soft Deleted Patient Test (Bonus)
router.patch('/:id/restore', 
    // authMiddleware,
    controller.patientTest.restorePatientTest
);


module.exports = router;