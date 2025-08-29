import React from 'react';
import { FiUser, FiPrinter, FiEdit, FiTrash2 } from 'react-icons/fi';
import { AiOutlineEye } from "react-icons/ai";

const PatientsTable = ({ filteredPatients, handleView, handleEditClick, setModals }) => {
  const handlePrintPatient = (patient) => {
    // Print logic here
    console.log("Print patient:", patient);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient Info
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                MR Number
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admission Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admission Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ward Information
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Diagnosis
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredPatients.map((patient) => (
              <tr key={patient._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <FiUser className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{patient.patient_Name}</div>
                      <div className="text-sm text-gray-500">
                        {patient.patient_Age}yrs, {patient.patient_Gender}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono">{patient.patient_MRNo}</div>
                  <div className="text-sm text-gray-500">{patient.patient_CNIC || 'N/A'}</div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(patient.admission_Details?.admission_Date).toLocaleDateString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(patient.admission_Details?.admission_Date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </td>

               <td className="px-6 py-4 whitespace-nowrap">
  <div className="text-sm text-gray-900">
    {patient.admission_Details?.admission_Type || 'N/A'}
  </div>
</td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {patient.ward_Information?.ward_Type || 'Not assigned'}
                    </div>
                    <div className="text-sm text-gray-500">
                      {patient.ward_Information?.wardDetails?.assignedBed
                        ? `Bed ${patient.ward_Information.wardDetails.assignedBed.bedNumber}`
                        : patient.ward_Information?.bed_No
                          ? `Bed ${patient.ward_Information.bed_No} (unconfirmed)`
                          : 'Bed not assigned'}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${patient.status === 'Discharged' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}
                  `}>
                    {patient.status}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {patient.admission_Details?.diagnosis || 'Not specified'}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <button
                      onClick={() => handleView(patient.patient_MRNo)}
                      className="text-primary-600 border border-primary-200 hover:text-primary-900 p-1 rounded-md hover:bg-primary-50"
                      aria-label={`View ${patient.patient_Name}`}
                    >
                      <AiOutlineEye className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handlePrintPatient(patient)}
                      className="text-blue-600 border border-blue-200 hover:text-blue-900 p-1 rounded-md hover:bg-blue-50"
                      title="Print"
                    >
                      <FiPrinter className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEditClick(patient)}
                      className="text-indigo-600 border border-purple-300 hover:text-indigo-900 p-1 rounded-md hover:bg-indigo-50"
                      title="Edit"
                    >
                      <FiEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setModals(prev => ({ ...prev, delete: { show: true, patientId: patient._id } }))}
                      className="text-red-600 border border-red-300 hover:text-red-900 p-1 rounded-md hover:bg-red-50"
                      title="Delete"
                    >
                      <FiTrash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsTable;