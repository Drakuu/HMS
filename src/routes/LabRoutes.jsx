import {
  AddPatienttest,
  PatientTests,
  DashboardPannel,
  AddTest,
  AllTests,
  EditTest,
  TestsDetail,

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
          {/* dashboard  */}
          <Route path="dashboard" element={<DashboardPannel />} />

          {/* patient test routes */}
          <Route path="add-patient" element={<AddPatienttest />} />
          <Route path="patients-test" element={<PatientTests />} />

          {/* test managemnt routes */}
          <Route path="lab-test" element={<><AddTest /></>} />
          <Route path="test/edit/:id" element={<EditTest mode="edit" />} />
          <Route path="test/:id" element={<TestsDetail />} />
          <Route path="all-tests" element={<AllTests />} />


        </Route>
      </Route>
    </Routes>
  );
};

export default LabRoutes;