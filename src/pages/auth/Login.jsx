// pages/auth/Login.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginUser } from '../../features/auth/authSlice';
import login_back from '../../assets/images/login_back.jpg?url';

const Login = () => {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { status, error } = useSelector((state) => state.auth);

 const handleSubmit = async (e) => {
  e.preventDefault();

  if (!loginId || !password) {
    return; // Frontend validation
  }

  const resultAction = await dispatch(loginUser({ loginId, password }));
  console.log(`The login ID is ${loginId}, The password is ${password}`);

  if (loginUser.fulfilled.match(resultAction)) {
    const user = resultAction.payload.user;

    // Check if user object exists and has necessary properties
    if (!user || !user.user_Access) {
      console.error('User data is incomplete or invalid');
      return;
    }

    // Safely access user_Access and staffType
    const accessRole = user.user_Access || 'User'; // Fallback if user_Access is undefined
    const staffType = user.staffType ? user.staffType.toLowerCase() : accessRole.toLowerCase(); // Handle missing staffType

    const redirectPath = accessRole === 'SuperAdmin' 
      ? '/admin/dashboard' 
      : `/${staffType}/dashboard`;

    navigate(redirectPath);
  }
};

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center bg-gray-100"
      style={{
        backgroundImage: `url(${login_back})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      }}
    >
      <div className="w-full max-w-md p-8 bg-white bg-opacity-90 shadow-lg rounded-3xl border border-gray-300 mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Hospital Management System</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-md text-center">
            {error}
          </div>
        )}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="loginId" className="block text-sm font-medium text-gray-700 mb-1">
              Login ID (Email/Phone/Staff ID)
            </label>
            <input
              type="text"
              id="loginId"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your email, phone or staff ID"
              required
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                type="checkbox" 
                id="remember"
                className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" 
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-600">
                Remember me
              </label>
            </div>
            <button 
              type="button" 
              className="text-sm text-primary-600 hover:underline focus:outline-none"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Logging in...
              </span>
            ) : 'Login'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <button 
              className="text-primary-600 font-medium hover:underline focus:outline-none"
              onClick={() => navigate('/signup')}
            >
              Contact administrator
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;