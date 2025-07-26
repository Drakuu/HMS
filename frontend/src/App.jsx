import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import ReceptionRoutes from "./routes/ReceptionRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import Landing_Page from "./pages/landing-page/Index";
import LabRoutes from './routes/LabRoutes';
import DoctorRoutes from './routes/DoctorRoutes';
import Unauthorized from "./pages/auth/Unauthorized";
import Profiles from "./pages/auth/ProfileModel";
import ProfileRoutes from "./pages/profile/profileRoutes";
import { selectCurrentUser } from './features/auth/authSlice';
import { useSelector } from 'react-redux';

const App = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userAccess = currentUser?.user_Access?.toLowerCase();

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
        {userAccess === 'admin' && <Route path="/admin/*" element={<AdminRoutes />} />}
        {userAccess === 'receptionist' && <Route path="/receptionist/*" element={<ReceptionRoutes />} />}
        {userAccess === 'lab' && <Route path="/lab/*" element={<LabRoutes />} />}
        {userAccess === 'doctor' && <Route path="/doctor/*" element={<DoctorRoutes />} />}

        {/* Unified profile route */}
        <Route path="/profile" element={<ProfileRoutes />} />

        {/* Catch-all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;