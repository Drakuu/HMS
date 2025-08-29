const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

router.post("/add-medicine",controller.medicine.createMedicineRecord);

router.get("/get-medicine" , controller.medicine.getAllMedicine);

router.get("/get-medicine-by-id/:id", controller.medicine.getMedicineById);

router.put("/update-medicine-by-id/:id" , controller.medicine.updateMedicineById);

router.delete("/delete-medicine-by-id/:id" , controller.medicine.deleteMedicineById);

module.exports = router; 