const BASE_URL = "http://localhost:8081/api/users";

// ✅ Login (returns fetch Response)
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

// ✅ Register (returns fetch Response)
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

// ✅ Current logged user (returns parsed JSON)
export const getCurrentUser = async () => {
  return fetch(`${BASE_URL}/me`, {
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ Get all users (ADMIN only) – returns parsed JSON
export const getAllUsers = async () => {
  return fetch(`${BASE_URL}/all`, {
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ Alias for getAllUsers (same as above)
export const getUsers = async () => {
  return getAllUsers();
};

// ✅ Update user role (ADMIN only) – returns parsed JSON
export const updateUserRole = async (userId, role) => {
  return fetch(`${BASE_URL}/${userId}/role?role=${role}`, {
    method: "PUT",
    credentials: "include",
  }).then((res) => res.json());
};

// ✅ Delete user (ADMIN only) – returns response text
export const deleteUser = async (userId) => {
  return fetch(`${BASE_URL}/${userId}`, {
    method: "DELETE",
    credentials: "include",
  }).then((res) => res.text());
};
