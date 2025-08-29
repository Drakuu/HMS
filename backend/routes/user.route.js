const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");

router.post("/sign-up", controller.user.signUp); // 
router.post("/log-in", controller.user.login); // 

router.post("/verify-email", controller.user.VerifyEmail); // 


module.exports = router;