import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateInternship from "@/pages/CreateInternship";
import ManageInternships from "@/pages/ManageInternships";
import InternshipDetail from "@/pages/InternshipDetail";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/internships" element={<ManageInternships />} />
        <Route path="/admin/internships/create" element={<CreateInternship />} />
        <Route path="/admin/internships/:id" element={<InternshipDetail />} />
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
