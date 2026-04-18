import React, { useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
import { useEffect, useState } from "react";
import { getUnreadCount } from "../services/notificationService";
import { connectSocket, disconnectSocket } from "../services/socketService";
import { toast } from "react-toastify";

function Navbar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    loadUnread();

    const interval = setInterval(loadUnread, 5000);

    connectSocket(user?.id, (notification) => {
      toast.info(notification.message);
      setUnread((prev) => prev + 1);
    });

    return () => {
      clearInterval(interval);
      disconnectSocket();
    };
  }, [user?.id]);

  const loadUnread = async () => {
    try {
      const count = await getUnreadCount();
      setUnread(typeof count === "number" ? count : 0);
    } catch (error) {
      setUnread(0);
    }
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
          {/* USER & ADMIN links */}
          {(user?.role === "USER" || user?.role === "ADMIN") && (
            <>
              <Link
                to="/bookings"
                className={
                  location.pathname === "/bookings" ? "active-link" : ""
                }
              >
                Book Resource
              </Link>
              <Link
                to="/my-bookings"
                className={
                  location.pathname === "/my-bookings" ? "active-link" : ""
                }
              >
                My Bookings
              </Link>
              {location.pathname !== "/bookings" && (
                <Link
                  to="/notifications"
                  className={
                    location.pathname === "/notifications" ? "active-link" : ""
                  }
                >
                  Notifications{" "}
                  {unread > 0 && (
                    <span style={{ color: "red" }}>({unread})</span>
                  )}
                </Link>
              )}
            </>
          )}

          {/* ADMIN ONLY links - Hide from BookingPage */}
          {user?.role === "ADMIN" && location.pathname !== "/bookings" && (
            <>
              <Link
                to="/admin/bookings"
                className={
                  location.pathname === "/admin/bookings" ||
                  location.pathname === "/admin/manage-bookings"
                    ? "active-link"
                    : ""
                }
              >
                Manage Bookings
              </Link>
              <Link
                to="/admin/roles"
                className={
                  location.pathname === "/admin/roles" ? "active-link" : ""
                }
              >
                Manage Roles
              </Link>
            </>
          )}
        </div>

        <div className="navbar-right">
          {!user && (
            <Link to="/login" className="navbar-btn">
              Login
            </Link>
          )}

          {user?.role === "ADMIN" && (
            <Link to="/admin/bookings" className="navbar-btn">
              Admin
            </Link>
          )}

          {user?.role === "ADMIN" && <Link to="/admin/roles">Admin Roles</Link>}

          {user && <span className="user-email">{user.email}</span>}

          {user && (
            <Link
              to="/"
              className="navbar-btn logout-btn"
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                window.location.href = "/";
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
