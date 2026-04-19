import React, { useContext, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import "./Navbar.css";
import { getUnreadCount } from "../services/notificationService";
import { connectSocket, disconnectSocket } from "../services/socketService";
import { toast } from "react-toastify";

function Navbar() {
  const location = useLocation();
  const { user } = useContext(AuthContext);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.id) {
      loadUnread();

      const interval = setInterval(loadUnread, 10000);

      connectSocket(user.id, (notification) => {
        toast.info(notification.message);
        setUnread((prev) => prev + 1);
      });

      return () => {
        clearInterval(interval);
        disconnectSocket();
      };
    }
  }, [user?.id]);

  const loadUnread = async () => {
    try {
      const count = await getUnreadCount();
      setUnread(typeof count === "number" ? count : 0);
    } catch (error) {
      setUnread(0);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  const isActive = (path) => (location.pathname === path ? "active-link" : "");

  return (
    <div className="navbar-wrapper">
      <nav className="navbar">
        <div className="navbar-left">
          <Link
            to="/"
            style={{ textDecoration: "none", display: "flex", alignItems: "center" }}
          >
            <div className="navbar-logo-circle">SC</div>
            <div className="navbar-brand">
              <h2>Smart Campus</h2>
              <p>Operations Hub</p>
            </div>
          </Link>
        </div>

        <div className="navbar-center">
  {user && (
    <>
      <Link to="/facilities" className={isActive("/facilities")}>
        Facilities
      </Link>

      {user?.role !== "ADMIN" && (
        <>
          <Link to="/bookings" className={isActive("/bookings")}>
            Book Resource
          </Link>

          <Link to="/my-bookings" className={isActive("/my-bookings")}>
            My Bookings
          </Link>
        </>
      )}

      <Link to="/tickets" className={isActive("/tickets")}>
        Help Desk
      </Link>

      <Link to="/notifications" className={isActive("/notifications")}>
        Notifications
        {unread > 0 && <span className="notif-badge">{unread}</span>}
      </Link>
    </>
  )}

  {user?.role === "ADMIN" && (
    <>
      <div className="admin-divider">|</div>
      <Link
        to="/admin/manage-bookings"
        className={isActive("/admin/manage-bookings")}
      >
        Manage Bookings
      </Link>
      <Link to="/admin/roles" className={isActive("/admin/roles")}>
        Manage Roles
      </Link>
    </>
  )}
</div>

        <div className="navbar-right">
          {!user ? (
            <Link to="/login" className="navbar-btn">
              Login
            </Link>
          ) : (
            <>
              <div className="user-info">
                <Link to="/profile" className="user-email-link">
                  <span className="user-email">{user.email}</span>
                </Link>
                <span className="user-role-tag">{user.role}</span>
              </div>
              <button onClick={handleLogout} className="navbar-btn logout-btn">
                Logout
              </button>
            </>
          )}
        </div>
      </nav>
    </div>
  );
}

export default Navbar;