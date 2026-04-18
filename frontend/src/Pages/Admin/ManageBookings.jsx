import React, { useEffect, useState } from "react";
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} from "../../services/bookingService";
import { getAllResources } from "../../services/resourceService";
import "./ManageBookings.css";

const STATUS_VALUES = ["PENDING", "APPROVED", "REJECTED", "CANCELLED"];

function normalizeStatus(status) {
  if (status == null) return "PENDING";
  const s = String(status);
  return s.includes(".") ? s.split(".").pop().toUpperCase() : s.toUpperCase();
}

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [resourceTypeById, setResourceTypeById] = useState({});
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [emailFilterInput, setEmailFilterInput] = useState("");
  const [emailFilterApplied, setEmailFilterApplied] = useState("");
  const [reasonInputs, setReasonInputs] = useState({});

  useEffect(() => {
    fetchPageData();
  }, []);

  const fetchPageData = async () => {
    try {
      const [bookingsResponse, resourcesResponse] = await Promise.all([
        getAllBookings(),
        getAllResources(),
      ]);

      const bookingPayload = bookingsResponse?.data;
      if (Array.isArray(bookingPayload)) {
        setBookings(bookingPayload);
        setReasonInputs({});
        setError("");
      } else {
        setBookings([]);
        setError(
          "Unexpected response while loading bookings. Please login again."
        );
      }

      const resourcesPayload = resourcesResponse?.data;
      if (Array.isArray(resourcesPayload)) {
        const map = resourcesPayload.reduce((acc, resource) => {
          const key = Number(resource.id);
          if (!Number.isNaN(key)) {
            acc[key] = resource.type || "Unknown";
          }
          return acc;
        }, {});
        setResourceTypeById(map);
      } else {
        setResourceTypeById({});
      }
    } catch (err) {
      console.error("Error fetching page data:", err);
      setError("Failed to load bookings");
    }
  };

  const displayResourceType = (resourceId) => {
    const rawType = resourceTypeById[Number(resourceId)];
    if (!rawType) return "Unknown";
    return String(rawType)
      .toLowerCase()
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  };

  const handleReasonChange = (id, value) => {
    setReasonInputs((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleStatusChange = async (booking, nextStatus) => {
    const normalized = normalizeStatus(nextStatus);
    const current = normalizeStatus(booking.status);
    if (normalized === current) return;

    setMessage("");
    setError("");

    const mergedReason =
      reasonInputs[booking.id] !== undefined
        ? reasonInputs[booking.id]
        : booking.adminReason || "";

    if (normalized === "REJECTED") {
      const reason = mergedReason.trim();
      if (!reason) {
        setError(
          "Enter a rejection reason in the Reason field before selecting rejected."
        );
        return;
      }
    }

    try {
      const body = {
        status: normalized,
        adminReason: normalized === "REJECTED" ? mergedReason.trim() : null,
      };

      await updateBookingStatus(booking.id, body);
      setMessage(`Booking #${booking.id} updated to ${normalized.toLowerCase()}`);
      fetchPageData();
    } catch (err) {
      console.error("Error updating booking:", err);
      setError("Failed to update booking status");
    }
  };

  const handleDelete = async (id) => {
    setMessage("");
    setError("");

    try {
      await deleteBooking(id);
      setMessage(`Booking ${id} deleted successfully`);
      fetchPageData();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking");
    }
  };

  const safeBookings = Array.isArray(bookings) ? bookings : [];
  const filteredBookings = safeBookings.filter((booking) => {
    if (statusFilter !== "ALL" && normalizeStatus(booking.status) !== statusFilter) {
      return false;
    }
    if (emailFilterApplied) {
      const email = (booking.userEmail || "").toLowerCase();
      if (!email.includes(emailFilterApplied)) return false;
    }
    return true;
  });

  const applyFilters = () => {
    setEmailFilterApplied(emailFilterInput.trim().toLowerCase());
  };

  return (
    <div className="manage-bookings-page">
      <div className="manage-bookings-container">
        <header className="manage-bookings-header">
          <div>
            <span className="manage-bookings-badge">Admin booking control</span>
            <h1 className="manage-bookings-title">Manage all booking requests</h1>
          </div>
          <div className="manage-bookings-stat-card">
            <p className="stat-label">Total visible bookings</p>
            <p className="stat-value">{filteredBookings.length}</p>
          </div>
        </header>
        <p className="manage-bookings-subtitle">
          Review booking requests, filter records, and approve or reject requests
          with a reason.
        </p>

        <section className="filters-card">
          <div className="filters-card-header">
            <h2>Filters</h2>
            <p>Use filters to quickly find booking requests.</p>
          </div>

          <div className="filters-toolbar">
            <button type="button" className="btn-secondary" onClick={fetchPageData}>
              Refresh
            </button>
          </div>

          <div className="filters-row">
            <label className="filter-field">
              <span>Status</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All</option>
                {STATUS_VALUES.map((s) => (
                  <option key={s} value={s}>
                    {s[0] + s.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </label>
            <label className="filter-field filter-field-grow">
              <span>User Email</span>
              <input
                type="text"
                placeholder="Search by user email"
                value={emailFilterInput}
                onChange={(e) => setEmailFilterInput(e.target.value)}
              />
            </label>
            <button type="button" className="btn-primary filter-apply-btn" onClick={applyFilters}>
              Apply Filters
            </button>
          </div>
        </section>

        <section className="table-intro">
          <h2>Booking Requests</h2>
          <p className="manage-bookings-subtitle">
            Approve or reject pending requests from here.
          </p>
          <ul className="status-legend">
            <li>
              <span className="dot pending" /> Pending
            </li>
            <li>
              <span className="dot approved" /> Approved
            </li>
            <li>
              <span className="dot rejected" /> Rejected
            </li>
            <li>
              <span className="dot cancelled" /> Cancelled
            </li>
          </ul>
        </section>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <section className="table-card">
          <div className="table-wrap">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resource</th>
                  <th>User</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Reason</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-bookings-cell">
                      No bookings found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((booking) => {
                    const st = normalizeStatus(booking.status);
                    return (
                      <tr key={booking.id}>
                        <td>{booking.id}</td>
                        <td>
                          <p className="resource-type-text">
                            {displayResourceType(booking.resourceId)}
                          </p>
                          <p className="resource-id-text">#{booking.resourceId}</p>
                        </td>
                        <td>{booking.userEmail}</td>
                        <td>{booking.bookingDate}</td>
                        <td className="cell-nowrap">
                          {booking.startTime} - {booking.endTime}
                        </td>
                        <td>
                          <select
                            className={`status-select status-select-${st.toLowerCase()}`}
                            value={st}
                            onChange={(e) =>
                              handleStatusChange(booking, e.target.value)
                            }
                          >
                            {STATUS_VALUES.map((s) => (
                              <option key={s} value={s}>
                                {s.toLowerCase()}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td>
                          <input
                            type="text"
                            className="reason-input"
                            placeholder="Required when setting rejected"
                            value={
                              reasonInputs[booking.id] !== undefined
                                ? reasonInputs[booking.id]
                                : booking.adminReason || ""
                            }
                            onChange={(e) =>
                              handleReasonChange(booking.id, e.target.value)
                            }
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="btn-delete"
                            onClick={() => handleDelete(booking.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ManageBookings;
