// src/components/dashboard/DashboardComponents/RevenueChart.jsx
import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const RevenueChart = ({ admittedPatients = [], opdPatients = [] }) => {
  // Process data for the chart with proper error handling
  const processRevenueData = () => {
    const monthlyData = {};
    
    // Safely process admitted patients
    if (Array.isArray(admittedPatients)) {
      admittedPatients.forEach(patient => {
        try {
          const date = patient?.admission_Details?.admission_Date ? 
            new Date(patient.admission_Details.admission_Date) : new Date();
          const month = date.getMonth();
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              name: monthName,
              admissions: 0,
              revenue: 0,
              opd: 0
            };
          }
          
          monthlyData[month].admissions += 1;
          monthlyData[month].revenue += patient?.financials?.total_Charges || 0;
        } catch (error) {
          console.error('Error processing admitted patient:', error);
        }
      });
    }
    
    // Safely process OPD patients
    if (Array.isArray(opdPatients)) {
      opdPatients.forEach(patient => {
        try {
          const date = patient?.createdAt ? new Date(patient.createdAt) : new Date();
          const month = date.getMonth();
          const monthName = date.toLocaleString('default', { month: 'short' });
          
          if (!monthlyData[month]) {
            monthlyData[month] = {
              name: monthName,
              admissions: 0,
              revenue: 0,
              opd: 0
            };
          }
          
          monthlyData[month].opd += 1;
          monthlyData[month].revenue += patient?.patient_HospitalInformation?.total_Fee || 0;
        } catch (error) {
          console.error('Error processing OPD patient:', error);
        }
      });
    }
    
    // Fill in missing months with zero values
    const allMonths = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(i);
      return date.toLocaleString('default', { month: 'short' });
    });
    
    const completeData = allMonths.map((monthName, index) => {
      return monthlyData[index] || {
        name: monthName,
        admissions: 0,
        revenue: 0,
        opd: 0
      };
    });
    
    return completeData;
  };

  const chartData = processRevenueData();

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Hospital Revenue & Admissions</h3>
      <div className="h-80">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
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
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#0d9488" // teal-600
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="Revenue (PKR)"
              />
              <Line
                type="monotone"
                dataKey="admissions"
                stroke="#2563eb" // blue-600
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="Admissions"
              />
              <Line
                type="monotone"
                dataKey="opd"
                stroke="#059669" // emerald-600
                strokeWidth={2}
                activeDot={{ r: 6 }}
                name="OPD Visits"
              />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No data available for the chart
          </div>
        )}
      </div>
    </div>
  );
};