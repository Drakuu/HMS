const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");


// Get all test results
router.get('/',

    controller.labBills.getAllTestBills
);

// Get patient by result ID
router.get('/:patientTestId',

    controller.labBills.getTestBillsByPatientTestId,
);

router.patch('/bill/refund-amount-by-lab/:patientId',

    controller.labBills.refundAmountbylab,
);


module.exports = router;