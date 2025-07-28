const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

// Staff creation
router.post("/create-staff",
    controller.staff.createStaff
);

// Staff retrieval
router.get("/getall-staff",
    controller.staff.getAllStaff

);
router.get("/get-staff-by-id/:id",
    controller.staff.getStaffById
);

router.get("/get-deleted-staff",
    controller.staff.getDeletedStaff
); // New endpoint

// Staff updates
router.put("/update-staff-by-id/:id",
    controller.staff.updateStaffById
);

// Staff soft delete and restore
router.delete("/soft-delete-staff/:id",
    controller.staff.softDeleteStaff
); // New endpoint

router.patch("/restore-staff/:id",
    controller.staff.restoreStaff
); // New endpoint

module.exports = router;