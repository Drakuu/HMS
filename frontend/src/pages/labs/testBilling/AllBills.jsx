import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllTestBills } from '../../../features/labBill/LabBillSlice';
import BillingHeader from './BillingHeader';
import BillingTable from './BillsTable';

const AllBills = () => {
  const dispatch = useDispatch();
  const { data: bills, status } = useSelector(state => state.labBill.allBills);

  useEffect(() => {
    dispatch(getAllTestBills({ page: 1, limit: 10 }));
  }, [dispatch]);

  console.log("Redux state data:", { bills, status });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <BillingHeader title="Test Bills" />

      <div className="mt-6 bg-white rounded-lg shadow-lg p-6 space-y-6">
        {/* Loading State */}
        {status === 'loading' && (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded-md animate-pulse"></div>
            ))}
          </div>
        )}

        {/* Error State */}
        {status === 'failed' && (
          <div className="p-4 bg-red-100 text-red-700 rounded-md">
            <p>Error loading bills. Please try again later.</p>
          </div>
        )}

        {/* Success State */}
        {status === 'succeeded' && bills.length > 0 ? (
          <BillingTable bills={bills} />
        ) : status === 'succeeded' && bills.length === 0 ? (
          <div className="p-2 bg-gray-100 text-gray-700 rounded-md">
            <p>No bills found.</p>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default AllBills;
