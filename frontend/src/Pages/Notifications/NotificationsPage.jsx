import React, { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
  getUnreadCount,
} from "../../services/notificationService";
import Navbar from "../../Components/Navbar";
import "./NotificationsPage.css";
import { toast } from "react-toastify";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true); // ✅ FROM v1
  const [error, setError] = useState(null); // ✅ FROM v1

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    // ✅ try-catch FROM v1
    try {
      const data = await getNotifications();
      const count = await getUnreadCount(); // ✅ FROM v2
      setNotifications(data);
      setUnreadCount(count);
    } catch (e) {
      console.error("Error loading notifications:", e);
      setError("Failed to load notifications. Please try again.");
      toast.error("Failed to load notifications"); // ✅ FROM v1
    } finally {
      setLoading(false);
    }
  };

  const handleRead = async (id) => {
    // ✅ try-catch FROM v1
    try {
      await markAsRead(id);
      toast.success("Notification marked as read"); // ✅ FROM v1
      loadData(); // reload after marking
    } catch (e) {
      console.error("Error marking notification as read:", e);
      toast.error("Failed to mark notification as read"); // ✅ FROM v1
    }
  };

  // ✅ Loading state FROM v1
  if (loading) {
    return (
      <>
        <Navbar />
        <div className="notifications-container">
          <p className="status-msg">Loading notifications... ⏳</p>
        </div>
      </>
    );
  }

  // ✅ Error state FROM v1 (with Retry button)
  if (error) {
    return (
      <>
        <Navbar />
        <div className="notifications-container">
          <p className="status-msg error">{error}</p>
          <button className="retry-btn" onClick={loadData}>
            Retry
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="notifications-container">
        {/* ✅ Unread badge FROM v2 */}
        <h2>
          Notifications 🔔
          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
        </h2>

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
    </>
  );
}

export default NotificationsPage;
