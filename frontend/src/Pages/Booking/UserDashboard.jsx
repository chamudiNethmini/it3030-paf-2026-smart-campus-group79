import React, { useState, useEffect } from "react";
import { getMyBookings } from "../../services/bookingService";
import { getCurrentUser } from "../../services/authService";
import "./UserDashboard.css";
import Navbar from "../../Components/Navbar";

function UserDashboard() {
  const [userEmail, setUserEmail] = useState("");
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      setUserEmail(currentUser.email);

      // auto load bookings
      const response = await getMyBookings(currentUser.email);
      setBookings(response.data);
      setSearched(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSearch = async () => {
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

          {error && <p className="error-message">{error}</p>}

          {searched && bookings.length === 0 && !error && (
            <p className="no-bookings">No bookings found</p>
          )}

          <div className="booking-list">
            {bookings.map((booking) => (
              <div className="booking-card" key={booking.id}>
                <h3>Booking #{booking.id}</h3>
                <p>
                  <strong>Resource ID:</strong> {booking.resourceId}
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
                  <span className={`status ${booking.status?.toLowerCase()}`}>
                    {booking.status}
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
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
