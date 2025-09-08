// controllers/refundController.js
const hospitalModel = require('../models/index.model');

// Create a new refund with enhanced tracking
exports.createRefund = async (req, res) => {
   try {
      const {
         patientMRNo,
         visitId,
         refundAmount,
         refundReason,
         refundDescription,
         originalPaymentMethod,
         refundMethod,
         notes
      } = req.body;

      // Check if user is authenticated
      if (!req.user || !req.user._id) {
         return res.status(401).json({
            success: false,
            message: 'Authentication required. Please log in again.'
         });
      }

      // Find patient by MR number
      const patient = await hospitalModel.Patient.findOne({ patient_MRNo: patientMRNo });
      if (!patient) {
         return res.status(404).json({
            success: false,
            message: 'Patient not found'
         });
      }

      // Find the specific visit
      const visit = patient.visits.id(visitId);
      if (!visit) {
         return res.status(404).json({
            success: false,
            message: 'Visit not found'
         });
      }

      // Get existing refunds for this visit
      const existingRefunds = await hospitalModel.Refund.find({ visit: visitId });
      const totalAlreadyRefunded = existingRefunds.reduce((sum, refund) => sum + refund.refundAmount, 0);

      const maxRefundable = visit.amountPaid - totalAlreadyRefunded;

      if (refundAmount > maxRefundable) {
         return res.status(400).json({
            success: false,
            message: `Refund amount exceeds maximum refundable amount of ${maxRefundable}. Already refunded: ${totalAlreadyRefunded}`
         });
      }

      if (refundAmount <= 0) {
         return res.status(400).json({
            success: false,
            message: 'Refund amount must be greater than zero'
         });
      }

      // Create refund with original amount tracking
      const refund = new hospitalModel.Refund({
         patient: patient._id,
         visit: visitId,
         originalAmount: visit.amountPaid, // Store the original amount paid
         refundAmount,
         refundReason,
         refundDescription,
         originalPaymentMethod: visit.paymentMethod || originalPaymentMethod,
         refundMethod,
         processedBy: req.user._id,
         notes
      });

      await refund.save();

      // Update visit with refund information
      visit.totalRefunded = (visit.totalRefunded || 0) + refundAmount;
      visit.remainingAmount = visit.amountPaid - visit.totalRefunded;
      visit.refundStatus = visit.remainingAmount === 0 ? 'fully_refunded' :
         visit.totalRefunded > 0 ? 'partially_refunded' : 'not_refunded';

      await patient.save();

      // Populate data for response
      await refund.populate('patient', 'patient_MRNo patient_Name');
      await refund.populate('processedBy', 'user_Name user_Email');

      res.status(201).json({
         success: true,
         message: 'Refund processed successfully',
         data: {
            refund,
            visitSummary: {
               originalAmount: visit.amountPaid,
               totalRefunded: visit.totalRefunded,
               remainingAmount: visit.remainingAmount,
               refundStatus: visit.refundStatus
            }
         }
      });

   } catch (error) {
      console.error('Error creating refund:', error);

      if (error.name === 'ValidationError') {
         return res.status(400).json({
            success: false,
            message: Object.values(error.errors).map(err => err.message).join(', ')
         });
      }

      res.status(500).json({
         success: false,
         message: 'Server error while creating refund'
      });
   }
};

// Get refunds by patient MR number
exports.getRefundsByMRNumber = async (req, res) => {
   try {
      const { mrNumber } = req.params;

      // Find patient first to get their ID
      const patient = await hospitalModel.Patient.findOne({ patient_MRNo: mrNumber });
      if (!patient) {
         return res.status(404).json({
            success: false,
            message: 'Patient not found'
         });
      }

      // Now find refunds for this patient
      const refunds = await hospitalModel.Refund.find({ patient: patient._id })
         .populate('patient', 'patient_MRNo patient_Name')
         .sort({ refundDate: -1 });

      res.json({
         success: true,
         data: refunds
      });

   } catch (error) {
      console.error('Error fetching refunds:', error);
      res.status(500).json({
         success: false,
         message: 'Server error while fetching refunds'
      });
   }
};

// Get patient visits for refund selection
exports.getPatientVisitsForRefund = async (req, res) => {
   try {
      const { mrNumber } = req.params;

      const patient = await hospitalModel.Patient.findOne({ patient_MRNo: mrNumber })
         .select('visits patient_Name patient_MRNo totalAmountPaid');

      if (!patient) {
         return res.status(404).json({
            success: false,
            message: 'Patient not found'
         });
      }

      // Calculate refundable amount per visit
      const visitsWithRefundInfo = await Promise.all(
         patient.visits.map(async (visit) => {
            const visitRefunds = await hospitalModel.Refund.find({
               visit: visit._id,
               status: { $in: ['approved', 'processed'] }
            });

            const totalRefunded = visitRefunds.reduce((sum, refund) => sum + refund.refundAmount, 0);
            const refundable = visit.amountPaid - totalRefunded;

            return {
               _id: visit._id,
               visitDate: visit.visitDate,
               doctor: visit.doctor,
               purpose: visit.purpose,
               amountPaid: visit.amountPaid,
               totalRefunded,
               refundable,
               canRefund: refundable > 0
            };
         })
      );

      res.json({
         success: true,
         data: {
            patient: {
               _id: patient._id,
               patient_MRNo: patient.patient_MRNo,
               patient_Name: patient.patient_Name,
               totalAmountPaid: patient.totalAmountPaid
            },
            visits: visitsWithRefundInfo
         }
      });

   } catch (error) {
      console.error('Error fetching patient visits:', error);
      res.status(500).json({
         success: false,
         message: 'Server error while fetching patient visits'
      });
   }
};

// Update refund status
exports.updateRefundStatus = async (req, res) => {
   try {
      const { id } = req.params;
      const { status, notes, authorizedBy } = req.body;

      const refund = await hospitalModel.Refund.findById(id);
      if (!refund) {
         return res.status(404).json({
            success: false,
            message: 'Refund not found'
         });
      }

      refund.status = status;
      if (notes) refund.notes = notes;
      if (authorizedBy) refund.authorizedBy = authorizedBy;

      await refund.save();
      await refund.populate('patient', 'patient_MRNo patient_Name');

      res.json({
         success: true,
         message: 'Refund status updated successfully',
         data: refund
      });

   } catch (error) {
      console.error('Error updating refund status:', error);
      res.status(500).json({
         success: false,
         message: 'Server error while updating refund status'
      });
   }
};