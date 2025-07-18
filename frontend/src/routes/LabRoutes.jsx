import { AddPatienttest, PatientTests, DashboardPannel, AddTest, AllTests, EditTest, TestsDetail, SampleCollection, TestReportPage, AllBillsPage, UpdateReport, BillDetailPage,

} from '../pages/labs/labsPages'
import { Navigate, Route, Routes } from 'react-router-dom';
import DynamicLayout from '../layouts/DynamicLayout';
import ProtectedRoute from '../pages/auth/ProtectedRoute';

const LabRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['lab']} />}>
        <Route element={<DynamicLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          {/* dashboard  */}
          <Route path="dashboard" element={<DashboardPannel />} />

          {/* patient test routes */}
          <Route path="patient-test" element={<AddPatienttest />} />
          <Route path="all-patients" element={<PatientTests />} />

          {/* test managemnt routes */}
          <Route path="add-test" element={<AddTest />} />
          <Route path="all-tests" element={<AllTests />} />
          <Route path="test/:id" element={<TestsDetail />} />
          <Route path="test/edit/:id" element={<EditTest mode="edit" />} />

          {/* test samples */}
          <Route path='sample-collection' element={<SampleCollection />} />

          {/* test reports */}
          <Route path='test-report' element={<TestReportPage />} />
            <Route path='update-report/:id' element={<UpdateReport />} />     
          {/* test billing */}
          <Route path='test-billing' element={<AllBillsPage />} />
          <Route path="bills/:id" element={<BillDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default LabRoutes;