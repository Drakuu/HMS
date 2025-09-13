import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import {
  NewOpd,
  ManageOpd,
  PatientAppointment,
  RefundManagement,
  OpdRefundList,
  OpdRefundDetail,
  Expenses,
  Summary,
} from '../pages/reception/ReceptionPages';
import AdminDashboard from "../pages/admin/dashboard/AdminDashboard";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import DeletedAppointmentsPage from '../components/ui/DeletedAppointmentsPage';

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Receptionist', 'Admin']} />}>
        <Route element={<DynamicLayout />}>
          {/* Dashboard routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />

          {/* OPD routes */}
          <Route path="opd/newopd" element={<NewOpd mode="create" />} />
          <Route path="opd/edit/:patientMRNo" element={<NewOpd mode="edit" />} />
          <Route path="opd/manage" element={<ManageOpd />} />

          {/* Appointment routes */}
          <Route path="patient-appointment" element={<PatientAppointment />} />
          <Route path="appointment/patient-appointment/deleted" element={<DeletedAppointmentsPage />} />


          {/* REFUND */}
          <Route path="refunds" element={<RefundManagement />} />
          <Route path="manage-refunds" element={<OpdRefundList />} />
          <Route path="refund/details/:id" element={<OpdRefundDetail />} />

          {/* Expense */}
          <Route path="expenses" element={<Expenses />} />

          {/* Summary */}
          <Route path="summary" element={<Summary />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ReceptionRoutes;