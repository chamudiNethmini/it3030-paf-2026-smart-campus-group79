import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import FacilitiesPage from "./Pages/Facilities/FacilitiesPage";
import AddResource from "./Pages/Admin/AddResource";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<FacilitiesPage />} />
        <Route path="/facilities" element={<FacilitiesPage />} />
        <Route path="/admin/add-resource" element={<AddResource />} />
      </Routes>
    </Router>
  );
}

export default App;