import { Routes, Route } from "react-router-dom";
import Login from '../pages/auth/Login'
import Signup from "../pages/auth/Signup";
import Unauthorized from "../pages/auth/Unauthorized";
import Profiles from "../pages/auth/ProfileModel";

const AuthRoutes = () => {
    return (
        <Routes>
            <Route >

                <Route path="login" element={<Login />} />
                <Route path="signup" element={<Signup />} />
                <Route path="unauthorized" element={<Unauthorized />} />
                <Route path="profiles" element={<Profiles />} />
            </Route>
        </Routes>
    );
};

export default AuthRoutes;