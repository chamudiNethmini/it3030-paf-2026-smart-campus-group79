import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateUserRole, getAllUsers } from "../../services/authService";
import Navbar from "../../Components/Navbar";
import "./RoleManagement.css";

function RoleManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log("Fetching users from /api/users/all...");
      const data = await getAllUsers();
      console.log("✅ Users data received:", data);
      // ✅ FIX: handle both {data: [...]} and direct array
      const userList = Array.isArray(data) ? data : data?.data || [];
      setUsers(userList);
      console.log("✅ Users set in state:", userList);
      setError(null);
    } catch (err) {
      console.error("❌ Error fetching users:", err);
      let errorMsg = "Failed to load users";
      if (err.response?.status === 403) {
        errorMsg = "Access denied - You don't have admin permissions";
      } else if (err.response?.status === 401) {
        errorMsg = "Not authenticated - Please login again";
      } else if (err.response?.status === 500) {
        errorMsg = "Server error - Please try again later";
      }
      setError(errorMsg);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await updateUserRole(id, role);
      alert("Role updated!");
      setUsers(users.map((u) => (u.id === id ? { ...u, role } : u)));
    } catch (err) {
      console.error("Error updating role:", err);
      alert("Failed to update role");
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="role-loading">Loading users...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="role-container">
          <div className="role-error">
            <p>❌ {error}</p>
            <button onClick={fetchUsers} className="role-retry-btn">
              Retry
            </button>
          </div>
        </div>
      </>
    );
  }

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <>
      <Navbar />
      <div className="role-container">
        <div className="role-header">
          <div>
            <h2>Role Management 👑</h2>
            <p>Manage user roles and permissions</p>
          </div>
          <div className="role-header-right">
            <div className="role-stats">
              👥 {users.length} users · 👑 {adminCount} admin
            </div>
            {/* ✅ Back to Dashboard button (like NotificationsPage) */}
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>

        <div className="role-card">
          <table className="role-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Change Role</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="role-empty">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td className="role-user-info">
                      <span className="role-user-name">{u.name}</span>
                    </td>
                    <td className="role-user-email">{u.email}</td>
                    <td>
                      <span
                        className={`role-badge ${u.role === "ADMIN" ? "role-badge-admin" : "role-badge-user"}`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <select
                        className="role-select"
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        <option value="USER">USER</option>
                        <option value="ADMIN">ADMIN</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default RoleManagement;
