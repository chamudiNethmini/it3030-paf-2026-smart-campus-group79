const BASE_URL = "http://localhost:8081/api/users";

// ✅ Login
export const loginUser = async (data) => {
  return fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
};

// ✅ Register
export const registerUser = async (data) => {
  return fetch(BASE_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  });
};

// ✅ Current logged user ගන්න
export const getCurrentUser = async () => {
  return fetch(`${BASE_URL}/me`, {
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ සියලුම users ගන්න (ADMIN only)
export const getAllUsers = async () => {
  return fetch(`${BASE_URL}/all`, {
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ User role change කරන්න (ADMIN only)
export const updateUserRole = async (userId, role) => {
  return fetch(`${BASE_URL}/${userId}/role?role=${role}`, {
    method: "PUT",
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ User delete කරන්න (ADMIN only)
export const deleteUser = async (userId) => {
  return fetch(`${BASE_URL}/${userId}`, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => res.text());
};
