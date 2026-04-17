import React, { useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Smart Campus</h2>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/dashboard")} className="menu-item">
            📊 Dashboard
          </li>
          <li onClick={() => navigate("/facilities")} className="menu-item">
            🏛️ Facilities
          </li>
          <li onClick={() => navigate("/bookings")} className="menu-item">
            📅 Bookings
          </li>
          <li onClick={() => navigate("/notifications")} className="menu-item">
            🎫 Tickets
          </li>
          <li onClick={() => navigate("/notifications")} className="menu-item">
            🔔 Notifications
          </li>

          {user?.role === "ADMIN" && (
            <>
              <li className="menu-divider"></li>
              <li
                onClick={() => navigate("/admin/roles")}
                className="menu-item"
              >
                👑 Admin Roles
              </li>
            </>
          )}

          <li className="menu-divider"></li>
          <li onClick={() => navigate("/profile")} className="menu-item">
            👤 Profile
          </li>
          <li onClick={handleLogout} className="menu-item logout-item">
            🚪 Logout
          </li>
        </ul>
      </div>

      {/* Main content */}
      <div className="main">
        {/* Top Header with User Profile */}
        <div className="top-header">
          <div className="header-title">
            <h1>Dashboard</h1>
          </div>
          <div className="user-profile">
            <div className="user-info">
              <p className="user-name">{user?.name}</p>
              <p className="user-email">{user?.email}</p>
            </div>
            <div className="user-avatar">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          </div>
        </div>

        {/* Welcome banner */}
        <div className="welcome">
          <h2>Welcome back, {user?.name}! 👋</h2>
          <p>Here's what's happening at Smart Campus today</p>
        </div>

        {/* Stats Cards */}
        <div className="cards">
          <div className="card">
            <div className="card-icon">📦</div>
            <h3>24</h3>
            <p>Total Bookings</p>
          </div>

          <div className="card">
            <div className="card-icon">✅</div>
            <h3>12</h3>
            <p>Active Bookings</p>
          </div>

          <div className="card">
            <div className="card-icon">🎟️</div>
            <h3>8</h3>
            <p>Open Tickets</p>
          </div>

          <div className="card">
            <div className="card-icon">🔔</div>
            <h3>5</h3>
            <p>Notifications</p>
          </div>
        </div>

        {/* Recent Sections */}
        <div className="recent-section">
          <div className="recent">
            <h3>📅 Recent Bookings</h3>

            <div className="booking">
              <p>
                <strong>Lecture Hall A</strong>
              </p>
              <p className="booking-time">2025-01-20 • 10:00 - 11:00</p>
              <span className="status approved">APPROVED</span>
            </div>

            <div className="booking">
              <p>
                <strong>Lab 3</strong>
              </p>
              <p className="booking-time">2025-01-20 • 13:00 - 15:00</p>
              <span className="status pending">PENDING</span>
            </div>

            <div className="booking">
              <p>
                <strong>Meeting Room 2</strong>
              </p>
              <p className="booking-time">2025-01-21 • 09:00 - 10:00</p>
              <span className="status rejected">REJECTED</span>
            </div>
          </div>

          <div className="recent">
            <h3>🎟️ Recent Tickets</h3>

            <div className="ticket">
              <p>
                <strong>Projector not working</strong>
              </p>
              <p className="ticket-time">Lab 1 • HIGH</p>
              <span className="status open">OPEN</span>
            </div>

            <div className="ticket">
              <p>
                <strong>AC malfunction</strong>
              </p>
              <p className="ticket-time">Lab 2 • MEDIUM</p>
              <span className="status in-progress">IN PROGRESS</span>
            </div>

            <div className="ticket">
              <p>
                <strong>Door lock broken</strong>
              </p>
              <p className="ticket-time">Room 204 • LOW</p>
              <span className="status resolved">RESOLVED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
