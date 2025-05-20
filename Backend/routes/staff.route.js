const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

router.post("/create-staff", controller.staff.createStaff);

router.get("/getall-staff", controller.staff.getAllStaff);

router.get('/get-staff-by-id/:id', controller.staff.getStaffById);

router.put('/get-updatestaff-by-id/:id', controller.staff.updateStaffById);

module.exports = router;