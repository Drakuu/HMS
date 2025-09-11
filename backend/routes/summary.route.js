const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

// Staff creation
router.get("/summary",
   controller.Summary.getSummary
);
module.exports=router