// src/components/dashboard/Dashboard.jsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  StatCards,
  RevenueChart,
  DepartmentDistribution,
  DoctorsTable,
  PatientsOverview,
  RecentAdmissions
} from './index';
import { LoadingSpinner, ErrorMessage } from '../../../components/Display/StatusComponents';
import { fetchAllDoctors } from '../../../features/doctor/doctorSlice';
import { fetchPatients } from '../../../features/patient/patientSlice';
import { getallDepartments } from '../../../features/department/DepartmentSlice';

const Dashboard = () => {
  const dispatch = useDispatch();

  // Fetch all data on component mount
  useEffect(() => {
    dispatch(fetchAllDoctors());
    dispatch(fetchPatients());
    dispatch(getallDepartments());
  }, [dispatch]);

  // Get data from Redux store with proper loading states
  const {
    doctors = [],
    loading: doctorsLoading,
    error: doctorsError
  } = useSelector(state => state.doctor);

  const {
    patients: opdPatients = [],
    loading: opdLoading,
    error: opdError
  } = useSelector(state => state.patients);

  const {
    departments = [],
    loading: deptLoading,
    error: deptError
  } = useSelector(state => state.department);

  // Check if any data is still loading
  const isLoading = doctorsLoading || opdLoading || deptLoading;

  // Check if any errors occurred
  const hasError = doctorsError || opdError || deptError ;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (hasError) {
    // Combine all error messages
    const errorMessages = [
      doctorsError,
      opdError,
      deptError,
    ].filter(Boolean).join('\n');

    return <ErrorMessage error={errorMessages} />;
  }

  // Calculate statistics
  // Calculate average percentages and monetary values
  const totalDoctors = doctors.length;
  const avgHospitalPercentage = totalDoctors > 0
    ? doctors.reduce((sum, doctor) => sum + (doctor.doctor_Contract?.hospital_Percentage || 0), 0) / totalDoctors
    : 0;

  const avgDoctorPercentage = totalDoctors > 0
    ? doctors.reduce((sum, doctor) => sum + (doctor.doctor_Contract?.doctor_Percentage || 0), 0) / totalDoctors
    : 0;

  // Calculate monetary values based on revenues
  const totalOpdRevenue = opdPatients.reduce((sum, patient) =>
    sum + (patient.patient_HospitalInformation?.total_Fee || 0), 0);

  const hospitalRevenueShare = (avgHospitalPercentage / 100) * (totalOpdRevenue );
  const doctorRevenueShare = (avgDoctorPercentage / 100) * (totalOpdRevenue );

  const totalOpdPatients = opdPatients.length;

  const totalDepartments = departments.length;


  return (
    <div className="min-h-screen bg-gray-50">
      <main className="px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          <h1 className="text-3xl font-bold text-gray-900">Hospital Overview</h1>

          {/* Stat Cards */}
          <StatCards
            totalOpdPatients={totalOpdPatients}
            avgHospitalPercentage={avgHospitalPercentage}
            avgDoctorPercentage={avgDoctorPercentage}
            hospitalRevenueShare={hospitalRevenueShare}
            doctorRevenueShare={doctorRevenueShare}
            totalDepartments={totalDepartments}
            totalOpdRevenue={totalOpdRevenue}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Revenue Chart */}
            <div className="lg:col-span-2">
              <RevenueChart
                opdPatients={opdPatients}
              />
            </div>

            {/* Department Distribution */}
            <div className="lg:col-span-1">
              <DepartmentDistribution
                departments={departments}
                doctors={doctors}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Doctors Table */}
            <DoctorsTable doctors={doctors} />

            {/* Patients Overview */}
            <PatientsOverview
              opdPatients={opdPatients}
            />
          </div>

          {/* Recent Admissions */}
          {/* <RecentAdmissions patients={admittedPatients.slice(0, 5)} /> */}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;