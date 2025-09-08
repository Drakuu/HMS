const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const { passportAuth, checkRole, doctorOnly } = require('../middleware/index.middleware');


router.post(
  "/create-patient",

  controller.patient.createPatient
);


router.get(
  "/get-patients",
  controller.patient.getAllPatients
);
router.get(
  "/with-refund-history/:patientMRNo",
  controller.patient.getPatientWithRefundHistory
);

router.get(
  "/get-patient-by-id/:patientId",
  //  passportAuth.authenticate("jwt", { session: false }),
  // checkRole(['Doctor', 'Admin', 'Receptionist',]),
  controller.patient.getPatientById
);

router.get(
  "/get-patient-by-mrno/:patient_MRNo",
  //  passportAuth.authenticate("jwt", { session: false }),
  // checkRole(['Doctor', 'Admin', 'Receptionist',]),
  controller.patient.getPatientByMRNo
);

router.delete(
  "/delete-patient/:patientId",
  //  passportAuth.authenticate("jwt", { session: false }),
  // checkRole(['Doctor', 'Admin', 'Receptionist',]),
  controller.patient.deletePatient
);
router.put(
  "/update-patient/:patient_MRNo",
  //  passportAuth.authenticate("jwt", { session: false }),
  // checkRole(['Doctor', 'Admin', 'Receptionist',]),

  controller.patient.updatePatient
)

router.get(
  "/search-patients",
  // passportAuth.authenticate("jwt", { session: false }),
  // checkRole(['Doctor', 'Admin', 'Receptionist']),
  controller.patient.searchPatient
);

module.exports = router;