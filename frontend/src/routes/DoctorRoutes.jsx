import { Routes, Route } from "react-router-dom";
import {
  DoctorDashboard,

} from "../pages/doctor/doctorPages";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const DoctorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
        <Route element={<DynamicLayout />}>

          <Route path="dashboard" element={<DoctorDashboard />} />

        
        </Route>
      </Route>
    </Routes>
  );
};

export default DoctorRoutes;