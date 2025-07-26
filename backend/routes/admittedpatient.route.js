const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");


// Patient Admission Routes
router.post(
  "/create-admitted-patient",


  controller.admittedPatient.admittedPatient
);

router.get(
  "/get-admitted-patients",


  controller.admittedPatient.getAllAdmittedPatients
);

router.get(
  "/get-admitted-patient-by-mrno/:mrNo",


  controller.admittedPatient.getByMRNumber
);

router.put(
  "/update-admission/:id",


  controller.admittedPatient.updateAdmission
);

router.delete(
  "/delete-admission/:id",


  controller.admittedPatient.deleteAdmission
);


module.exports = router;