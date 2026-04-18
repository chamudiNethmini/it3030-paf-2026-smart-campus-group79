import axios from "axios";

const API_URL = "http://localhost:8081/api/bookings";
const axiosWithAuth = axios.create({
  withCredentials: true,
});

export const createBooking = (bookingData) => {
  return axiosWithAuth.post(API_URL, bookingData);
};

export const getAllBookings = () => {
  return axiosWithAuth.get(API_URL);
};

export const getMyBookings = (userEmail) => {
  return axiosWithAuth.get(`${API_URL}/my?userEmail=${userEmail}`);
};

export const getBookingById = (id) => {
  return axiosWithAuth.get(`${API_URL}/${id}`);
};

export const updateBookingStatus = (id, statusData) => {
  return axiosWithAuth.patch(`${API_URL}/${id}/status`, statusData);
};

export const deleteBooking = (id) => {
  return axiosWithAuth.delete(`${API_URL}/${id}`);
};