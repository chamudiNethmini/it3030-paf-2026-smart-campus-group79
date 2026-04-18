import React, { useContext, useEffect, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { createBooking } from "../../services/bookingService";
import { getResourceById } from "../../services/resourceService";
import { AuthContext } from "../../context/AuthContext";
import Navbar from "../../Components/Navbar";
import "./BookingPage.css";

const formatTimeForInput = (value) => {
  if (!value) return "";
  const str = String(value);
  return str.length >= 5 ? str.slice(0, 5) : str;
};

const timeToMinutes = (value) => {
  if (!value) return null;
  const parts = String(value).split(":");
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const mins = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(mins)) return null;
  return hours * 60 + mins;
};

function BookingPage() {
  const bookingFormRef = useRef(null);
  const [searchParams] = useSearchParams();
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    resourceId: "",
    resourceType: "",
    userEmail: "",
    bookingDate: "",
    startTime: "",
    endTime: "",
    purpose: "",
    expectedAttendees: ""
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [resourceAvailability, setResourceAvailability] = useState({
    start: "",
    end: "",
  });
  const [resourceCapacity, setResourceCapacity] = useState(null);

  const scrollToForm = () => {
    bookingFormRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const rid = searchParams.get("resourceId");
    if (rid != null && String(rid).trim() !== "") {
      const id = String(rid).trim();
      setFormData((prev) => ({ ...prev, resourceId: id, resourceType: "" }));
      const t = window.setTimeout(() => scrollToForm(), 250);
      return () => window.clearTimeout(t);
    }
  }, [searchParams]);

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      userEmail: user?.email || "",
    }));
  }, [user?.email]);

  useEffect(() => {
    const id = Number(formData.resourceId);
    if (!id) {
      setResourceAvailability({ start: "", end: "" });
      setResourceCapacity(null);
      setFormData((prev) => ({ ...prev, resourceType: "" }));
      return;
    }

    let isMounted = true;
    const loadResource = async () => {
      try {
        const response = await getResourceById(id);
        const resource = response?.data;
        if (!isMounted || !resource) return;

        setFormData((prev) => ({
          ...prev,
          resourceType: resource.type || "",
        }));
        setResourceAvailability({
          start: formatTimeForInput(resource.availabilityStart),
          end: formatTimeForInput(resource.availabilityEnd),
        });
        setResourceCapacity(
          Number.isFinite(Number(resource.capacity))
            ? Number(resource.capacity)
            : null
        );
      } catch (err) {
        if (!isMounted) return;
        setResourceAvailability({ start: "", end: "" });
        setResourceCapacity(null);
        setFormData((prev) => ({ ...prev, resourceType: "" }));
        setError("Failed to load selected resource details.");
      }
    };

    loadResource();
    return () => {
      isMounted = false;
    };
  }, [formData.resourceId]);

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

    if (!formData.resourceId) {
      setError("Please select a resource from Facilities before booking.");
      return;
    }

    const startMinutes = timeToMinutes(formData.startTime);
    const endMinutes = timeToMinutes(formData.endTime);
    const availableStart = timeToMinutes(resourceAvailability.start);
    const availableEnd = timeToMinutes(resourceAvailability.end);

    if (startMinutes == null || endMinutes == null) {
      setError("Please enter valid start and end times.");
      return;
    }

    if (endMinutes <= startMinutes) {
      setError("End time must be later than start time.");
      return;
    }

    if (
      availableStart != null &&
      availableEnd != null &&
      (startMinutes < availableStart || endMinutes > availableEnd)
    ) {
      setError(
        `Booking time must be within resource availability (${resourceAvailability.start} - ${resourceAvailability.end}).`
      );
      return;
    }

    const attendees = Number(formData.expectedAttendees);
    if (!Number.isFinite(attendees) || attendees <= 0) {
      setError("Expected attendees must be greater than zero.");
      return;
    }

    if (resourceCapacity != null && attendees > resourceCapacity) {
      setError(
        `Expected attendees must be less than or equal to resource capacity (${resourceCapacity}).`
      );
      return;
    }

    try {
      const bookingData = {
        resourceId: Number(formData.resourceId),
        userEmail: formData.userEmail,
        expectedAttendees: attendees,
        bookingDate: formData.bookingDate,
        purpose: formData.purpose,
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
        resourceId: formData.resourceId,
        resourceType: formData.resourceType,
        userEmail: user?.email || "",
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
                  type="text"
                  name="resourceType"
                  placeholder="Resource Type"
                  value={formData.resourceType}
                  readOnly
                  className="readonly-input"
                />

                <input
                  type="email"
                  name="userEmail"
                  placeholder="User Email"
                  value={formData.userEmail}
                  readOnly
                  className="readonly-input"
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
                  min="1"
                  max={resourceCapacity ?? undefined}
                  required
                />
              </div>

              <div className="booking-grid">
                <input
                  type="time"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  min={resourceAvailability.start || undefined}
                  max={resourceAvailability.end || undefined}
                  required
                />

                <input
                  type="time"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  min={resourceAvailability.start || undefined}
                  max={resourceAvailability.end || undefined}
                  required
                />
              </div>

              <p className="availability-hint">
                Availability:{" "}
                {resourceAvailability.start && resourceAvailability.end
                  ? `${resourceAvailability.start} - ${resourceAvailability.end}`
                  : "Select a resource from Facilities to load availability"}
              </p>
              <p className="availability-hint">
                Capacity:{" "}
                {resourceCapacity != null
                  ? `Up to ${resourceCapacity} attendees`
                  : "Select a resource from Facilities to load capacity"}
              </p>

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