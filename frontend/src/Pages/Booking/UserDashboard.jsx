import React, { useState, useEffect } from "react";
import { cancelMyBooking, getMyBookings } from "../../services/bookingService";
import { getCurrentUser } from "../../services/authService";
import { getAllResources } from "../../services/resourceService";
import "./UserDashboard.css";
import Navbar from "../../Components/Navbar";

function UserDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [user, setUser] = useState(null);
  const [resourceTypeById, setResourceTypeById] = useState({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setUserEmail(currentUser.email);

      const resourcesResponse = await getAllResources();
      if (Array.isArray(resourcesResponse.data)) {
        const map = resourcesResponse.data.reduce((acc, resource) => {
          acc[Number(resource.id)] = resource.type || "Unknown";
          return acc;
        }, {});
        setResourceTypeById(map);
      }

      // auto load bookings
      const response = await getMyBookings(currentUser.email);
      setBookings(response.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
    setMessage("");
    setError("");
    setSearched(true);

    try {
      const response = await getMyBookings(userEmail);
      setBookings(response.data);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError("Failed to load bookings");
      setBookings([]);
    }
  };

  const normalizeStatus = (status) => {
    const s = String(status || "PENDING");
    return s.includes(".") ? s.split(".").pop().toUpperCase() : s.toUpperCase();
  };

  const formatResourceType = (resourceId) => {
    const raw = resourceTypeById[Number(resourceId)];
    if (!raw) return `#${resourceId}`;
    return String(raw)
      .toLowerCase()
      .split("_")
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join(" ");
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      setError("");
      setMessage("");
      await cancelMyBooking(bookingId);
      const response = await getMyBookings(userEmail);
      setBookings(response.data);
      setMessage(`Booking #${bookingId} cancelled successfully.`);
    } catch (err) {
      console.error("Cancel booking failed:", err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          (typeof err.response?.data === "string" ? err.response.data : null) ||
          "Failed to cancel booking"
      );
    }
  };

  return (
    <>
      <Navbar />
      <div className="dashboard-page">
        <div className="dashboard-container">
          <h2>My Bookings</h2>

          {/* ✅ logged user display */}
          {user && (
            <p className="logged-user">
              Logged in as: <strong>{user.email}</strong>
            </p>
          )}

          <div className="search-bar">
            <input
              type="email"
              placeholder="Enter your email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
            />
            <button onClick={handleSearch}>View Bookings</button>
          </div>

          {message && <p className="success-message">{message}</p>}
          {error && <p className="error-message">{error}</p>}

          {searched && bookings.length === 0 && !error && (
            <p className="no-bookings">No bookings found</p>
          )}

          <div className="booking-list">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>Booking #{booking.id}</h3>
                <p>
                  <strong>Type:</strong> {formatResourceType(booking.resourceId)}
                </p>
                <p>
                  <strong>Email:</strong> {booking.userEmail}
                </p>
                <p>
                  <strong>Date:</strong> {booking.bookingDate}
                </p>
                <p>
                  <strong>Start Time:</strong> {booking.startTime}
                </p>
                <p>
                  <strong>End Time:</strong> {booking.endTime}
                </p>
                <p>
                  <strong>Purpose:</strong> {booking.purpose}
                </p>
                <p>
                  <strong>Expected Attendees:</strong>{" "}
                  {booking.expectedAttendees}
                </p>
                <p>
                  <strong>Status:</strong>
                  <span
                    className={`status ${normalizeStatus(booking.status).toLowerCase()}`}
                  >
                    {normalizeStatus(booking.status)}
                  </span>
                </p>
                {booking.adminReason && (
                  <p>
                    <strong>Admin Reason:</strong> {booking.adminReason}
                  </p>
                )}
                <p>
                  <strong>Created At:</strong> {booking.createdAt}
                </p>
                {normalizeStatus(booking.status) !== "CANCELLED" && (
                  <button
                    type="button"
                    className="cancel-booking-btn"
                    onClick={() => handleCancelBooking(booking.id)}
                  >
                    Cancel Booking
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
