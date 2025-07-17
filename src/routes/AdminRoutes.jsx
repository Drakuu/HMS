import { Routes, Route } from "react-router-dom";
import { 
  AdminDashboard ,
  StaffPannel,

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

        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;