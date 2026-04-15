import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  addResource,
  getAllResources,
  searchResources,
  updateResource,
  deleteResource,
} from "../../services/resourceService";
import "./AddResource.css";

const AddResource = () => {
  const navigate = useNavigate();

  const initialForm = {
    name: "",
    type: "LECTURE_HALL",
    capacity: "",
    location: "",
    availabilityStart: "",
    availabilityEnd: "",
    status: "ACTIVE",
    description: "",
  };

  const [formData, setFormData] = useState(initialForm);
  const [resources, setResources] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [searchBy, setSearchBy] = useState("type");
  const [searchValue, setSearchValue] = useState("");

  const loadResources = async () => {
    try {
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
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const getNameLabel = () => {
    switch (formData.type) {
      case "LECTURE_HALL":
        return "Hall Name";
      case "LAB":
        return "Lab Name";
      case "MEETING_ROOM":
        return "Meeting Room Name";
      case "EQUIPMENT":
        return "Equipment Name";
      default:
        return "Name";
    }
  };

  const validateField = (name, value, updatedForm = formData) => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Name is required";
        return "";
      case "capacity":
        if (!value) return "Capacity is required";
        if (Number(value) <= 0) return "Capacity must be greater than 0";
        return "";
      case "location":
        if (!value.trim()) return "Location is required";
        return "";
      case "availabilityStart":
        if (!value) return "Start time is required";
        if (updatedForm.availabilityEnd && value >= updatedForm.availabilityEnd) {
          return "Start time must be before end time";
        }
        return "";
      case "availabilityEnd":
        if (!value) return "End time is required";
        if (updatedForm.availabilityStart && value <= updatedForm.availabilityStart) {
          return "End time must be after start time";
        }
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      capacity: validateField("capacity", formData.capacity),
      location: validateField("location", formData.location),
      availabilityStart: validateField("availabilityStart", formData.availabilityStart),
      availabilityEnd: validateField("availabilityEnd", formData.availabilityEnd),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((msg) => msg);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...formData, [name]: value };
    setFormData(updatedForm);

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, updatedForm[name], updatedForm),
    }));
  };

  const resetForm = () => {
    setFormData(initialForm);
    setEditingId(null);
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        availabilityStart: `${formData.availabilityStart}:00`,
        availabilityEnd: `${formData.availabilityEnd}:00`,
      };

      if (editingId) {
        await updateResource(editingId, payload);
        alert("Resource updated successfully");
      } else {
        await addResource(payload);
        alert("Resource added successfully");
      }

      resetForm();
      loadResources();
    } catch (error) {
      console.error("Save error full:", error);
      console.error("Response data:", error.response?.data);

      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to save resource"
      );
    }
  };

  const handleEdit = (resource) => {
    setEditingId(resource.id);
    setFormData({
      name: resource.name || "",
      type: resource.type || "LECTURE_HALL",
      capacity: resource.capacity || "",
      location: resource.location || "",
      availabilityStart: resource.availabilityStart?.slice(0, 5) || "",
      availabilityEnd: resource.availabilityEnd?.slice(0, 5) || "",
      status: resource.status || "ACTIVE",
      description: resource.description || "",
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this resource?");
    if (!confirmDelete) return;

    try {
      await deleteResource(id);
      alert("Resource deleted successfully");
      loadResources();

      if (editingId === id) {
        resetForm();
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          "Failed to delete resource"
      );
    }
  };

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
      }

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
    }
  };

  const handleResetSearch = () => {
    setSearchBy("type");
    setSearchValue("");
    loadResources();
  };

  return (
    <div className="admin-resource-page">
      <div className="admin-resource-hero">
        <div className="admin-resource-nav">
          <div className="admin-brand">
            <div className="admin-logo">SC</div>
            <div>
              <h3>Smart Campus</h3>
              <p>Resource Management</p>
            </div>
          </div>

          <div className="admin-nav-links">
            <button onClick={() => navigate("/")} className="admin-nav-btn">
              Home
            </button>
            <button onClick={() => navigate("/facilities")} className="admin-nav-btn">
              Browse Resources
            </button>
            <button onClick={() => navigate("/admin/add-resource")} className="admin-nav-btn active-admin-nav">
              Manage Resources
            </button>
          </div>
        </div>

        <div className="admin-hero-content">
          <span className="admin-pill">ADMIN RESOURCE PANEL</span>
          <h1>{editingId ? "Update Campus Resource" : "Manage Campus Resources"}</h1>
          <p>
            Add new resources, edit details, remove outdated entries, and keep the
            campus catalogue up to date.
          </p>
        </div>
      </div>

      <div className="admin-main-content">
        <div className="resource-form-card">
          <h2>{editingId ? "Edit Resource" : "Resource Form"}</h2>

          <form onSubmit={handleSubmit} className="resource-form">
            <div className="form-group">
              <label>Resource Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
            </div>

            <div className="form-group">
              <label>{getNameLabel()}</label>
              <input
                type="text"
                name="name"
                placeholder={`Enter ${getNameLabel().toLowerCase()}`}
                value={formData.name}
                onChange={handleChange}
              />
              {errors.name && <span className="field-error">{errors.name}</span>}
            </div>

            <div className="form-two-col">
              <div className="form-group">
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Enter capacity"
                  value={formData.capacity}
                  onChange={handleChange}
                />
                {errors.capacity && <span className="field-error">{errors.capacity}</span>}
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  placeholder="Enter location"
                  value={formData.location}
                  onChange={handleChange}
                />
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
            </div>

            <div className="form-two-col">
              <div className="form-group">
                <label>Availability Start</label>
                <input
                  type="time"
                  name="availabilityStart"
                  value={formData.availabilityStart}
                  onChange={handleChange}
                />
                {errors.availabilityStart && <span className="field-error">{errors.availabilityStart}</span>}
              </div>

              <div className="form-group">
                <label>Availability End</label>
                <input
                  type="time"
                  name="availabilityEnd"
                  value={formData.availabilityEnd}
                  onChange={handleChange}
                />
                {errors.availabilityEnd && <span className="field-error">{errors.availabilityEnd}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Status</label>
              <select name="status" value={formData.status} onChange={handleChange}>
                <option value="ACTIVE">ACTIVE</option>
                <option value="OUT_OF_SERVICE">OUT_OF_SERVICE</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows="4"
                name="description"
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="primary-btn">
                {editingId ? "Update Resource" : "Add Resource"}
              </button>

              <button type="button" className="secondary-btn" onClick={resetForm}>
                Clear Form
              </button>
            </div>
          </form>
        </div>

        <div className="resource-list-card">
          <div className="resource-list-header">
            <h2>Added Resources</h2>
          </div>

          <div className="search-bar-row">
            <select value={searchBy} onChange={(e) => setSearchBy(e.target.value)}>
              <option value="type">Search by Type</option>
              <option value="capacity">Search by Capacity</option>
              <option value="location">Search by Location</option>
            </select>

            <input
              type={searchBy === "capacity" ? "number" : "text"}
              placeholder={
                searchBy === "type"
                  ? "Enter type"
                  : searchBy === "capacity"
                  ? "Enter minimum capacity"
                  : "Enter location"
              }
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
            />

            <button type="button" className="primary-btn" onClick={handleSearch}>
              Search
            </button>

            <button type="button" className="secondary-btn" onClick={handleResetSearch}>
              Reset
            </button>
          </div>

          <div className="resource-list-grid">
            {resources.length > 0 ? (
              resources.map((resource) => (
                <div className="resource-item-card" key={resource.id}>
                  <div className="resource-top">
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
                  <p><strong>Availability:</strong> {resource.availabilityStart} - {resource.availabilityEnd}</p>
                  <p><strong>Description:</strong> {resource.description || "N/A"}</p>

                  <div className="resource-card-actions">
                    <button className="edit-btn" onClick={() => handleEdit(resource)}>
                      Update
                    </button>
                    <button className="delete-btn" onClick={() => handleDelete(resource.id)}>
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p>No resources found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddResource;