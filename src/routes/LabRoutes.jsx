import {
  PatientManagment,
  DashboardPannel,
  AddTest,
} from '../pages/labs/labsPages'
import { Navigate, Route, Routes } from 'react-router-dom';
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const LabRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['Lab']} />}>
        <Route element={<DynamicLayout />}> {/* Uncomment this */}
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="test-public" element={<div>Public Test</div>} />
          <Route path="dashboard" element={<DashboardPannel />} /> {/* Remove manual DynamicLayout wrapping */}
          <Route path="add-patient" element={<PatientManagment />} />
          <Route path="test" element={<AddTest />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default LabRoutes;