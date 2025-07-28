const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");


router.post(
  "/create-patient",


  controller.patient.createPatient
);


router.get(
  "/get-patients",


  controller.patient.getAllPatients
);

router.get(
  "/get-patient-by-id/:patientId",


  controller.patient.getPatientById
);

router.get(
  "/get-patient-by-mrno/:patient_MRNo",


  controller.patient.getPatientByMRNo
);

router.delete(
  "/delete-patient/:patientId",


  controller.patient.deletePatient
);
router.put(
  "/update-patient/:patient_MRNo",


  controller.patient.updatePatient
)

module.exports = router;