import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [hovering, setHovering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      // Email/password login (future use)
      navigate("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:8081/oauth2/authorization/google?prompt=select_account&access_type=offline";
  };

  return (
    <div className="login-page">
      {/* Background blobs */}
      <div className="blob blob-1" />
      <div className="blob blob-2" />
      <div className="blob blob-3" />

      <div className="login-card">
        {/* Logo */}
        <div className="login-logo">
          <div className="login-logo-circle">SC</div>
          <div className="login-logo-text">
            <h1>Smart Campus</h1>
            <p>Operations Hub</p>
          </div>
        </div>

        {/* Divider */}
        <div className="login-divider" />

        {/* Welcome text */}
        <div className="login-welcome">
          <h2>Welcome Back</h2>
          <p>
            Sign in to manage campus resources, bookings, and notifications.
          </p>
        </div>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {/* Login button */}
        <button onClick={handleLogin}>Login</button>

        {/* Google Login Button */}
        <button
          className={`google-btn ${hovering ? "hovered" : ""}`}
          onClick={handleGoogleLogin}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          <svg
            className="google-icon"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
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

        {/* Info note */}
        <p className="login-note">
          🔒 Your account role (Admin / User) is assigned automatically based on
          your email.
        </p>

        {/* Signup link */}
        <p
          className="signup-link"
          onClick={() => navigate("/signup")}
          style={{ cursor: "pointer" }}
        >
          Don't have an account? Sign up
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
