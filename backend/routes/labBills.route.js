const express = require("express");
const router = express.Router();
const controller = require("../controllers/index.controller");
const passport = require("../middleware/passportAuth.middleware");
const middleware = require("../middleware/index.middleware");

// Get all test results
router.get('/',
    passport.authenticate("jwt", { session: false }),
    controller.labBills.getAllTestBills
);

// Get patient by result ID
router.get('/bill/detailtestbill/:patientTestId', 
passport.authenticate("jwt", { session: false }),
controller.labBills.getTestBillsByPatientTestId,
);

router.patch('/bill/refund-amount-by-lab/:patientId', 
passport.authenticate("jwt", { session: false }),
controller.labBills.refundAmountbylab,
);

router.patch('/bill/finalize-amount-by-radiology/:radiologyId', 
passport.authenticate("jwt", { session: false }),
controller.labBills.finalizeRadiologyPayment,
);


router.patch('/bill/refund-amount-by-radiology/:radiologyId', 
passport.authenticate("jwt", { session: false }),
controller.labBills.refundRadiologyPayment,
);


router.get('/bill/get-all-radiology-bills', 
passport.authenticate("jwt", { session: false }),
controller.labBills.getAllRadiologyBills,
);

router.get('/bill/get-detial-radiology-bill/:id', 
passport.authenticate("jwt", { session: false }),
controller.labBills.getRadiologyBillDetailById,
);

router.get('/bill/get-summery-radiology-bills', 
passport.authenticate("jwt", { session: false }),
controller.labBills.getLabBillSummary,
);
module.exports = router;