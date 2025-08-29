const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const { passportAuth, checkRole, doctorOnly } = require('../middleware/index.middleware');
// Create Department
router.post("/create-department",
     controller.Department.createDepartments);

// Get All Departments
router.get("/get-departments",
     controller.Department.getAllDepartments);

// Get Department by ID
router.get("/get-departments-by-id/:id",
     controller.Department.getDepartmentById);

// Update Department by ID
router.put("/update-department/:id",
     controller.Department.updateDepartmentById);

// Delete Department by ID
router.delete("/delete-department/:id",
     controller.Department.deleteDepartment);

module.exports = router;

