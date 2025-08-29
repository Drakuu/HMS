import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllTestBills, fetchRadiologyBills } from '../../../features/labBill/LabBillSlice';
import BillingHeader from './BillingHeader';
import BillingTable from './BillsTable';
import { toast } from 'react-toastify';

const AllBills = () => {
  const dispatch = useDispatch();
  const { 
    data: labBills = [], 
    status: labStatus, 
    error: labError 
  } = useSelector(state => state.labBill.allBills || {});
  const { 
    bills: radiologyBills = [], 
    loading: radiologyLoading, 
    error: radiologyError 
  } = useSelector(state => state.labBill || {});

  useEffect(() => {
    const fetchLabBills = async () => {
      try {
        await dispatch(getAllTestBills()).unwrap();
      } catch (error) {
        toast.error(`Failed to load lab bills: ${error.message || 'Unknown error'}`);
        console.error('Failed to fetch lab bills:', error);
      }
    };

    const fetchRadiologyBillsAsync = async () => {
      try {
        await dispatch(fetchRadiologyBills()).unwrap();
      } catch (error) {
        toast.error(`Failed to load radiology bills: ${error.message || 'Unknown error'}`);
        console.error('Failed to fetch radiology bills:', error);
      }
    };
    
    fetchLabBills();
    fetchRadiologyBillsAsync();
  }, [dispatch]);

  return (
    <div className="">
      <div className="">
        {/* Loading State */}
        {(labStatus === 'loading' || radiologyLoading) && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {(labStatus === 'failed' || radiologyError) && (
          <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md">
            <div className="flex items-center">
              <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="font-bold">Error Loading Bills</h3>
            </div>
            <p className="mt-2">
              {labError?.message || radiologyError || 'An unknown error occurred while fetching bills.'}
            </p>
            {(labError?.statusCode || radiologyError) && (
              <p className="text-sm mt-1">Error code: {labError?.statusCode || 'N/A'}</p>
            )}
            <button
              onClick={() => {
                dispatch(getAllTestBills());
                dispatch(fetchRadiologyBills());
              }}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {/* Success State */}
        {(labStatus === 'succeeded' || radiologyBills.length > 0) && (
          <BillingTable 
            labBills={labBills} 
            radiologyBills={radiologyBills} 
            getAllTestBills={getAllTestBills}
            fetchRadiologyBills={fetchRadiologyBills}
          />
        )}
      </div>
    </div>
  );
};

export default AllBills;