const express = require("express");
const router = express.Router();
const controller = require("../controllers/appointment.controller");
// const passport = require("../middleware/passportAuth.middleware");

router.post(
    "/create-appointment",
    // passport.authenticate("jwt", { session: false }),
    controller.createAppointment
);

router.get(
    "/get-appointments",
    // passport.authenticate("jwt", { session: false }),
    controller.getAppointments
);

router.delete(
    "/delete-appointment/:id",
    // passport.authenticate("jwt", { session: false }),
    controller.deleteAppointment
);

router.patch(
    "/update-appointment/:id",
    // passport.authenticate("jwt", { session: false }),
    controller.updateAppointment
);

router.patch(
    "/restore-appointment/:id",
    // passport.authenticate("jwt", { session: false }),
    controller.restoreAppointment
);

module.exports = router;
