export const getCurrentUser = async () => {
  const res = await fetch("http://localhost:8081/api/users/me", {
    credentials: "include",
  });
  return res.json();
};
