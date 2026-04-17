import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from "../../services/notificationService";
import "./NotificationsPage.css";
import { toast } from "react-toastify";

function NotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getNotifications();
      const count = await getUnreadCount();
      setNotifications(data);
      setUnreadCount(count);
    } catch (e) {
      console.error("Error loading notifications:", e);
      setError("Failed to load notifications. Please try again.");
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    try {
      await markAsRead(id);
      toast.success("Notification marked as read");
      loadData();
    } catch (e) {
      console.error("Error marking notification as read:", e);
      toast.error("Failed to mark notification as read");
    }
  };

  if (loading) {
    return (
      <div className="notifications-container">
        <p className="status-msg">Loading notifications... ⏳</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="notifications-container">
        <p className="status-msg error">{error}</p>
        <button className="retry-btn" onClick={loadData}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <h2>
          Notifications 🔔
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </h2>
        <div className="notifications-header-right">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
        </div>
      </div>

      {notifications.length === 0 && (
        <p className="empty">No notifications yet ✨</p>
      )}

      {notifications.map((n) => (
        <div
          key={n.id}
          className={`notification-card ${n.read ? "read" : "unread"}`}
        >
          <div>
            <p>{n.message}</p>
          </div>

          {!n.read && (
            <button onClick={() => handleRead(n.id)}>Mark as Read</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default NotificationsPage;
