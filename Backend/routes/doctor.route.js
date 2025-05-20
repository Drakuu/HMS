const express = require("express");
const router = express.Router();
const upload = require("../config/multer");
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

router.post(
  "/create-doctor",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  upload.fields([
    { name: "doctor_Image", maxCount: 1 },
    { name: "doctor_Agreement", maxCount: 1 },
  ]),
  controller.doctor.createDoctor
);

router.get(
  "/get-doctors",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.doctor.getAllDoctors
);

router.get(
  "/get-doctor-by-id/:doctorId",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.doctor.getDoctorById
);

router.delete(
  "/delete/:doctorId",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  controller.doctor.deleteDoctor
);

router.put(
  "/update-doctor/:doctorId",
  passport.authenticate("jwt", { session: false }),
  middleware.adminRoleCheck,
  upload.fields([
    { name: "doctor_Image", maxCount: 1 },
    { name: "doctor_Agreement", maxCount: 1 },
  ]),
  controller.doctor.updateDoctor
);
console.log("Doctor routes loaded")
router.get(

  "/get-doctors-by-department/:departmentName",
  // passport.authenticate("jwt", { session: false }),
  // middleware.adminRoleCheck,
  controller.doctor.getAllDoctorsByDepartmentName
);
module.exports = router;