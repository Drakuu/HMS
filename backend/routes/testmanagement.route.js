const express = require("express");
const router = express.Router();
const controller = require('../controllers/index.controller');

router.post('/createtest', controller.testManagement.createTest);

router.get('/getAlltest', controller.testManagement.getTests);

router.get('/gettestbyId/:id', controller.testManagement.getTestById);

router.put('/updateTest/:id', controller.testManagement.updateTest);

router.delete('/deleteTest/:id', controller.testManagement.deleteTest);

router.patch('/recoverTest/:id', controller.testManagement.recoverTest);

// New endpoint for common options
router.get('/common-options', controller.testManagement.getCommonOptions);

module.exports = router;