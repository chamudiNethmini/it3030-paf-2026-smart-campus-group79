import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import "./Profile.css";

function Profile() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!user) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>👤 My Profile</h1>
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">
              {user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="profile-title">
              <h2>{user.name}</h2>
              <p className="role-badge">{user.role}</p>
            </div>
          </div>

          <div className="profile-details">
            <div className="detail-item">
              <label>Email Address</label>
              <p>{user.email}</p>
            </div>

            <div className="detail-item">
              <label>User Role</label>
              <p>
                {user.role === "ADMIN" ? "👑 Administrator" : "👤 Regular User"}
              </p>
            </div>

            <div className="detail-item">
              <label>Account Status</label>
              <p className="status-active">✓ Active</p>
            </div>

            <div className="detail-item">
              <label>User ID</label>
              <p>{user.id || "N/A"}</p>
            </div>
          </div>

          <div className="profile-actions">
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Logout
            </button>
          </div>
        </div>

        {user.role === "ADMIN" && (
          <div className="admin-info">
            <h3>Admin Access</h3>
            <p>As an administrator, you have access to:</p>
            <ul>
              <li>👑 Manage user roles</li>
              <li>📋 View all bookings</li>
              <li>🏛️ Manage resources</li>
              <li>📊 View analytics</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
