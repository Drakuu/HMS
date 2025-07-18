const express = require('express');
const router = express.Router();
const controller = require('../controllers/index.controller');

// Route to create a new ward and assign it to a department by name
router.post('/add-ward', controller.ward.createWard);

router.get('/get-all-ward', controller.ward.getAllWards)

router.get('/get-all-wards-by-dept/:departmentId', controller.ward.getWardsByDepartment);


router.put('/get-ward-by-id/:id', controller.ward.updateWardById);

module.exports = router;
