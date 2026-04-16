import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const { user, loading } = useContext(AuthContext);

  // Loading state
  if (loading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Role check failed
  if (role && user?.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // All good
  return children;
}

export default ProtectedRoute;
