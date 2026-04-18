import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./Components/ProtectedRoute";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Pages
import LoginPage from "./Pages/Login/LoginPage";
import SignupPage from "./Pages/Login/SignupPage";
import OAuthCallback from "./Pages/OAuthCallback";
import LandingPage from "./Pages/Landing/LandingPage";
import Dashboard from "./Pages/Dashboard/Dashboard";
import FacilitiesPage from "./Pages/Facilities/FacilitiesPage";
import AddResource from "./Pages/Admin/AddResource";
import BookingPage from "./Pages/Booking/BookingPage";
import UserDashboard from "./Pages/Booking/UserDashboard";
import ManageBookings from "./Pages/Admin/ManageBookings";
import NotificationsPage from "./Pages/Notifications/NotificationsPage";
import Profile from "./Pages/Profile/Profile";
import AdminRolesPage from "./Pages/Admin/AdminRolesPage";
import AdminView from "./Pages/Tickets/AdminView";
import StudentView from "./Pages/Tickets/StudentView";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* --- PUBLIC ROUTES --- */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* --- PROTECTED USER/STUDENT ROUTES --- */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/facilities"
            element={
              <ProtectedRoute>
                <FacilitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <BookingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/tickets"
            element={
              <ProtectedRoute>
                <StudentView />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* --- ADMIN & TECHNICIAN ROUTES --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminView />
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/admin/add-resource"
            element={
              <ProtectedRoute role="ADMIN">
                <AddResource />
              </ProtectedRoute>
            }
          />

          {/* Duplicate /admin/bookings එක ඉවත් කර manage-bookings පමණක් පවත්වා ගත්තා */}
          <Route
            path="/admin/manage-bookings"
            element={
              <ProtectedRoute role="ADMIN">
                <ManageBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin/roles"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminRolesPage />
              </ProtectedRoute>
            }
          />
          
          {/* Student/User සඳහා වෙනම path එකක් අවශ්‍ය නම් පමණක් මෙය තබන්න */}
          <Route
            path="/student"
            element={
              <ProtectedRoute>
                <StudentView />
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