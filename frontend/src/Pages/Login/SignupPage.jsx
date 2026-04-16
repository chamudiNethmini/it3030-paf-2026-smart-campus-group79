import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../services/authService";
import "./SignupPage.css";

function SignupPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  // ✅ Name validation - only letters and spaces, no numbers
  const isValidName = (name) => {
    const nameRegex = /^[A-Za-z\s]+$/;
    return nameRegex.test(name);
  };

  // ✅ Email validation
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // ✅ Password validation (8-12 characters)
  const isValidPassword = (password) => {
    return password.length >= 8 && password.length <= 12;
  };

  const validateField = (name, value) => {
    let error = "";

    switch (name) {
      case "name":
        if (!value.trim()) {
          error = "Full name is required";
        } else if (!isValidName(value)) {
          error = "Name can only contain letters and spaces (no numbers)";
        }
        break;

      case "email":
        if (!value.trim()) {
          error = "Email address is required";
        } else if (!isValidEmail(value)) {
          error = "Please enter a valid email address (e.g., name@example.com)";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required";
        } else if (!isValidPassword(value)) {
          error = "Password must be 8-12 characters long";
        }
        break;

      default:
        break;
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return error === "";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    validateField(name, value);
  };

  const handleSignup = async () => {
    const isNameValid = validateField("name", form.name);
    const isEmailValid = validateField("email", form.email);
    const isPasswordValid = validateField("password", form.password);

    if (!isNameValid || !isEmailValid || !isPasswordValid) {
      return;
    }

    setLoading(true);
    try {
      await registerUser(form);
      alert("Signup successful! Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google?prompt=select_account";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSignup();
    }
  };

  // ✅ Clear browser autofill value on focus
  const handleEmailFocus = (e) => {
    if (e.target.value === "gwannisekara@gmail.com") {
      setForm((prev) => ({ ...prev, email: "" }));
    }
  };

  return (
    <div className="signup-page">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="signup-card">
        {/* Logo */}
        <div className="signup-logo">
          <div className="signup-logo-circle">SC</div>
          <div className="signup-logo-text">
            <h1>Smart Campus</h1>
            <p>Operations Hub</p>
          </div>
        </div>

        <div className="signup-divider" />

        {/* Welcome text */}
        <div className="signup-welcome">
          <h2>Create Account</h2>
          <p>Join Smart Campus to manage resources, bookings, and more.</p>
        </div>

        {/* Name input */}
        <input
          type="text"
          name="name"
          placeholder="Full Name (Letters only)"
          className={`signup-input ${errors.name ? "error" : ""}`}
          value={form.name}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        {errors.name && <div className="signup-error">{errors.name}</div>}

        {/* Email input with autofill fix */}
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          autoComplete="off"
          className={`signup-input ${errors.email ? "error" : ""}`}
          value={form.email}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          onFocus={handleEmailFocus}
        />
        {errors.email && <div className="signup-error">{errors.email}</div>}

        {/* Password input */}
        <input
          type="password"
          name="password"
          placeholder="Password (8-12 characters)"
          className={`signup-input ${errors.password ? "error" : ""}`}
          value={form.password}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
        />
        {errors.password && (
          <div className="signup-error">{errors.password}</div>
        )}

        <button
          className="signup-btn"
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        <div className="signup-or">OR</div>

        <button className="signup-google-btn" onClick={handleGoogleLogin}>
          <svg className="google-icon" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        <p className="signup-note">
          🔒 Password must be 8-12 characters long
          <br />
          🔒 Name can only contain letters and spaces
        </p>

        <p className="login-link" onClick={() => navigate("/login")}>
          Already have an account? <span>Login</span>
        </p>
      </div>
    </div>
  );
}

export default SignupPage;
