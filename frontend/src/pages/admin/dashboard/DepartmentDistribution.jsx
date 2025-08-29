// src/components/dashboard/DashboardComponents/DepartmentDistribution.jsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const COLORS = ['#0d9488', '#059669', '#2563eb', '#7c3aed', '#d97706', '#dc2626'];

export const DepartmentDistribution = ({ departments = [], doctors = [] }) => {
  // Count doctors per department with proper error handling
  const departmentStats = React.useMemo(() => {
    if (!Array.isArray(departments)) return [];
    if (!Array.isArray(doctors)) return [];

    return departments.map(dept => {
      const doctorsInDept = doctors.filter(
        doctor => doctor?.doctor_Department === dept?.name
      ).length;
      
      return {
        name: dept?.name || 'Unknown Department',
        value: doctorsInDept,
        doctors: doctorsInDept
      };
    }).filter(dept => dept.value > 0); // Only show departments with doctors
  }, [departments, doctors]);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctors by Department</h3>
      <div className="h-80">
        {departmentStats.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={departmentStats}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                label={({ name }) => name}
              >
                {departmentStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name, props) => [`${value} doctors`, props.payload.name]}
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
            No department data available
          </div>
        )}
      </div>
      {departmentStats.length > 0 && (
        <div className="mt-4 grid grid-cols-2 gap-2">
          {departmentStats.map((dept, index) => (
            <div key={dept.name} className="flex items-center">
              <div
                className="w-3 h-3 rounded-full mr-2"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              ></div>
              <span className="text-sm text-gray-700">
                {dept.name}: <span className="font-medium">{dept.doctors}</span>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};