import { Routes, Route } from "react-router-dom";
import {
  DoctorDashboard,
AcceptAppointment,

} from "../pages/doctor/doctorPages";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
        <Route element={<DynamicLayout />}>

          <Route path="dashboard" element={<DoctorDashboard />} />
          <Route path="aappointments" element={<AcceptAppointment />} />

        
        </Route>
      </Route>
    </Routes>
  );
};

export default DoctorRoutes;