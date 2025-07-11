import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ReceptionDashboard, AdminDashboard, HRDashboard, PatientDashboard, Departments, OTPatientDetails, AddStaff, IPDAdmission, AdmittedPatientDetails, IPDForm, DoctorPannel, AddNewDoctor, NewOpd, ManageOpd, OTMain, PatientAppointment, Ward, Inventory, BillList, MedicineList, PrescriptionManagement, StockManagement, Calendar, DoctorDetails,
} from '../pages/reception/ReceptionPages';
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';
import DeletedAppointmentsPage from '../components/ui/DeletedAppointmentsPage';

const ReceptionRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Receptionist']} />}>
        <Route element={<DynamicLayout />}>
          {/* Dashboard routes */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ReceptionDashboard />} />
          <Route path="hr-dashboard" element={<HRDashboard />} />
          <Route path="patient-dashboard" element={<PatientDashboard />} />
          <Route path="admin-dashboard" element={<AdminDashboard />} />

          {/* HR routes */}
          <Route path="departments" element={<Departments />} />
          <Route path="staff" element={<AddStaff />} />

          {/* Doctor routes */}
          <Route path="doctors" element={<DoctorPannel />} />
          <Route path="add-doctor" element={<AddNewDoctor mode="create" />} />
          <Route path="edit-doctor/:doctorId" element={<AddNewDoctor mode="edit" />} />
          <Route path="doctor-details/:doctorId" element={<DoctorDetails />} />

          {/* Rooms management */}
          <Route path="ward-management" element={<Ward />} />

          {/* IPD routes */}
          <Route path="ipd/ssp" element={<IPDForm />} />
          <Route path="ipd/private" element={<IPDForm />} />
          <Route path="ipd/Admitted" element={<IPDAdmission />} />
          <Route path="patient-details/:mrno" element={<AdmittedPatientDetails />} />

          {/* OPD routes */}
          <Route path="opd/newopd" element={<NewOpd mode="create" />} />
          <Route path="opd/edit/:patientMRNo" element={<NewOpd mode="edit" />} />
          <Route path="opd/manage" element={<ManageOpd />} />

          {/* Appointment routes */}
          <Route path="patient-appointment" element={<PatientAppointment />} />
          <Route path="appointment/patient-appointment/deleted" element={<DeletedAppointmentsPage />} />

          {/* OT routes */}
          <Route path="OTMain" element={<OTMain />} />
          <Route path="OTPatientDetails/:mrno" element={<OTPatientDetails />} />

          {/* Inventory routes */}
          <Route path="inventory" element={<Inventory />} />

          {/* Accounts routes */}
          <Route path="account/bill-list" element={<BillList />} />

          {/* Pharmacy routes */}
          <Route path="Med-list" element={<MedicineList />} />
          <Route path="prescription-management" element={<PrescriptionManagement />} />
          <Route path="stock-management" element={<StockManagement />} />

          {/* Calendar route */}
          <Route path="calendar" element={<Calendar />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default ReceptionRoutes;