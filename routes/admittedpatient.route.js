const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

// Patient Admission Routes
router.post(
  "/create-admitted-patient",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.admittedPatient.admittedPatient
);

router.get(
  "/get-admitted-patients",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.admittedPatient.getAllAdmittedPatients
);

router.get(
  "/get-admitted-patient-by-mrno/:mrNo",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.admittedPatient.getByMRNumber
);

router.put(
  "/update-admission/:id",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.admittedPatient.updateAdmission
);

router.delete(
  "/delete-admission/:id",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.admittedPatient.deleteAdmission
);


module.exports = router;