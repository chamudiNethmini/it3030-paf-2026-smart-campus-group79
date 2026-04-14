import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllResources, searchResources } from "../../services/resourceService";
import "./FacilitiesPage.css";

const FacilitiesPage = () => {
  const navigate = useNavigate();

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
      alert("Failed to load resources");
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
      alert("Failed to search resources");
    } finally {
      setLoading(false);
    }
  };

  const handleResetSearch = () => {
    setSearchBy("type");
    setSearchValue("");
    loadResources();
  };

  const handleBooking = (resource) => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("First you should login to the system");
      navigate("/login");
      return;
    }

    if (resource.status !== "ACTIVE") {
      alert("This resource is currently not available for booking");
      return;
    }

    navigate(`/bookings?resourceId=${resource.id}`, { state: { resource } });
  };

  return (
    <div className="facilities-page">
      <div className="facilities-header">
        <h1>Facilities & Assets Catalogue</h1>
        <p>
          Browse available lecture halls, labs, meeting rooms, and equipment.
        </p>
      </div>

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

        <button onClick={handleSearch} className="primary-btn" type="button">
          Search
        </button>

        <button onClick={handleResetSearch} className="secondary-btn" type="button">
          Reset
        </button>
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

                <button
                  className={resource.status === "ACTIVE" ? "book-btn" : "unavailable-btn"}
                  onClick={() => handleBooking(resource)}
                  disabled={resource.status !== "ACTIVE"}
                >
                  {resource.status === "ACTIVE" ? "Book Now" : "Unavailable"}
                </button>
              </div>
            ))
          ) : (
            <p className="empty-text">No resources available.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default FacilitiesPage;