import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getUsers,
  updateUserRole,
  deleteUser,
} from "../../services/authService";
import "./AdminRolesPage.css";

function AdminRolesPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      console.log("USERS DATA:", data);
      setUsers(Array.isArray(data) ? data : data?.data || []);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await updateUserRole(id, role);
      loadUsers();
    } catch (err) {
      alert("Failed to update role");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure?")) {
      try {
        await deleteUser(id);
        loadUsers();
      } catch (err) {
        alert("Failed to delete user");
      }
    }
  };

  if (loading) return <div className="loading">Loading users...</div>;
  if (error)
    return (
      <div className="error">
        <p>{error}</p>
        <button className="retry-btn" onClick={loadUsers}>
          Retry
        </button>
      </div>
    );

  const adminCount = users.filter((u) => u.role === "ADMIN").length;

  return (
    <div className="roles-page">
      <div className="roles-container">
        <div className="roles-header">
          <div>
            <h2>👑 Role Management</h2>
            <p>Manage user roles and permissions</p>
          </div>
          <div className="roles-header-right">
            <div className="roles-stats">
              👥 {users.length} users · 👑 {adminCount} admin
            </div>
            <button className="back-btn" onClick={() => navigate("/dashboard")}>
              ← Back to Dashboard
            </button>
          </div>
        </div>
        <div className="roles-table-wrapper">
          <table className="roles-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="user-name">{u.name}</td>
                  <td className="user-email">{u.email}</td>
                  <td>
                    <select
                      className="role-select"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                      <option value="TECHNICIAN">TECHNICIAN</option>
                    </select>
                  </td>
                  <td>
                    <button
                      className="delete-btn"
                      onClick={() => handleDelete(u.id)}
                      title="Delete user"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminRolesPage;
