import React from "react";
import { useNavigate } from "react-router-dom";
import "./ResourceHome.css";

const ResourceHome = () => {
  const navigate = useNavigate();

  return (
    <div className="resource-home-page">
      <div className="resource-home-overlay">
        <div className="resource-navbar">
          <div className="resource-logo-wrap">
            <div className="resource-logo">SC</div>
            <div>
              <h3>Smart Campus</h3>
              <p>Operations Hub</p>
            </div>
          </div>

          <div className="resource-nav-links">
            <button onClick={() => navigate("/")} className="nav-btn active-link">
              Home
            </button>
            <button onClick={() => navigate("/facilities")} className="nav-btn">
              Browse Resources
            </button>
            <button onClick={() => navigate("/admin/add-resource")} className="nav-btn">
              Manage Resources
            </button>
          </div>
        </div>

        <div className="resource-hero-content">
          <span className="hero-pill">SMART CAMPUS RESOURCE MANAGEMENT</span>
          <h1>Manage Campus Resources with Ease</h1>
          <p>
            Add, update, search, and explore lecture halls, labs, meeting rooms,
            and equipment through a clean and professional interface.
          </p>

          <div className="hero-actions">
            <button className="hero-primary-btn" onClick={() => navigate("/facilities")}>
              Browse Resources
            </button>
            <button className="hero-secondary-btn" onClick={() => navigate("/admin/add-resource")}>
              Manage Resources
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceHome;