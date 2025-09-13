const express = require("express");
const router = express.Router();
const user = require("./user.route");
const doctor = require("./doctor.route");
const patient = require("./patient.route");
const appointment = require("./appointment.route");
const staff=require("./staff.route");
const Department = require("./departments.route");
const Refund = require("./refundOpd.route");  
const expenses = require("./expenses.route");
const summary = require("./summary.route")


router.use("/user", user);
router.use("/doctor", doctor);
router.use("/patient", patient);
router.use("/appointment", appointment);
router.use("/staff", staff);
router.use("/departments",Department);
router.use("/refund",Refund);
router.use("/expense", expenses);
router.use("/summary", summary);


module.exports = router;