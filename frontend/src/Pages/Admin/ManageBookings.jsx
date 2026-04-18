import React, { useEffect, useState } from "react";
import {
  getAllBookings,
  updateBookingStatus,
  deleteBooking
} from "../../services/bookingService";
import "./ManageBookings.css";
import Navbar from "../../Components/Navbar";


function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [reasonInputs, setReasonInputs] = useState({});

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await getAllBookings();
      setBookings(response.data);
      setError("");
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
    }
  };

  const handleReasonChange = (id, value) => {
    setReasonInputs((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleStatusUpdate = async (id, status) => {
    setMessage("");
    setError("");

    try {
      const body = {
        status,
        adminReason: status === "REJECTED" ? reasonInputs[id] || "" : null
      };

      await updateBookingStatus(id, body);
      setMessage(`Booking ${id} updated to ${status}`);
      fetchBookings();
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
      fetchBookings();
    } catch (err) {
      console.error("Error deleting booking:", err);
      setError("Failed to delete booking");
    }
  };

  const filteredBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((booking) => booking.status === statusFilter);

  return (
    <>
    <Navbar/>
    <div className="manage-bookings-page">
      <div className="manage-bookings-container">
        <h2>Manage Bookings</h2>

        <div className="top-bar">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All</option>
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <button onClick={fetchBookings}>Refresh</button>
        </div>

        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}

        <div className="booking-grid">
          {filteredBookings.length > 0 ? (
            filteredBookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>Booking #{booking.id}</h3>
                <p><strong>Resource ID:</strong> {booking.resourceId}</p>
                <p><strong>User Email:</strong> {booking.userEmail}</p>
                <p><strong>Date:</strong> {booking.bookingDate}</p>
                <p><strong>Start Time:</strong> {booking.startTime}</p>
                <p><strong>End Time:</strong> {booking.endTime}</p>
                <p><strong>Purpose:</strong> {booking.purpose}</p>
                <p><strong>Expected Attendees:</strong> {booking.expectedAttendees}</p>
                <p>
                  <strong>Status:</strong>
                  <span className={`status ${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </p>
                {booking.adminReason && (
                  <p><strong>Admin Reason:</strong> {booking.adminReason}</p>
                )}
                <p><strong>Created At:</strong> {booking.createdAt}</p>

                <div className="admin-actions">
                  <textarea
                    placeholder="Enter rejection reason"
                    value={reasonInputs[booking.id] || ""}
                    onChange={(e) =>
                      handleReasonChange(booking.id, e.target.value)
                    }
                  />

                  <div className="button-group">
                    <button
                      className="approve-btn"
                      onClick={() => handleStatusUpdate(booking.id, "APPROVED")}
                    >
                      Approve
                    </button>

                    <button
                      className="reject-btn"
                      onClick={() => handleStatusUpdate(booking.id, "REJECTED")}
                    >
                      Reject
                    </button>

                    <button
                      className="cancel-btn"
                      onClick={() => handleStatusUpdate(booking.id, "CANCELLED")}
                    >
                      Cancel
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(booking.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="no-bookings">No bookings found</p>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ManageBookings;