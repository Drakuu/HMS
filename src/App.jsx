import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ReceptionRoutes from "./routes/ReceptionRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Landing_Page from "./pages/landing-page/Index";
import LabRoutes from './routes/LabRoutes'
import Unauthorized from "./pages/auth/Unauthorized"
import Profiles from "./pages/auth/ProfileModel"

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Landing_Page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes */}
        <Route path="/receptionist/*" element={<ReceptionRoutes />} />
        <Route path="/admin/*" element={<AdminRoutes />} />
        <Route path="/lab/*" element={<LabRoutes />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;