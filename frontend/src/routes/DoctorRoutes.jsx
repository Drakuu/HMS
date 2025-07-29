import { Routes, Route } from "react-router-dom";
import {
  DoctorDashboard,
  Appointment,
  PatientRecords,
  PatientDetails,
  Prescription,
  Report,
  Settings,
  Note

} from "../pages/doctor/doctorPages";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Doctor' ,'Admin']} />}>
        <Route element={<DynamicLayout />}>

          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="book-appointments" element={<Appointment />} />

          <Route path="patient-records" element={<PatientRecords />} />
          <Route path="patient-records/:patientId" element={<PatientDetails />} />

          <Route path="prescriptions" element={<Prescription />} />
          
          <Route path="reports" element={<Report />} />

          <Route path="settings" element={<Settings />} />

          <Route path="notes" element={<Note />} />


        </Route>
      </Route>
    </Routes>
  );
};

export default DoctorRoutes;