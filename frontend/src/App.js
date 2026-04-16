import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import LoginPage from "./Pages/Login/LoginPage";
import FacilitiesPage from "./Pages/Facilities/FacilitiesPage";
import AddResource from "./Pages/Admin/AddResource";
import BookingPage from "./Pages/Booking/BookingPage";
import UserDashboard from "./Pages/Booking/UserDashboard";
import ManageBookings from "./Pages/Admin/ManageBookings";
import NotificationsPage from "./Pages/Notifications/NotificationsPage";
import SignupPage from "./Pages/Login/SignupPage";
import Dashboard from "./Pages/Dashboard/Dashboard";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />

          <Route path="/signup" element={<SignupPage />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* User routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/facilities" element={<FacilitiesPage />} />
          <Route path="/bookings" element={<BookingPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />

          {/* Admin routes */}
          <Route
            path="/admin/add-resource"
            element={
              <ProtectedRoute role="ADMIN">
                <AddResource />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bookings"
            element={
              <ProtectedRoute role="ADMIN">
                <ManageBookings />
              </ProtectedRoute>
            }
          />
        </Routes>

        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </AuthProvider>
  );
}

export default App;
