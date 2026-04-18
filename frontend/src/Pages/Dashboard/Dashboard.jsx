import React, { useContext, useEffect, useMemo, useState } from "react";
import "./Dashboard.css";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { getAllBookings, getMyBookings } from "../../services/bookingService";
import { getUnreadCount } from "../../services/notificationService";

function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const role = user?.role || "USER";
  const roleClass = role.toLowerCase();
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const dashboardTitleByRole = {
    ADMIN: "Admin Dashboard",
    TECHNICIAN: "Technician Dashboard",
    USER: "User Dashboard",
  };

  const normalizeStatus = (status) => {
    const value = String(status || "").trim();
    return value.includes(".") ? value.split(".").pop().toUpperCase() : value.toUpperCase();
  };

  const formatTicketTitle = (ticket) =>
    ticket?.subject ||
    ticket?.title ||
    ticket?.description ||
    ticket?.category ||
    `Ticket #${ticket?.id ?? "-"}`;

  const formatTicketMeta = (ticket) => {
    const category = ticket?.category || ticket?.resourceLocation || "General";
    const priority = ticket?.priority || "NORMAL";
    return `${category} • ${priority}`;
  };

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user?.email) {
        return;
      }

      setLoading(true);
      setLoadError("");
      try {
        const bookingsPromise =
          role === "ADMIN" ? getAllBookings() : getMyBookings(user.email);

        const ticketsPromise = fetch("http://localhost:8081/api/tickets", {
          credentials: "include",
        }).then((res) => {
          if (!res.ok) {
            throw new Error(`Failed to load tickets: ${res.status}`);
          }
          return res.json();
        });

        const [bookingsRes, ticketsData, unreadCount] = await Promise.all([
          bookingsPromise,
          ticketsPromise,
          getUnreadCount(),
        ]);

        setBookings(Array.isArray(bookingsRes?.data) ? bookingsRes.data : []);
        setTickets(Array.isArray(ticketsData) ? ticketsData : []);
        setUnreadNotifications(
          typeof unreadCount === "number" ? unreadCount : 0
        );
      } catch (err) {
        console.error("Dashboard data load failed:", err);
        setLoadError("Failed to load latest dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [role, user?.email]);

  const bookingStats = useMemo(() => {
    const total = bookings.length;
    const active = bookings.filter((booking) => {
      const st = normalizeStatus(booking.status);
      return st === "APPROVED" || st === "PENDING";
    }).length;
    const pending = bookings.filter(
      (booking) => normalizeStatus(booking.status) === "PENDING"
    ).length;
    return { total, active, pending };
  }, [bookings]);

  const ticketStats = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((ticket) => {
      const st = normalizeStatus(ticket.status);
      return st === "OPEN" || st === "IN_PROGRESS";
    }).length;
    return { total, open };
  }, [tickets]);

  const recentBookings = useMemo(() => {
    return [...bookings]
      .sort((a, b) => {
        const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 3);
  }, [bookings]);

  const recentTickets = useMemo(() => {
    return [...tickets]
      .sort((a, b) => Number(b?.id || 0) - Number(a?.id || 0))
      .slice(0, 3);
  }, [tickets]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <div className={`dashboard dashboard-${roleClass}`}>
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h2>Smart Campus</h2>
          <p className="sidebar-role">{role}</p>
        </div>

        <ul className="sidebar-menu">
          <li onClick={() => navigate("/dashboard")} className="menu-item">
            📊 Dashboard
          </li>
          <li
            onClick={() =>
              navigate(user?.role === "ADMIN" ? "/admin/add-resource" : "/facilities")
            }
            className="menu-item"
          >
            🏛️ Facilities
          </li>
          <li
            onClick={() =>
              navigate(user?.role === "ADMIN" ? "/admin/manage-bookings" : "/bookings")
            }
            className="menu-item"
          >
            📅 {user?.role === "ADMIN" ? "Manage Bookings" : "Bookings"}
          </li>
          <li onClick={() => navigate("/tickets")} className="menu-item">
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
            <h1>{dashboardTitleByRole[role] || "Dashboard"}</h1>
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
            <h3>{bookingStats.total}</h3>
            <p>Total Bookings</p>
          </div>

          <div className="card">
            <div className="card-icon">✅</div>
            <h3>{role === "ADMIN" ? bookingStats.pending : bookingStats.active}</h3>
            <p>{role === "ADMIN" ? "Pending Bookings" : "Active Bookings"}</p>
          </div>

          <div className="card">
            <div className="card-icon">🎟️</div>
            <h3>{role === "USER" ? ticketStats.total : ticketStats.open}</h3>
            <p>{role === "USER" ? "Tickets Raised" : "Open Tickets"}</p>
          </div>

          <div className="card">
            <div className="card-icon">🔔</div>
            <h3>{unreadNotifications}</h3>
            <p>Notifications</p>
          </div>
        </div>

        {loading && <p>Loading dashboard data...</p>}
        {!loading && loadError && <p>{loadError}</p>}

        {/* Recent Sections */}
        <div className="recent-section">
          <div className="recent">
            <h3>📅 Recent Bookings</h3>
            {!loading && recentBookings.length === 0 && (
              <p className="booking-time">No recent bookings found.</p>
            )}
            {recentBookings.map((booking) => {
              const status = normalizeStatus(booking.status);
              return (
                <div className="booking" key={booking.id}>
                  <p>
                    <strong>Booking #{booking.id}</strong>
                  </p>
                  <p className="booking-time">
                    {booking.bookingDate} • {booking.startTime} - {booking.endTime}
                  </p>
                  <span className={`status ${status.toLowerCase()}`}>{status}</span>
                </div>
              );
            })}
          </div>

          <div className="recent">
            <h3>🎟️ Recent Tickets</h3>
            {!loading && recentTickets.length === 0 && (
              <p className="ticket-time">No recent tickets found.</p>
            )}
            {recentTickets.map((ticket) => {
              const status = normalizeStatus(ticket.status).replace("_", "-").toLowerCase();
              return (
                <div className="ticket" key={ticket.id}>
                  <p>
                    <strong>{formatTicketTitle(ticket)}</strong>
                  </p>
                  <p className="ticket-time">{formatTicketMeta(ticket)}</p>
                  <span className={`status ${status}`}>
                    {normalizeStatus(ticket.status).replace("_", " ")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
