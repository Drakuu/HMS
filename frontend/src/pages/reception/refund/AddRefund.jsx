// pages/RefundManagement.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import RefundSearch from './components/RefundSearch';
import VisitSelection from './components/VisitSelection';
import RefundForm from './components/RefundForm';
import RefundSuccess from './components/RefundSuccess';
import { FiArrowLeft, FiDollarSign, FiUser } from 'react-icons/fi';
import { clearPatientData } from '../../../features/patient/patientSlice';

const RefundManagement = () => {
   const dispatch = useDispatch();
   const { patientData, visits, refunds, refundSummary } = useSelector((state) => state.patients);

   const [currentStep, setCurrentStep] = useState('search');
   const [selectedVisit, setSelectedVisit] = useState(null);
   const [processedRefund, setProcessedRefund] = useState(null);

   const handlePatientSelect = (patientData) => {
      setCurrentStep('visit-selection');
   };

   const handleVisitSelect = (visit) => {
      setSelectedVisit(visit);
      setCurrentStep('refund-form');
   };

   const handleRefundSuccess = (refundData) => {
      setProcessedRefund(refundData);
      setCurrentStep('success');
   };

   const handleBack = () => {
      if (currentStep === 'visit-selection') {
         setCurrentStep('search');
      } else if (currentStep === 'refund-form') {
         setSelectedVisit(null);
         setCurrentStep('visit-selection');
      } else if (currentStep === 'success') {
         setProcessedRefund(null);
         setSelectedVisit(null);
         dispatch(clearPatientData());
         setCurrentStep('search');
      }
   };

   const handleNewRefund = () => {
      setProcessedRefund(null);
      setSelectedVisit(null);
      dispatch(clearPatientData());
      setCurrentStep('search');
   };

   return (
      <div>
         <div className="">
            {/* Header */}
            <div className="flex items-center mb-3  bg-primary-700 p-9 rounded-lg shadow-md">
               {currentStep !== 'search' && (
                  <button
                     onClick={handleBack}
                     className="flex items-center bg-primary-100 p-1  rounded-tr-lg  text-primary-600 hover:text-primary-700 mr-4 "
                  >
                     <FiArrowLeft className="mr-1" />
                     Back
                  </button>
               )}
               <div className="flex items-center border-l-4 border-primary-300 pl-4">
                  <div className="bg-primary-100 p-3 rounded-full mr-4">
                     <FiDollarSign className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                     <h1 className="text-2xl font-bold text-gray-100">Refund Management</h1>
                     <p className="text-gray-200">Process patient refunds efficiently</p>
                  </div>
               </div>
            </div>

            {/* Content */}
            {currentStep === 'search' && (
               <RefundSearch onPatientSelect={handlePatientSelect} />
            )}

            {currentStep === 'visit-selection' && patientData && (
               <VisitSelection
                  patientData={patientData}
                  visits={visits}
                  onVisitSelect={handleVisitSelect}
                  onCancel={handleBack}
               />
            )}

            {currentStep === 'refund-form' && patientData && selectedVisit && (
               <RefundForm
                  patient={patientData}
                  visit={selectedVisit}
                  onCancel={handleBack}
                  onSuccess={handleRefundSuccess}
               />
            )}

            {currentStep === 'success' && processedRefund && patientData && (
               <RefundSuccess
                  refund={processedRefund}
                  patient={patientData}
                  visit={selectedVisit}
                  onNewRefund={handleNewRefund}
               />
            )}
         </div>
      </div>
   );
};

export default RefundManagement;