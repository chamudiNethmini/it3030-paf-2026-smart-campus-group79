import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  addResource,
  getAllResources,
  searchResources,
  updateResource,
  deleteResource,
} from "../../services/resourceService";
import "./AddResource.css";

const NAME_MIN = 2;
const NAME_MAX = 200;
const LOCATION_MIN = 2;
const LOCATION_MAX = 200;
const DESCRIPTION_MAX = 500;
const CAPACITY_MIN = 1;
const CAPACITY_MAX = 50000;

const RESOURCE_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM", "EQUIPMENT"];
const RESOURCE_STATUSES = ["ACTIVE", "OUT_OF_SERVICE"];
const ROOM_TYPES = ["LECTURE_HALL", "LAB", "MEETING_ROOM"];

/** Shown in DB/catalogue when equipment has no physical location */
const EQUIPMENT_LOCATION_DEFAULT = "Portable / campus-wide";

const isRoomType = (type) => ROOM_TYPES.includes(type);
const isEquipmentType = (type) => type === "EQUIPMENT";

/** Parse "HH:MM" from time input to minutes since midnight; null if invalid */
const timeToMinutes = (value) => {
  if (!value || typeof value !== "string") return null;
  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) return null;
  const h = Number(match[1]);
  const m = Number(match[2]);
  if (!Number.isInteger(h) || !Number.isInteger(m) || h < 0 || h > 23 || m < 0 || m > 59) return null;
  return h * 60 + m;
};

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

  const validateField = (name, value, updatedForm = formData) => {
    switch (name) {
      case "name": {
        const t = String(value ?? "").trim();
        if (!t) return "Name is required";
        if (t.length < NAME_MIN) return `Name must be at least ${NAME_MIN} characters`;
        if (t.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters`;
        return "";
      }
      case "capacity": {
        if (value === "" || value === null || value === undefined) return "Capacity is required";
        const n = Number(value);
        if (Number.isNaN(n)) return "Capacity must be a valid number";
        if (!Number.isInteger(n)) return "Capacity must be a whole number";
        if (n < CAPACITY_MIN) return `Capacity must be at least ${CAPACITY_MIN}`;
        if (n > CAPACITY_MAX) return `Capacity must be at most ${CAPACITY_MAX.toLocaleString()}`;
        return "";
      }
      case "location": {
        const t = String(value ?? "").trim();
        if (!t) return "Location is required";
        if (t.length < LOCATION_MIN) return `Location must be at least ${LOCATION_MIN} characters`;
        if (t.length > LOCATION_MAX) return `Location must be at most ${LOCATION_MAX} characters`;
        return "";
      }
      case "availabilityStart": {
        if (!value) return "Start time is required";
        const startM = timeToMinutes(value);
        if (startM === null) return "Enter a valid start time";
        const endM = timeToMinutes(updatedForm.availabilityEnd);
        if (endM !== null && startM >= endM) return "Start time must be before end time";
        return "";
      }
      case "availabilityEnd": {
        if (!value) return "End time is required";
        const endM = timeToMinutes(value);
        if (endM === null) return "Enter a valid end time";
        const startM = timeToMinutes(updatedForm.availabilityStart);
        if (startM !== null && endM <= startM) return "End time must be after start time";
        return "";
      }
      case "description": {
        const t = String(value ?? "");
        if (t.length > DESCRIPTION_MAX) {
          return `Description must be at most ${DESCRIPTION_MAX} characters`;
        }
        return "";
      }
      case "type":
        if (!RESOURCE_TYPES.includes(value)) return "Select a valid resource type";
        return "";
      case "status":
        if (!RESOURCE_STATUSES.includes(value)) return "Select a valid status";
        return "";
      default:
        return "";
    }
  };

  const validateForm = () => {
    const room = isRoomType(formData.type);
    const equip = isEquipmentType(formData.type);
    const needsLocation = room || equip;

    const newErrors = {
      type: validateField("type", formData.type),
      name: equip ? validateField("name", formData.name) : "",
      capacity: validateField("capacity", formData.capacity),
      location: needsLocation ? validateField("location", formData.location) : "",
      availabilityStart: validateField("availabilityStart", formData.availabilityStart),
      availabilityEnd: validateField("availabilityEnd", formData.availabilityEnd),
      status: validateField("status", formData.status),
      description: validateField("description", formData.description),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((msg) => msg);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (name === "type") {
      if (isRoomType(value)) {
        updatedForm = { ...updatedForm, name: "" };
      }
    }

    setFormData(updatedForm);

    setErrors((prev) => {
      const fieldErr = validateField(name, updatedForm[name], updatedForm);
      const next = { ...prev, [name]: fieldErr };
      if (name === "type") {
        if (isRoomType(value)) next.name = "";
      }
      return next;
    });
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
      const room = isRoomType(formData.type);
      const equip = isEquipmentType(formData.type);

      const payload = {
        ...formData,
        capacity: Number(formData.capacity),
        availabilityStart: `${formData.availabilityStart}:00`,
        availabilityEnd: `${formData.availabilityEnd}:00`,
      };

      if (room) {
        const loc = String(formData.location ?? "").trim();
        payload.name = loc;
        payload.location = loc;
      } else if (equip) {
        const locTrim = String(formData.location ?? "").trim();
        payload.location = locTrim || EQUIPMENT_LOCATION_DEFAULT;
      }

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
    setErrors({});
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

  const handleDownloadPdf = () => {
    const doc = new jsPDF("p", "pt", "a4");
    const generatedAt = new Date().toLocaleString();
    const fileStamp = new Date().toISOString().slice(0, 10);

    doc.setFontSize(16);
    doc.text("Smart Campus - Resource Catalogue", 40, 42);
    doc.setFontSize(10);
    doc.text(`Generated: ${generatedAt}`, 40, 60);

    const rows = resources.map((resource, index) => [
      index + 1,
      resource.name || "-",
      resource.type || "-",
      resource.capacity ?? "-",
      resource.location || "-",
      `${resource.availabilityStart || "-"} - ${resource.availabilityEnd || "-"}`,
      resource.status || "-",
      resource.description || "-",
    ]);

    autoTable(doc, {
      startY: 76,
      head: [[
        "#",
        "Name",
        "Type",
        "Capacity",
        "Location",
        "Availability",
        "Status",
        "Description",
      ]],
      body: rows,
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: "middle",
      },
      headStyles: {
        fillColor: [60, 123, 255],
      },
      columnStyles: {
        0: { cellWidth: 22, halign: "center" },
        1: { cellWidth: 72 },
        2: { cellWidth: 66 },
        3: { cellWidth: 48, halign: "center" },
        4: { cellWidth: 70 },
        5: { cellWidth: 88 },
        6: { cellWidth: 52, halign: "center" },
        7: { cellWidth: "auto" },
      },
      didDrawPage: (data) => {
        doc.setFontSize(9);
        doc.text(
          `Page ${doc.getCurrentPageInfo().pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 14
        );
      },
    });

    doc.save(`resources-report-${fileStamp}.pdf`);
  };

  const room = isRoomType(formData.type);
  const equipment = isEquipmentType(formData.type);

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

          <form onSubmit={handleSubmit} className="resource-form" noValidate>
            <div className="form-group">
              <label>Resource Type</label>
              <select name="type" value={formData.type} onChange={handleChange}>
                <option value="LECTURE_HALL">Lecture Hall</option>
                <option value="LAB">Lab</option>
                <option value="MEETING_ROOM">Meeting Room</option>
                <option value="EQUIPMENT">Equipment</option>
              </select>
              {errors.type && <span className="field-error">{errors.type}</span>}
            </div>

            {equipment && (
              <div className="form-group">
                <label>Equipment name</label>
                <input
                  type="text"
                  name="name"
                  maxLength={NAME_MAX}
                  placeholder="e.g. Projector set A, DSLR camera kit"
                  value={formData.name}
                  onChange={handleChange}
                />
                {errors.name && <span className="field-error">{errors.name}</span>}
              </div>
            )}

            {(room || equipment) && (
              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  name="location"
                  maxLength={LOCATION_MAX}
                  placeholder={
                    room
                      ? "Building, floor, room (used as the catalogue name)"
                      : "Storage room, lab, or department location"
                  }
                  value={formData.location}
                  onChange={handleChange}
                />
                {errors.location && <span className="field-error">{errors.location}</span>}
              </div>
            )}

            <div className="form-group">
              <label>Capacity</label>
              <input
                type="number"
                name="capacity"
                min={CAPACITY_MIN}
                max={CAPACITY_MAX}
                step={1}
                placeholder="Enter capacity"
                value={formData.capacity}
                onChange={handleChange}
              />
              {errors.capacity && <span className="field-error">{errors.capacity}</span>}
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
              {errors.status && <span className="field-error">{errors.status}</span>}
            </div>

            <div className="form-group">
              <label>Description (optional)</label>
              <textarea
                rows="4"
                name="description"
                maxLength={DESCRIPTION_MAX}
                placeholder="Enter description"
                value={formData.description}
                onChange={handleChange}
              />
              <div className="field-hint">
                {formData.description.length}/{DESCRIPTION_MAX} characters
              </div>
              {errors.description && <span className="field-error">{errors.description}</span>}
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
            <button type="button" className="download-pdf-btn" onClick={handleDownloadPdf}>
              Download PDF
            </button>
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