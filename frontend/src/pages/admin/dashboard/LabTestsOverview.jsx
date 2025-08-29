// src/components/dashboard/DashboardComponents/LabTestsOverview.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0d9488', '#059669', '#2563eb'];

export const LabTestsOverview = ({ patientTests = [], totalTests = 0, totalTestRevenue = 0 }) => {
  // Safely calculate test statistics
  const testStats = React.useMemo(() => {
    if (!Array.isArray(patientTests)) return [];
    
    const internalPatients = patientTests.filter(test => !test?.isExternalPatient).length || 0;
    const externalPatients = patientTests.filter(test => test?.isExternalPatient).length || 0;
    
    return [
      {
        name: 'Internal Patients',
        value: internalPatients,
        color: COLORS[0]
      },
      {
        name: 'External Patients',
        value: externalPatients,
        color: COLORS[1]
      },
      {
        name: 'Total Tests',
        value: totalTests,
        color: COLORS[2]
      }
    ];
  }, [patientTests, totalTests]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Lab Tests Overview</h3>
        <div className="text-right">
          <p className="text-sm text-gray-500">Total Revenue</p>
          <p className="text-xl font-bold text-teal-600">
            PKR {totalTestRevenue.toLocaleString()}
          </p>
        </div>
      </div>
      <div className="h-64">
        {testStats.length > 0 && testStats.some(stat => stat.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={testStats.filter(stat => stat.value > 0)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name }) => name}
              >
                {testStats.filter(stat => stat.value > 0).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [`${value}`, props.payload.name]}
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.375rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500">
            No lab test data available
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4">
        {testStats.map((stat, index) => (
          <div key={stat.name} className="text-center">
            <div className="text-2xl font-bold" style={{ color: stat.color }}>
              {stat.value}
            </div>
            <div className="text-sm text-gray-500">{stat.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};