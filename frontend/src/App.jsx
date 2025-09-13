import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { selectCurrentUser } from './features/auth/authSlice';
import { MantineProvider } from "@mantine/core";
import { useSelector } from 'react-redux';
import ReceptionRoutes from "./routes/ReceptionRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import ProfileRoutes from "./pages/profile/profileRoutes";
import DoctorRoutes from "./routes/DoctorRoutes";
import Landing_Page from "./pages/landing-page/Index";
import AuthRoutes from "./routes/AuthRoutes"

const App = () => {
  const currentUser = useSelector(selectCurrentUser);
  const userAccess = currentUser?.user_Access?.toLowerCase();

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<Landing_Page />} />
          <Route path="/*" element={<AuthRoutes />} />

          {/* Protected routes */}
          {userAccess === 'admin' && <Route path="/admin/*" element={<AdminRoutes />} />}
          {userAccess === 'receptionist' && <Route path="/receptionist/*" element={<ReceptionRoutes />} />}
          {userAccess === 'doctor' && <Route path="/doctor/*" element={<DoctorRoutes />} />}

          {/* Unified profile route */}
          <Route path="/profile" element={<ProfileRoutes />} />

          {/* Catch-all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </MantineProvider>
  );
};

export default App;
