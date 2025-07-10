const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

router.post("/add-inventory" , controller.inventory.createInventory);
router.get("/get-inventory-records" , controller.inventory.getAllInventoryData);
router.get("/get-inventory-by-id/:id" , controller.inventory.getInventoryById);
router.put("/update-inventory-by-id/:id", controller.inventory.updateInventoryById);
router.delete("/delete-inventory-by-id/:id", controller.inventory.deleteInventoryById);

module.exports = router;