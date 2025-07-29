import {
  RadiologyPennal,
  RediologyPatientDetail,
  RadiologySummer,
  Dashboard,

} from "../pages/Radiology/RadiologyPages";
import { Navigate, Route, Routes } from "react-router-dom";
import DynamicLayout from "../layouts/DynamicLayout";
import ProtectedRoute from "../pages/auth/ProtectedRoute";

const LabRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={["Radiology" , 'Admin']} />}>
        <Route element={<DynamicLayout />}>
          <Route index element={<Navigate to="RadiologyPennal" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="RadiologyPennal" element={<RadiologyPennal />} />
          <Route
            path="RediologyPatientDetail/:id"
            element={<RediologyPatientDetail />}
          />
          <Route
            path="radiology-summer/:date"
            element={<RadiologySummer />}
          />
        </Route>
      </Route>
    </Routes>
  );
};

export default LabRoutes;
