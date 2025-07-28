import { Routes, Route } from "react-router-dom";
import {
  AdminDashboard,
  StaffPannel,
  AddNewDoctor,
  DoctorPannel,
  DoctorDetails,
  Departments,
  AddStaff,
  StaffListPage,
} from "../pages/admin/AdminPages";
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route element={<DynamicLayout />}>

          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="StaffPannel" element={<StaffPannel />} />

          {/* Doctor routes */}
          <Route path="doctors" element={<DoctorPannel />} />
          <Route path="add-doctor" element={<AddNewDoctor mode="create" />} />
          <Route path="edit-doctor/:doctorId" element={<AddNewDoctor mode="edit" />} />
          <Route path="doctor-details/:doctorId" element={<DoctorDetails />} />
          {/* Depatemrnts Routes*/}
          <Route path="departments" element={<Departments />} />
          {/* staff */}
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/new" element={<AddStaff />} />
          <Route path="staff/edit/:id" element={<AddStaff />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;