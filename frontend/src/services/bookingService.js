import axios from "axios";

const API_URL = "http://localhost:8081/api/bookings";

export const createBooking = (bookingData) => {
  return axios.post(API_URL, bookingData);
};

export const getAllBookings = () => {
  return axios.get(API_URL);
};

export const getMyBookings = (userEmail) => {
  return axios.get(`${API_URL}/my?userEmail=${userEmail}`);
};

export const getBookingById = (id) => {
  return axios.get(`${API_URL}/${id}`);
};

export const updateBookingStatus = (id, statusData) => {
  return axios.patch(`${API_URL}/${id}/status`, statusData);
};

export const deleteBooking = (id) => {
  return axios.delete(`${API_URL}/${id}`);
};