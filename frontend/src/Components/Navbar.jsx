import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <nav className="navbar">
      <h2 className="navbar-logo">Smart Campus</h2>

      <div className="navbar-links">
        <Link to="/bookings">Book Resource</Link>
        <Link to="/dashboard">My Bookings</Link>
        <Link to="/admin/bookings">Manage Bookings</Link>
      </div>
    </nav>
  );
}

export default Navbar;