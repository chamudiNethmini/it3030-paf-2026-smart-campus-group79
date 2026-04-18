import React from "react";
import { useNavigate } from "react-router-dom";
import "./LandingPage.css";

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      <aside className="landing-sidebar">
        <div className="landing-logo">SC</div>
        <h3>Smart Campus</h3>
        <p>University Management</p>

        <nav className="landing-nav">
          <button className="landing-nav-item active">Home</button>
          <button className="landing-nav-item">About Us</button>
          <button className="landing-nav-item">Features</button>
          <button className="landing-nav-item">Contact</button>
        </nav>

        <div className="landing-auth-actions">
          <button className="landing-btn secondary" onClick={() => navigate("/login")}>
            Login
          </button>
          <button className="landing-btn primary" onClick={() => navigate("/signup")}>
            Sign Up
          </button>
        </div>
      </aside>

      <main className="landing-content">
        <h1>Manage Your Campus Smarter</h1>
        <p>
          One place to handle resources, bookings, tickets, notifications, and
          more for students, lecturers, and administrators.
        </p>

        <div className="landing-hero-actions">
          <button className="landing-btn primary" onClick={() => navigate("/signup")}>
            Get Started
          </button>
          <button className="landing-btn secondary" onClick={() => navigate("/login")}>
            I already have an account
          </button>
        </div>

        <section className="landing-section">
          <h2>About Us</h2>
          <p>
            Smart University Management is built to simplify university operations
            and improve communication between all campus users.
          </p>
        </section>

        <section className="landing-cards">
          <article>
            <h4>Resource Tracking</h4>
            <p>Track and manage equipment, rooms, and learning resources.</p>
          </article>
          <article>
            <h4>Booking Workflows</h4>
            <p>Handle booking requests with clear status updates and visibility.</p>
          </article>
          <article>
            <h4>Support Tickets</h4>
            <p>Resolve issues faster with centralized ticket management.</p>
          </article>
        </section>
      </main>
    </div>
  );
}

export default LandingPage;
