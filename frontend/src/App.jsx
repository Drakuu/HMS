import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ReceptionRoutes from "./routes/ReceptionRoutes";
import AdminRoutes from "./routes/AdminRoutes";
import Login from "./Login";
import Signup from "./Signup";
import Landing_Page from "./pages/landing-page/Index";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing_Page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {ReceptionRoutes()}
        {AdminRoutes()}

      </Routes>
    </Router>
  );
};

export default App;