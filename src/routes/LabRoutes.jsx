import {
  AddPatienttest,
  PatientTests,
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
        <Route element={<DynamicLayout />}> 
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<DashboardPannel />} /> 
          <Route path="add-patient" element={<AddPatienttest />} />
          <Route path="patients-test" element={<PatientTests />} />
          <Route path="test" element={<AddTest />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default LabRoutes;