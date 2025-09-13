// src/components/dashboard/DashboardComponents/StatCards.jsx
import React from 'react';
import {
  Users,
  Stethoscope,
  Home,
  Bed,
  ClipboardList,
  Percent,
  DollarSign,
  Activity,
  FlaskConical,
  UserCheck,
  UserX
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color, subtitle, secondaryValue }) => (
  <div className="bg-white rounded-lg shadow p-6 border-t-4" style={{ borderTopColor: color }}>
    <div className="flex items-center">
      <div className="p-3 rounded-full mr-4" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        {secondaryValue && (
          <p className="text-sm font-medium mt-1" style={{ color }}>
            {secondaryValue}
          </p>
        )}
        {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
);

export const StatCards = ({
  totalAdmittedPatients,
  totalOpdPatients,
  avgHospitalPercentage,
  avgDoctorPercentage,
  hospitalRevenueShare,
  doctorRevenueShare,
  totalWards,
  totalBeds,
  totalDepartments,
  totalOpdRevenue,
  totalIpdRevenue,
  totalLabRevenue,
  totalInternalLabPatients,
  totalExternalLabPatients
}) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {/* Revenue Share Cards */}
    <StatCard
      title="Hospital Share"
      value={`${avgHospitalPercentage.toFixed(1)}%`}
      secondaryValue={`PKR ${hospitalRevenueShare.toLocaleString()}`}
      icon={Percent}
      color="#3B82F6" // blue-500
      subtitle="Average revenue share"
    />
    <StatCard
      title="Doctor Share"
      value={`${avgDoctorPercentage.toFixed(1)}%`}
      secondaryValue={`PKR ${doctorRevenueShare.toLocaleString()}`}
      icon={Percent}
      color="#10B981" // emerald-500
      subtitle="Average revenue share"
    />

    {/* Revenue Cards */}
    <StatCard
      title="OPD Revenue"
      value={`PKR ${totalOpdRevenue.toLocaleString()}`}
      icon={DollarSign}
      color="#8B5CF6" // violet-500
      subtitle="Total outpatient revenue"
    />
    <StatCard
      title="OPD Patients"
      value={totalOpdPatients}
      icon={Users}
      color="#059669" // emerald-600
      subtitle="Outpatient visits"
    />
    <StatCard
      title="Departments"
      value={totalDepartments}
      icon={ClipboardList}
      color="#9333ea" // purple-600
      subtitle="Medical specialties"
    />
  </div>
);