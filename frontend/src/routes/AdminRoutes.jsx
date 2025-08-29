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
  OpdFinance,
  IpdFinance,
} from "../pages/admin/AdminPages";
// pages from reception
import { AllBillsPage, BillDetailPage } from "../pages/labs/labsPages";
import { NewOpd, ManageOpd } from "../pages/reception/ReceptionPages";
// pages from radiology
import RadiologyPanel from "../pages/Radiology/RadiologyPennal";
// pages from lab
import TestReportPage from "../pages/labs/testReport/TestReportPage";
import DynamicLayout from "../layouts/DynamicLayout";
import ProtectedRoute from "../pages/auth/ProtectedRoute";

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}>
        <Route element={<DynamicLayout />}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="StaffPannel" element={<StaffPannel />} />
          {/* Doctor routes */}
          <Route path="doctors" element={<DoctorPannel />} />
          <Route path="add-doctor" element={<AddNewDoctor mode="create" />} />
          <Route
            path="edit-doctor/:doctorId"
            element={<AddNewDoctor mode="edit" />}
          />
          <Route path="doctor-details/:doctorId" element={<DoctorDetails />} />
          <Route path="OPD/manage" element={<ManageOpd />} />{" "}
          {/* Depatemrnts Routes*/}
          <Route path="departments" element={<Departments />} />
          <Route path="RadiologyPennal" element={<RadiologyPanel />} />
          {/* staff */}
          <Route path="staff" element={<StaffListPage />} />
          <Route path="staff/new" element={<AddStaff />} />
          <Route path="staff/edit/:id" element={<AddStaff />} />
          <Route path="test-report" element={<TestReportPage />} />
          <Route path="opd-finance" element={<OpdFinance />} />
          <Route path="opd/newopd" element={<NewOpd mode="create" />} />
          <Route
            path="opd/edit/:patientMRNo"
            element={<NewOpd mode="edit" />}
          />
          <Route path="ipd-finance" element={<IpdFinance />} />
          <Route path="test-billing" element={<AllBillsPage />} />
          <Route path="bills/:id" element={<BillDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
