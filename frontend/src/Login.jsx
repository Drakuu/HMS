import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import login_back from "./assets/images/login_back.jpg";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const loginData = { user_Email: email, user_Password: password };

    try {
      const response = await fetch(`${API_URL}/user/log-in`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();
      // console.log("Full API Response:", data); // Debug API response

      if (!response.ok) {
        throw new Error(data.message || "Login failed!");
      }

      // Store token securely
      localStorage.setItem("jwtLoginToken", data.information.jwtLoginToken);
      // console.log("Stored Token:", localStorage.getItem("jwtLoginToken"));

      // Extract user role correctly
      const userRole = data.information.user.user_Access; // ✅ Corrected role path
      // console.log("User Role:", userRole); // Debug role

      // Redirect based on role
      if (userRole.toLowerCase() === "admin") {
        navigate("/admindashboard");
      } else if (userRole.toLowerCase() === "receptionist") {
        navigate("/receptiondashboard");
      } else {
        throw new Error("Unauthorized user role!");
      }

    } catch (err) {
      console.error("Error:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center pl-40 bg-gray-100"
      style={{
        backgroundImage: `url(${login_back})`,
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md p-8 bg-white bg-opacity-80 shadow-lg rounded-3xl border border-gray-300">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Welcome Back</h2>

        {error && <p className="text-red-600 text-sm mb-4 text-center">{error}</p>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Enter your email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            <label className="flex items-center">
              <input type="checkbox" className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
              <span className="ml-2 text-sm text-gray-600">Remember me</span>
            </label>
            <a href="#" className="text-sm text-primary-600 hover:underline focus:outline-none">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-primary-500 text-white font-semibold rounded-lg shadow-md hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don’t have an account? {" "}
            <a href="#" onClick={() => navigate("/signup")} className="text-primary-600 font-medium hover:underline focus:outline-none">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}