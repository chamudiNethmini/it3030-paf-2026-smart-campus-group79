const BASE_URL = "http://localhost:8081/api/notifications";

export const getNotifications = async () => {
  return fetch(`${BASE_URL}/user`, { credentials: "include" }).then((res) =>
    res.json(),
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
  }).then((res) => res.json());
};
