// src/components/dashboard/DashboardComponents/PatientsOverview.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const PatientsOverview = ({ admittedPatients = [], opdPatients = [] }) => {
  // Process data for the chart with proper error handling
  const processPatientData = () => {
    const departmentMap = {};
    
    // Safely process admitted patients
    if (Array.isArray(admittedPatients)) {
      admittedPatients.forEach(patient => {
        try {
          const dept = patient?.ward_Information?.department_Name || 
                      patient?.ward_Information?.ward_Type || 
                      'Unknown';
          departmentMap[dept] = departmentMap[dept] || { admitted: 0, opd: 0 };
          departmentMap[dept].admitted += 1;
        } catch (error) {
          console.error('Error processing admitted patient:', error);
        }
      });
    }
    
    // Safely process OPD patients
    if (Array.isArray(opdPatients)) {
      opdPatients.forEach(patient => {
        try {
          const dept = patient?.patient_HospitalInformation?.doctor_Department || 
                      'Unknown';
          departmentMap[dept] = departmentMap[dept] || { admitted: 0, opd: 0 };
          departmentMap[dept].opd += 1;
        } catch (error) {
          console.error('Error processing OPD patient:', error);
        }
      });
    }
    
    // Convert to array format and sort by total patients
    const result = Object.entries(departmentMap).map(([name, counts]) => ({
      name,
      Admitted: counts.admitted,
      OPD: counts.opd,
      Total: counts.admitted + counts.opd
    })).sort((a, b) => b.Total - a.Total);
    
    return result;
  };

  const chartData = processPatientData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Patients by Department</h3>
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                stroke="#6b7280" 
                angle={-45} 
                textAnchor="end"
                height={60}
              />
              <YAxis stroke="#6b7280" />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend />
              <Bar
                dataKey="Admitted"
                fill="#0d9488" // teal-600
                radius={[4, 4, 0, 0]}
                name="Admitted Patients"
              />
              <Bar
                dataKey="OPD"
                fill="#7c3aed" // violet-600
                radius={[4, 4, 0, 0]}
                name="OPD Visits"
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No patient data available
          </div>
        )}
      </div>
    </div>
  );
};