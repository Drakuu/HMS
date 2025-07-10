const express = require("express");
const router = express.Router();
const createTest  = require('../controllers/index.controller');

// POST: Create a new test
router.post('/createtest', createTest.testManagement.createTest);

router.get('/getAlltest',createTest.testManagement.getTests )

router.get('/gettestbyId/:id',createTest.testManagement.getTestById )

router.put('/updateTest/:id',createTest.testManagement.updateTest )


module.exports = router;
