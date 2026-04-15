import React, { useState } from "react";
import { createBooking } from "../../services/bookingService";
import "./BookingPage.css";
import Navbar from "../../Components/Navbar";

function BookingPage() {
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

      console.log("Sending booking data:", bookingData);

      const response = await createBooking(bookingData);

      setMessage("Booking created successfully!");
      console.log("Success response:", response.data);

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
          "Failed to create booking"
      );
    }
  };

  return (
    <>
    <Navbar />
    <div className="booking-page">
      <div className="booking-card">
        <h2>Book a Resource</h2>

        <form onSubmit={handleSubmit}>
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

          <input
            type="date"
            name="bookingDate"
            value={formData.bookingDate}
            onChange={handleChange}
            required
          />

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

          <input
            type="text"
            name="purpose"
            placeholder="Purpose"
            value={formData.purpose}
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

          <button type="submit">Create Booking</button>
        </form>

        {message && <p className="success">{message}</p>}
        {error && <p className="error">{error}</p>}
      </div>
    </div>
     </>
  );
}

export default BookingPage;