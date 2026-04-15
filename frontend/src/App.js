import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import ResourceHome from "./Pages/Home/ResourceHome";
import FacilitiesPage from "./Pages/Facilities/FacilitiesPage";
import AddResource from "./Pages/Admin/AddResource";
import BookingPage from "./Pages/Booking/BookingPage";
import UserDashboard from "./Pages/Booking/UserDashboard";
import ManageBookings from "./Pages/Admin/ManageBookings";

function App() {
  return (
    <Router>
      <Routes>
         <Route path="/" element={<ResourceHome />} />
        <Route path="/" element={<AddResource />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/admin/add-resource" element={<AddResource />} />
         <Route path="/bookings" element={<BookingPage />} />
         <Route path="/dashboard" element={<UserDashboard />} />
         <Route path="/admin/bookings" element={<ManageBookings />} />
      </Routes>
    </Router>
  );
}

export default App;