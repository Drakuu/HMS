// components/RefundSuccess.jsx
import React from 'react';
import { FiCheckCircle, FiPrinter, FiCopy, FiAlertCircle } from 'react-icons/fi';

const RefundSuccess = ({ refund, patient, visit, onNewRefund }) => {
   // Safe format function with fallbacks
   const formatCurrency = (amount) => {
      return new Intl.NumberFormat('en-PK', {
         style: 'currency',
         currency: 'PKR'
      }).format(amount || 0);
   };

   // Safe reason formatting with fallback
   const formatRefundReason = (reason) => {
      if (!reason) return 'Not specified';

      // Handle both string and object types
      const reasonString = typeof reason === 'string' ? reason : String(reason);

      return reasonString
         .replace(/_/g, ' ')
         .replace(/\b\w/g, l => l.toUpperCase());
   };

   // Safe date formatting with fallback
   const formatDate = (date) => {
      if (!date) return 'Date not available';

      try {
         return new Date(date).toLocaleDateString();
      } catch (error) {
         return 'Invalid date';
      }
   };

   const handlePrint = () => {
      window.print();
   };

   const handleCopyDetails = () => {
      const details = `
      Refund ID: ${refund?._id || 'N/A'}
      Patient: ${patient?.patient_Name || 'N/A'} (MR: ${patient?.patient_MRNo || 'N/A'})
      Amount: ${formatCurrency(refund?.refundAmount)}
      Date: ${formatDate(refund?.refundDate)}
      Reason: ${formatRefundReason(refund?.refundReason)}
    `;

      navigator.clipboard.writeText(details)
         .then(() => {
            // Show success message (you can use a toast library here)
            alert('Refund details copied to clipboard!');
         })
         .catch(err => {
            console.error('Failed to copy details: ', err);
         });
   };

   // Check if required data is available
   if (!refund || !patient || !visit) {
      return (
         <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-center mb-6">
               <FiAlertCircle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-gray-800 mb-2">Data Not Available</h2>
               <p className="text-gray-600">Some refund information is missing or incomplete.</p>
            </div>

            <div className="flex justify-center">
               <button
                  onClick={onNewRefund}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
               >
                  Start New Refund
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="bg-white rounded-lg shadow-md p-6">
         <div className="text-center mb-6">
            <FiCheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Refund Processed Successfully!</h2>
            <p className="text-gray-600">The refund has been processed and recorded in the system.</p>
         </div>

         <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-green-800 mb-3">Refund Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="text-green-700">Refund ID:</span>
                  <span className="font-medium ml-2">{refund._id || 'N/A'}</span>
               </div>
               <div>
                  <span className="text-green-700">Amount:</span>
                  <span className="font-medium ml-2">{formatCurrency(refund.refundAmount)}</span>
               </div>
               <div>
                  <span className="text-green-700">Date:</span>
                  <span className="font-medium ml-2">
                     {formatDate(refund.refundDate)}
                  </span>
               </div>
               <div>
                  <span className="text-green-700">Status:</span>
                  <span className="font-medium ml-2 capitalize">
                     {refund.status || refund.refundStatus || 'completed'}
                  </span>
               </div>
               <div>
                  <span className="text-green-700">Reason:</span>
                  <span className="font-medium ml-2 capitalize">
                     {formatRefundReason(refund.refundReason)}
                  </span>
               </div>
               <div>
                  <span className="text-green-700">Method:</span>
                  <span className="font-medium ml-2 capitalize">
                     {refund.refundMethod || 'cash'}
                  </span>
               </div>
            </div>
         </div>

         <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-800 mb-3">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
               <div>
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium ml-2">{patient.patient_Name || 'N/A'}</span>
               </div>
               <div>
                  <span className="text-gray-600">MR Number:</span>
                  <span className="font-medium ml-2">{patient.patient_MRNo || 'N/A'}</span>
               </div>
               {patient.patient_ContactNo && (
                  <div>
                     <span className="text-gray-600">Contact:</span>
                     <span className="font-medium ml-2">{patient.patient_ContactNo}</span>
                  </div>
               )}
               <div>
                  <span className="text-gray-600">Visit Date:</span>
                  <span className="font-medium ml-2">
                     {formatDate(visit.visitDate)}
                  </span>
               </div>
            </div>
         </div>

         <div className="flex justify-center gap-4 flex-wrap">
            <button
               onClick={handleCopyDetails}
               className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
               <FiCopy className="mr-2" />
               Copy Details
            </button>
            <button
               onClick={handlePrint}
               className="flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
               <FiPrinter className="mr-2" />
               Print Receipt
            </button>
            <button
               onClick={onNewRefund}
               className="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50"
            >
               New Refund
            </button>
         </div>
      </div>
   );
};

export default RefundSuccess;