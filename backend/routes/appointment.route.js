const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const { passportAuth, checkRole, doctorOnly } = require('../middleware/index.middleware');
router.post(
    "/create-appointment",
  passportAuth.authenticate("jwt", { session: false }),
  checkRole(['Doctor', 'Admin', 'Receptionist']),
    controller.appointment.createAppointment
);

router.get(
    "/get-appointments",
  passportAuth.authenticate("jwt", { session: false }),
  checkRole(['Doctor', 'Admin', 'Receptionist']),
    controller.appointment.getAppointments
);

router.delete(
    "/delete-appointment/:id",
  passportAuth.authenticate("jwt", { session: false }),
  checkRole(['Doctor', 'Admin', 'Receptionist']),
    controller.appointment.deleteAppointment
);

router.patch(
    "/update-appointment/:id",
  passportAuth.authenticate("jwt", { session: false }),
  checkRole(['Doctor', 'Admin', 'Receptionist']),
    controller.appointment.updateAppointment
);

router.patch(
    "/restore-appointment/:id",
  passportAuth.authenticate("jwt", { session: false }),
  checkRole(['Doctor', 'Admin', 'Receptionist']),
    controller.appointment.restoreAppointment
);

module.exports = router;
