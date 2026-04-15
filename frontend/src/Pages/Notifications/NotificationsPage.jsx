import React, { useEffect, useState } from "react";
import {
  getNotifications,
  markAsRead,
} from "../../services/notificationService";
import Navbar from "../../Components/Navbar";

function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    const data = await getNotifications();
    setNotifications(data);
  };

  const handleRead = async (id) => {
    await markAsRead(id);
    loadNotifications();
  };

  return (
    <>
      <Navbar />
      <div style={{ padding: "20px" }}>
        <h2>Notifications 🔔</h2>

        {notifications.map((n) => (
          <div
            key={n.id}
            style={{
              background: n.read ? "#eee" : "#ffdede",
              padding: "10px",
              margin: "10px 0",
              borderRadius: "8px",
            }}
          >
            <p>{n.message}</p>

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
