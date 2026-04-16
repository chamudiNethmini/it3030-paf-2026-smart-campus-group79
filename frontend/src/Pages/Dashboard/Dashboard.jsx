import React, { useContext } from "react";
import "./Dashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Sidebar */}
      <div className="sidebar">
        <h2>Smart Campus</h2>

        <ul>
          <li onClick={() => navigate("/dashboard")}>Dashboard</li>
          <li onClick={() => navigate("/facilities")}>Facilities</li>
          <li onClick={() => navigate("/bookings")}>Bookings</li>
          <li onClick={() => navigate("/notifications")}>Notifications</li>

          {user?.role === "ADMIN" && (
            <>
              <li onClick={() => navigate("/admin/add-resource")}>
                Add Resource
              </li>
              <li onClick={() => navigate("/admin/bookings")}>
                Manage Bookings
              </li>
            </>
          )}
        </ul>
      </div>

      {/* Main content */}
      <div className="main">
        {/* Welcome banner */}
        <div className="welcome">
          <h2>Welcome back, {user?.name} 👋</h2>
          <p>Here’s what’s happening in your campus today</p>
        </div>

        {/* Cards */}
        <div className="cards">
          <div className="card">
            <h3>24</h3>
            <p>Total Bookings</p>
          </div>

          <div className="card">
            <h3>12</h3>
            <p>Active Bookings</p>
          </div>
        </div>

        {/* Recent bookings */}
        <div className="recent">
          <h3>Recent Bookings</h3>

          <div className="booking">
            <p>
              <strong>Lecture Hall A</strong>
            </p>
            <p>10:00 AM - 12:00 PM</p>
          </div>

          <div className="booking">
            <p>
              <strong>Lab 3</strong>
            </p>
            <p>01:00 PM - 03:00 PM</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
