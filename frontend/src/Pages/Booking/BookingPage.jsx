import React, { useRef, useState } from "react";
import { createBooking } from "../../services/bookingService";
import Navbar from "../../Components/Navbar";
import "./BookingPage.css";

function BookingPage() {
  const bookingFormRef = useRef(null);

  const [formData, setFormData] = useState({
    resourceId: "",
    userEmail: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const scrollToForm = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const bookingData = {
        ...formData,
        resourceId: Number(formData.resourceId),
        expectedAttendees: Number(formData.expectedAttendees),
        bookingDate: formData.bookingDate,
        startTime:
          formData.startTime.length === 5
            ? `${formData.startTime}:00`
            : formData.startTime,
        endTime:
          formData.endTime.length === 5
            ? `${formData.endTime}:00`
            : formData.endTime
      };

      const response = await createBooking(bookingData);
      console.log("Success response:", response.data);

      setMessage("Booking created successfully!");
      setError("");

      setFormData({
        resourceId: "",
        userEmail: "",
        bookingDate: "",
        startTime: "",
        endTime: "",
        purpose: "",
        expectedAttendees: ""
      });
    } catch (err) {
      console.error("Booking error:", err);
      console.error("Response data:", err.response?.data);

      setError(
        err.response?.data?.message ||
          err.response?.data?.error ||
          JSON.stringify(err.response?.data) ||
          err.message ||
          "Failed to create booking"
      );
    }
  };

  return (
    <>
      <Navbar />

      <section className="booking-hero">
        <div className="booking-hero-overlay">
          <div className="booking-hero-content">
            <p className="booking-hero-tag">SMART CAMPUS BOOKING</p>
            <h1>Book Campus Resources with Ease</h1>
            <p className="booking-hero-text">
              Reserve lecture halls, labs, and university spaces through the
              Smart Campus Hub quickly and efficiently for academic and campus
              activities.
            </p>

            <div className="booking-hero-buttons">
              <button onClick={scrollToForm}>Create Booking</button>
              <a href="/dashboard">My Bookings</a>
            </div>
          </div>
        </div>
      </section>

      <section className="booking-form-section" ref={bookingFormRef}>
        <div className="booking-form-wrapper">
          <div className="booking-form-card">
            <div className="booking-form-header">
              <p className="booking-form-badge">Resource Reservation Form</p>
              <h2>Book a Resource</h2>
              <p>
                Fill in the booking details below to reserve a campus resource.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="booking-grid">
                <input
                  type="number"
                  name="resourceId"
                  placeholder="Resource ID"
                  value={formData.resourceId}
                  onChange={handleChange}
                  required
                />

                <input
                  type="email"
                  name="userEmail"
                  placeholder="User Email"
                  value={formData.userEmail}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="booking-grid">
                <input
                  type="date"
                  name="bookingDate"
                  value={formData.bookingDate}
                  onChange={handleChange}
                  required
                />

                <input
                  type="number"
                  name="expectedAttendees"
                  placeholder="Expected Attendees"
                  value={formData.expectedAttendees}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="booking-grid">
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                />

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                />
              </div>

              <input
                type="text"
                name="purpose"
                placeholder="Purpose"
                value={formData.purpose}
                onChange={handleChange}
                required
              />

              <button type="submit" className="booking-submit-btn">
                Create Booking
              </button>
            </form>

            {message && <p className="success">{message}</p>}
            {error && <p className="error">{error}</p>}
          </div>

          <div className="booking-side-card">
            <h3>Why use Smart Campus Booking?</h3>

            <div className="booking-feature">
              <span>01</span>
              <div>
                <h4>Fast reservations</h4>
                <p>Book resources quickly without manual paper-based requests.</p>
              </div>
            </div>

            <div className="booking-feature">
              <span>02</span>
              <div>
                <h4>Conflict prevention</h4>
                <p>Prevent overlapping bookings with automatic time checks.</p>
              </div>
            </div>

            <div className="booking-feature">
              <span>03</span>
              <div>
                <h4>Simple workflow</h4>
                <p>Track booking status from pending to approved or rejected.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default BookingPage;