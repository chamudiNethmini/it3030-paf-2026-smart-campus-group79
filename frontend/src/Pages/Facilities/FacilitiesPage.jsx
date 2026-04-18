import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { getAllResources, searchResources } from "../../services/resourceService";
import "./FacilitiesPage.css";

const FacilitiesPage = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isAdmin = user?.role === "ADMIN";

  const [resources, setResources] = useState([]);
  const [searchBy, setSearchBy] = useState("type");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await getAllResources();
      setResources(response.data);
    } catch (error) {
      console.error("Error loading resources:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to load resources"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const handleSearch = async () => {
    try {
      if (!searchValue.trim()) {
        loadResources();
        return;
      }

      const params = {};

      if (searchBy === "type") {
        params.type = searchValue.trim().toUpperCase().replace(/\s+/g, "_");
      } else if (searchBy === "capacity") {
        params.capacity = Number(searchValue);
      } else if (searchBy === "location") {
        params.location = searchValue.trim();
      } else if (searchBy === "status") {
        params.status = searchValue.trim().toUpperCase();
      }

      setLoading(true);
      const response = await searchResources(params);
      setResources(response.data);
    } catch (error) {
      console.error("Search error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to search resources"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchBy("type");
    setSearchValue("");
    loadResources();
  };

  return (
    <div className="facilities-page">
      <div className="facilities-hero">
        <div className="facilities-nav">
          <div className="facilities-brand">
            <div className="facilities-logo">SC</div>
            <div>
              <h3>Smart Campus</h3>
              <p>Facilities Catalogue</p>
            </div>
          </div>

          <div className="facilities-nav-links">
            <button onClick={() => navigate("/")} className="facilities-nav-btn">
              Home
            </button>
            <button onClick={() => navigate("/facilities")} className="facilities-nav-btn active-nav">
              Browse Resources
            </button>
            {isAdmin && (
              <button onClick={() => navigate("/admin/add-resource")} className="facilities-nav-btn">
                Manage Resources
              </button>
            )}
          </div>
        </div>

        <div className="facilities-hero-content">
          <span className="facilities-pill">SMART CAMPUS CATALOGUE</span>
          <h1>Explore Campus Resources</h1>
          <p>
            Search and browse lecture halls, labs, meeting rooms, and equipment
            with a clean and simple experience.
          </p>
        </div>
      </div>

      <div className="facilities-search-card">
        <h2>Search Resources</h2>

        <div className="facilities-filter-bar">
          <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
            <option value="type">Search by Type</option>
            <option value="capacity">Search by Capacity</option>
            <option value="location">Search by Location</option>
            <option value="status">Search by Status</option>
          </select>

          <input
            type={searchBy === "capacity" ? "number" : "text"}
            placeholder={
              searchBy === "type"
                ? "Enter type"
                : searchBy === "capacity"
                ? "Enter minimum capacity"
                : searchBy === "location"
                ? "Enter location"
                : "Enter status"
            }
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />

          <button onClick={handleSearch} className="search-btn" type="button">
            Search
          </button>

          <button onClick={handleResetSearch} className="reset-btn" type="button">
            Reset
          </button>
        </div>
      </div>

      <div className="facilities-list-section">
        <div className="section-top">
          <h2>Available Resources</h2>
          {isAdmin && (
            <button className="manage-resource-btn" onClick={() => navigate("/admin/add-resource")}>
              Go to Manage Resources
            </button>
          )}
        </div>

        {loading ? (
          <p className="empty-text">Loading resources...</p>
        ) : (
          <div className="facilities-grid">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <div className="facility-card" key={resource.id}>
                  <div className="facility-top">
                    <h3>{resource.name}</h3>
                    <span
                      className={
                        resource.status === "ACTIVE"
                          ? "status-badge active-status"
                          : "status-badge inactive-status"
                      }
                    >
                      {resource.status}
                    </span>
                  </div>

                  <p><strong>Type:</strong> {resource.type}</p>
                  <p><strong>Capacity:</strong> {resource.capacity}</p>
                  <p><strong>Location:</strong> {resource.location}</p>
                  <p>
                    <strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}
                  </p>
                  <p><strong>Description:</strong> {resource.description || "N/A"}</p>

                  <div className="facility-card-footer">
                    <button
                      type="button"
                      className="facility-booking-btn"
                      disabled={resource.status !== "ACTIVE"}
                      title={
                        resource.status !== "ACTIVE"
                          ? "This resource is not available for booking"
                          : "Go to bookings for this resource"
                      }
                      onClick={() => navigate(`/bookings?resourceId=${resource.id}`)}
                    >
                      Booking
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-text">No resources found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FacilitiesPage;