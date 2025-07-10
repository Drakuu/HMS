const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

router.post(
  "/create-patient",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.createPatient
);


router.get(
  "/get-patients",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.getAllPatients
);

router.get(
  "/get-patient-by-id/:patientId",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.getPatientById
);

router.get(
  "/get-patient-by-mrno/:patient_MRNo",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.getPatientByMRNo
);

router.delete(
  "/delete-patient/:patientId",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.deletePatient
);
router.put(
  "/update-patient/:patient_MRNo",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.patient.updatePatient
)

module.exports = router;