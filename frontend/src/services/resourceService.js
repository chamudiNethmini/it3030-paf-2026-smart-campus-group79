import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/resources";

const getAuthConfig = () => {
  const token = localStorage.getItem("token");

  return token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    : {
        headers: {
          "Content-Type": "application/json",
        },
      };
};

export const addResource = async (resourceData) => {
  return await axios.post(API_BASE_URL, resourceData, getAuthConfig());
};

export const getAllResources = async () => {
  return await axios.get(API_BASE_URL);
};

export const getResourceById = async (id) => {
  return await axios.get(`${API_BASE_URL}/${id}`);
};

export const searchResources = async (params) => {
  return await axios.get(`${API_BASE_URL}/search`, { params });
};

export const updateResource = async (id, resourceData) => {
  return await axios.put(`${API_BASE_URL}/${id}`, resourceData, getAuthConfig());
};

export const deleteResource = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`, getAuthConfig());
};