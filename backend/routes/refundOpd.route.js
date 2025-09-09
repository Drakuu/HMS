// routes/refundRoutes.js
const express = require('express');
const router = express.Router();
const controller = require('../controllers/index.controller');
const authenticateJWT = require('../middleware/auth');
const { checkRole } = require('../middleware/roleMiddleware');

// All routes require authentication
router.use(authenticateJWT);

// Create refund - Only receptionist and admin can create refunds
router.post('/refunds',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.createRefund);

// Get all refunds with filtering - Receptionist, admin, and accountant can access
router.get('/refunds',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.getRefunds);

// Get refund by ID - Receptionist, admin, and accountant can access
router.get('/refunds/:id',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.getRefundById);

// Get refunds by patient MR number - Receptionist and admin can access
router.get('/refunds/patient/:mrNumber',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.getRefundsByMRNumber);

// Get patient visits for refund selection - Receptionist and admin can access
router.get('/refunds/patient/:mrNumber/visits',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.getPatientVisitsForRefund);

// Update refund status - Only admin and receptionist can update status
router.patch('/refunds/:id/status',
   checkRole(['Admin', 'Receptionist']),
   controller.Refund.updateRefundStatus);

// Get refund statistics - Admin and accountant can access
router.get('/refunds/statistics',
   checkRole(['Admin', 'Receptionist']),
   controller.Refund.getRefundStatistics);

// Legacy route for backward compatibility (if needed)
router.get('/get-all',
   // checkRole(['Receptionist', 'Admin']),
   controller.Refund.getRefunds);

module.exports = router;