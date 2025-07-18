const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

// Create Department
router.post("/create", controller.ot.createOperation);
router.get("/get-all", controller.ot.getAllOperations);
router.get("/get-mrno/:mrno", controller.ot.getOperationsByMrno);
router.put("/update/:mrno", controller.ot.updateOperationByMrno);
router.delete("/delete/:mrno", controller.ot.deleteOperation);

module.exports = router;
