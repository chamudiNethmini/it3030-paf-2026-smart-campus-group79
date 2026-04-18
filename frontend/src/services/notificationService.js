const BASE_URL = "http://localhost:8081/api/notifications";

const handleJsonResponse = async (res) => {
  if (!res.ok) {
    throw new Error(`Notification request failed: ${res.status}`);
  }
  return res.json();
};

export const getNotifications = async () => {
  return fetch(`${BASE_URL}/user`, { credentials: "include" }).then(
    handleJsonResponse,
  );
};

export const markAsRead = async (id) => {
  return fetch(`${BASE_URL}/${id}/read`, {
    method: "PUT",
    credentials: "include",
  });
};

export const getUnreadCount = async () => {
  return fetch(`${BASE_URL}/user/unread`, {
    credentials: "include",
  }).then(handleJsonResponse);
};
