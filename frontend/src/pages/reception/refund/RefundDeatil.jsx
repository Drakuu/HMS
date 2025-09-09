import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getRefundById, selectRefundDetails, selectRefundLoading, updateRefundStatus } from '../../../features/refund/refundopdSlice';
import { FiArrowLeft, FiUser, FiDollarSign, FiCalendar, FiFileText, FiCreditCard, FiPrinter, FiEdit, FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const RefundDetailPage = () => {
   const { id } = useParams();
   const navigate = useNavigate();
   const location = useLocation();
   const dispatch = useDispatch();

   const refund = useSelector(selectRefundDetails);
   const loading = useSelector(selectRefundLoading);
   const [updating, setUpdating] = useState(false);

   const patientData = location.state?.patientData || refund?.patient;

   useEffect(() => {
      if (id) {
         dispatch(getRefundById(id));
      }
   }, [id, dispatch]);

   const formatCurrency = (amount) => {
      return `Rs. ${amount?.toLocaleString() || '0'}`;
   };

   const formatDate = (dateString) => {
      if (!dateString) return 'N/A';
      try {
         return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch {
         return 'Invalid Date';
      }
   };

   const handleStatusUpdate = async (newStatus) => {
      setUpdating(true);
      try {
         await dispatch(updateRefundStatus({
            id: refund._id,
            statusData: {
               status: newStatus,
               notes: `Status changed to ${newStatus}`
            }
         })).unwrap();

         toast.success(`Refund ${newStatus} successfully!`);
      } catch (error) {
         toast.error(`Failed to update status: ${error.message}`);
      } finally {
         setUpdating(false);
      }
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading refund details...</p>
            </div>
         </div>
      );
   }

   if (!refund) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
               <FiFileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
               <h2 className="text-2xl font-bold text-gray-900 mb-2">Refund Not Found</h2>
               <p className="text-gray-600 mb-4">The requested refund could not be found.</p>
               <button
                  onClick={() => navigate(-1)}
                  className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700"
               >
                  Go Back
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 py-8">
         <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
               <div className="flex items-center mb-4 sm:mb-0">
                  <button
                     onClick={() => navigate(-1)}
                     className="flex items-center text-primary-600 hover:text-primary-800 mr-6 transition-colors"
                  >
                     <FiArrowLeft className="mr-2 h-5 w-5" />
                     Back to List
                  </button>
                  <div>
                     <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Refund Details</h1>
                     <p className="text-gray-600 text-sm">Refund ID: #{refund._id?.slice(-8).toUpperCase()}</p>
                  </div>
               </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* Main Content */}
               <div className="lg:col-span-2 space-y-6">
                  {/* Refund Card */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex justify-between items-start mb-6">
                        <h2 className="text-xl font-semibold text-gray-900">Refund Information</h2>
                        <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-800`}>
                           Approved
                        </span>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Refund Amount</label>
                              <p className="text-lg font-semibold text-green-600">{formatCurrency(refund.refundAmount)}</p>
                           </div>

                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Original Amount</label>
                              <p className="text-md text-gray-900">{formatCurrency(refund.originalAmount)}</p>
                           </div>

                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Refund Method</label>
                              <p className="text-md text-gray-900 capitalize">{refund.refundMethod || 'N/A'}</p>
                           </div>
                        </div>

                        <div className="space-y-4">
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Original Payment Method</label>
                              <p className="text-md text-gray-900 capitalize">{refund.originalPaymentMethod || 'N/A'}</p>
                           </div>

                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Refund Date</label>
                              <p className="text-md text-gray-900">{formatDate(refund.refundDate)}</p>
                           </div>

                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Processed By</label>
                              <p className="text-md text-gray-900">{refund.processedBy?.user_Name || 'Unknown'}</p>
                           </div>
                        </div>
                     </div>

                     {/* Additional Details */}
                     <div className="mt-6 pt-6 border-t border-gray-200 space-y-4">
                        {refund.refundReason && (
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Reason</label>
                              <p className="text-md text-gray-900">{refund.refundReason}</p>
                           </div>
                        )}

                        {refund.refundDescription && (
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Description</label>
                              <p className="text-md text-gray-900">{refund.refundDescription}</p>
                           </div>
                        )}

                        {refund.notes && (
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Notes</label>
                              <p className="text-md text-gray-900 bg-gray-50 p-3 rounded-lg">{refund.notes}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Patient Information */}
                  {patientData && (
                     <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <div className="flex items-center mb-6">
                           <FiUser className="h-6 w-6 text-primary-600 mr-3" />
                           <h2 className="text-xl font-semibold text-gray-900">Patient Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                              <div>
                                 <label className="block font-semibold text-gray-600 mb-1 ">Patient Name</label>
                                 <p className="text-md font-medium text-gray-900">{patientData.patient_Name}</p>
                              </div>

                              <div>
                                 <label className="block font-semibold text-gray-600 mb-1 ">MR Number</label>
                                 <p className="text-md text-gray-900 font-mono">{patientData.patient_MRNo}</p>
                              </div>

                              <div>
                                 <label className="block font-semibold text-gray-600 mb-1 ">Contact Number</label>
                                 <p className="text-md text-gray-900">{patientData.patient_ContactNo || 'N/A'}</p>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div>
                                 <label className="block font-semibold text-gray-600 mb-1 ">CNIC</label>
                                 <p className="text-md text-gray-900">{patientData.patient_CNIC || 'N/A'}</p>
                              </div>

                              <div>
                                 <label className="block font-semibold text-gray-600 mb-1 ">Age / Gender</label>
                                 <p className="text-md text-gray-900">
                                    {patientData.patient_Age || 'N/A'} / {patientData.patient_Gender ? patientData.patient_Gender.charAt(0).toUpperCase() + patientData.patient_Gender.slice(1) : 'N/A'}
                                 </p>
                              </div>

                              {patientData.patient_Address && (
                                 <div>
                                    <label className="block font-semibold text-gray-600 mb-1 ">Address</label>
                                    <p className="text-md text-gray-900">{patientData.patient_Address}</p>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>
                  )}
               </div>

               {/* Sidebar */}
               <div className="space-y-6">   
                  {/* Timeline Information */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <div className="flex items-center mb-4">
                        <FiCalendar className="h-5 w-5 text-primary-600 mr-2" />
                        <h3 className="text-lg font-semibold text-gray-900">Timeline</h3>
                     </div>

                     <div className="space-y-4">
                        <div>
                           <label className="block font-semibold text-gray-600 mb-1 ">Created Date</label>
                           <p className="text-sm text-gray-900">{formatDate(refund.createdAt)}</p>
                        </div>

                        <div>
                           <label className="block font-semibold text-gray-600 mb-1 ">Last Updated</label>
                           <p className="text-sm text-gray-900">{formatDate(refund.updatedAt)}</p>
                        </div>

                        {refund.authorizedBy && (
                           <div>
                              <label className="block font-semibold text-gray-600 mb-1 ">Authorized By</label>
                              <p className="text-sm text-gray-900">{refund.authorizedBy}</p>
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                     <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>

                     <div className="space-y-3">
                        <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">Original Amount:</span>
                           <span className="text-sm font-medium text-gray-900">{formatCurrency(refund.originalAmount)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                           <span className="text-sm text-gray-600">Refunded:</span>
                           <span className="text-sm font-medium text-green-600">{formatCurrency(refund.refundAmount)}</span>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                           <span className="text-md font-medium text-gray-800">Remaining:</span>
                           <span className="text-md font-bold text-gray-900">
                              {formatCurrency(refund.originalAmount - refund.refundAmount)}
                           </span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default RefundDetailPage;