import Profile from "./Profile";
import { Routes, Route } from "react-router-dom";
import DynamicLayout from '../../layouts/DynamicLayout';
import ProtectedRoute from '../auth/ProtectedRoute';

const ProfileRoutes = () => {
    return (
        <Routes>
            <Route element={<ProtectedRoute allowedRoles={['admin', 'doctor', 'lab', 'receptionist']} />}>
                <Route element={<DynamicLayout />}>
                    <Route path='/' element={<Profile />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default ProfileRoutes;