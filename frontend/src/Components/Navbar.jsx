import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const location = useLocation();

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
          <Link
            to="/bookings"
            className={location.pathname === "/bookings" ? "active-link" : ""}
          >
            Book Resource
          </Link>
          <Link
            to="/dashboard"
            className={location.pathname === "/dashboard" ? "active-link" : ""}
          >
            My Bookings
          </Link>
          <Link
            to="/admin/bookings"
            className={location.pathname === "/admin/bookings" ? "active-link" : ""}
          >
            Manage Bookings
          </Link>
        </div>

        <div className="navbar-right">
          <Link to="/admin/bookings" className="navbar-btn">
            Admin
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;