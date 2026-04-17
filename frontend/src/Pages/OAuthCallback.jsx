import React, { useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

function OAuthCallback() {
  const navigate = useNavigate();
  const { setUser, user } = useContext(AuthContext);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log("OAuth callback: Starting...");

        // Wait for session to be established
        await new Promise((resolve) => setTimeout(resolve, 1000));
        console.log("Session wait complete, fetching user...");

        const response = await fetch("http://localhost:8081/api/users/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", response.headers);

        if (response.ok) {
          const userData = await response.json();
          console.log("✅ User data received:", userData);

          if (userData && userData.email) {
            console.log("Email found:", userData.email);
            setUser(userData);
            localStorage.setItem("user", JSON.stringify(userData));

            // Wait a moment for state to update then navigate
            await new Promise((resolve) => setTimeout(resolve, 300));
            console.log("Navigating to dashboard...");
            navigate("/dashboard", { replace: true });
          } else {
            console.warn("❌ No email in response:", userData);
            // Try again
            setTimeout(() => (window.location.href = "/dashboard"), 500);
          }
        } else {
          const responseText = await response.text();
          console.error("❌ Error response:", response.status, responseText);

          // If 401/403, redirect to login
          if (response.status === 401 || response.status === 403) {
            console.log("Unauthorized, redirecting to login...");
            navigate("/login", { replace: true });
          } else {
            // Try navigation anyway
            setTimeout(() => navigate("/dashboard", { replace: true }), 1000);
          }
        }
      } catch (err) {
        console.error("❌ OAuth callback error:", err);
        // On error, redirect to login
        setTimeout(() => navigate("/login", { replace: true }), 500);
      }
    };

    handleCallback();
  }, [navigate, setUser]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#060e1f",
        color: "white",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <p>Completing login... ⏳</p>
      <p style={{ fontSize: "12px", color: "#999" }}>
        Authenticating with your account
      </p>
      <div style={{ fontSize: "10px", color: "#666", marginTop: "20px" }}>
        {user?.email ? `Logged in as: ${user.email}` : "Setting up session..."}
      </div>
    </div>
  );
}

export default OAuthCallback;
