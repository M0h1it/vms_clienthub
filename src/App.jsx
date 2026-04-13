import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Employees from "./pages/Employees";
import VisitorLogs from "./pages/VisitorLogs";
import Devices from "./pages/Devices";
import Creatives from "./pages/Creatives";
import Scheduler from "./pages/Scheduler";
import { useEffect } from "react";
import { updateActivity, checkSession } from "./utils/auth";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  useEffect(() => {
  const events = ["click", "mousemove", "keydown", "scroll"];

  // Track user activity
  events.forEach((event) => {
    window.addEventListener(event, updateActivity);
  });

  // Check session every 1 min
  const interval = setInterval(() => {
    checkSession();
  }, 60 * 1000);

  // Initial activity
  updateActivity();

  return () => {
    events.forEach((event) => {
      window.removeEventListener(event, updateActivity);
    });
    clearInterval(interval);
  };
}, []);
  return (
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >

          <Route path="/" element={<Dashboard />} />

          <Route path="/employees" element={<Employees />} />

          <Route path="/visitorLogs" element={<VisitorLogs />} />

          {/* New Admin Pages */}

          <Route path="/devices" element={<Devices />} />

          <Route path="/creatives" element={<Creatives />} />

          <Route path="/scheduler" element={<Scheduler />} />

        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;