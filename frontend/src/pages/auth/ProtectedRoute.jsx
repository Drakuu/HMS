// components/ProtectedRoute.jsx
import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { selectCurrentToken, selectCurrentUser } from '../../features/auth/authSlice';

const ProtectedRoute = ({ allowedRoles }) => {
// console.log("The allowedRoles were is : ", allowedRoles)

  const token = useSelector(selectCurrentToken);
  const user = useSelector(selectCurrentUser);
  const location = useLocation();
// console.log("The actrtula were is : ", user)
  if (!token) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.some(role => role.toLowerCase() === user.user?.user_Access.toLowerCase())) {
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;