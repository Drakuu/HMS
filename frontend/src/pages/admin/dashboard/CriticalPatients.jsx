// src/components/dashboard/DashboardComponents/CriticalPatients.jsx
import React from 'react';
import { AlertCircle, Clock, CheckCircle } from 'lucide-react';

const StatusBadge = ({ status }) => {
  let bgColor, textColor, Icon;
  
  if (status === 'Critical') {
    bgColor = 'bg-red-100';
    textColor = 'text-red-800';
    Icon = AlertCircle;
  } else if (status === 'Unpaid') {
    bgColor = 'bg-yellow-100';
    textColor = 'text-yellow-800';
    Icon = Clock;
  } else {
    bgColor = 'bg-green-100';
    textColor = 'text-green-800';
    Icon = CheckCircle;
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      <Icon className="w-3 h-3 mr-1" />
      {status}
    </span>
  );
};

export const CriticalPatients = ({ patients = [] }) => {
  // Safely process patients data
  const criticalPatients = React.useMemo(() => {
    if (!Array.isArray(patients)) return [];
    
    return patients.filter(patient => {
      const isCritical = patient?.status === 'Critical';
      const isUnpaid = patient?.financials?.payment_Status === 'Unpaid';
      return isCritical || isUnpaid;
    });
  }, [patients]);

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 bg-red-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-red-800 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Critical/Unpaid Patients
          </h3>
          <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {criticalPatients.length} Active
          </span>
        </div>
      </div>
      <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
        {criticalPatients.length > 0 ? (
          criticalPatients.map((patient) => (
            <div key={patient?._id || Math.random()} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {patient?.patient_Name || 'Unknown Patient'} ({patient?.patient_MRNo || 'No MRNo'})
                  </h4>
                  <p className="text-sm text-gray-500">
                    {patient?.ward_Information?.ward_Type || 'Unknown Ward'} • Bed {patient?.ward_Information?.bed_No || 'N/A'}
                  </p>
                  {patient?.admission_Details?.admission_Date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Admitted On: {new Date(patient.admission_Details.admission_Date).toLocaleDateString()}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <StatusBadge 
                    status={patient?.financials?.payment_Status === 'Unpaid' ? 'Unpaid' : 'Critical'}
                  />
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    PKR {patient?.financials?.total_Charges || 0}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No critical patients</h3>
            <p className="mt-1 text-sm text-gray-500">All patients are stable and accounts are paid.</p>
          </div>
        )}
      </div>
    </div>
  );
};