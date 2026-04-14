import axios from "axios";

const API_BASE_URL = "http://localhost:8081/api/resources";

export const addResource = async (resourceData) => {
  return await axios.post(API_BASE_URL, resourceData);
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
  return await axios.put(`${API_BASE_URL}/${id}`, resourceData);
};

export const deleteResource = async (id) => {
  return await axios.delete(`${API_BASE_URL}/${id}`);
};