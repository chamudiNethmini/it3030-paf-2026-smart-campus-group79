import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext"; // ✅ NEW - AuthContext import
import "./Navbar.css";
import { useEffect, useState } from "react";
import { getUnreadCount } from "../services/notificationService";
import { connectSocket } from "../services/socketService";
import { toast } from "react-toastify";

function Navbar() {
  const location = useLocation();
  const { user } = useContext(AuthContext); // ✅ NEW - get user from context
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    loadUnread();

    // 🔥 auto refresh every 5 sec (live feel)
    const interval = setInterval(loadUnread, 5000);

    // ✅ Socket connection for real-time notifications
    connectSocket((notification) => {
      // 🔥 toast popup
      toast.info(notification.message);
      // 🔴 update badge
      setUnread((prev) => prev + 1);
    });

    return () => {
      clearInterval(interval);
      // Optional: disconnect socket on unmount
      // disconnectSocket();
    };
  }, []);

  const loadUnread = async () => {
    const count = await getUnreadCount();
    setUnread(count);
  };

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-left">
          <div className="navbar-logo-circle">SC</div>
          <div className="navbar-brand">
            <h2>Smart Campus</h2>
            <p>Operations Hub</p>
          </div>
        </div>

        <div className="navbar-center">
          {/* 🔥 USER ONLY - Book Resource link */}
          {(user?.role === "USER" || user?.role === "ADMIN") && (
            <Link
              to="/bookings"
              className={location.pathname === "/bookings" ? "active-link" : ""}
            >
              Book Resource
            </Link>
          )}

          {/* 🔥 USER ONLY - My Bookings link */}
          {(user?.role === "USER" || user?.role === "ADMIN") && (
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard" ? "active-link" : ""
              }
            >
              My Bookings
            </Link>
          )}

          {/* 🔥 ADMIN ONLY - Manage Bookings link */}
          {user?.role === "ADMIN" && (
            <Link
              to="/admin/bookings"
              className={
                location.pathname === "/admin/bookings" ? "active-link" : ""
              }
            >
              Manage Bookings
            </Link>
          )}

          {/* 🔔 NOTIFICATIONS - Show for USER and ADMIN */}
          {(user?.role === "USER" || user?.role === "ADMIN") && (
            <Link
              to="/notifications"
              className={
                location.pathname === "/notifications" ? "active-link" : ""
              }
            >
              Notifications{" "}
              {unread > 0 && <span style={{ color: "red" }}>({unread})</span>}
            </Link>
          )}
        </div>

        <div className="navbar-right">
          {/* ✅ Show Login only if user is NOT logged in */}
          {!user && (
            <Link to="/login" className="navbar-btn">
              Login
            </Link>
          )}

          {/* ✅ Show Admin button only for ADMIN users */}
          {user?.role === "ADMIN" && (
            <Link to="/admin/bookings" className="navbar-btn">
              Admin
            </Link>
          )}

          {/* ✅ Show user email when logged in */}
          {user && <span className="user-email">{user.email}</span>}

          {/* ✅ Optional: Logout button */}
          {user && (
            <Link
              to="/login"
              className="navbar-btn logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                window.location.href = "/login";
              }}
            >
              Logout
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;
