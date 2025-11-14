import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import AdminDashboard from "@/pages/AdminDashboard";
import CreateInternship from "@/pages/CreateInternship";
import ManageInternships from "@/pages/ManageInternships";
import InternshipDetail from "@/pages/InternshipDetail";
import StudentDashboard from "@/pages/StudentDashboard";
import CourseDetail from "@/pages/CourseDetail";
import Courses from "@/pages/Courses";
import Documents from "@/pages/Documents";
import Calendar from "@/pages/Calendar";
import AttendanceTracking from "@/pages/AttendanceTracking";
import ReportingAnalytics from "@/pages/ReportingAnalytics";
import VerifyDocument from "@/pages/VerifyDocument";
import { AdminRoute, StudentRoute } from "@/components/ProtectedRoute";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-document" element={<VerifyDocument />} />
        
        {/* Student Routes */}
        <Route path="/dashboard" element={<StudentRoute><StudentDashboard /></StudentRoute>} />
        <Route path="/courses" element={<StudentRoute><Courses /></StudentRoute>} />
        <Route path="/courses/:courseId" element={<StudentRoute><CourseDetail /></StudentRoute>} />
        <Route path="/documents" element={<StudentRoute><Documents /></StudentRoute>} />
        <Route path="/calendar" element={<StudentRoute><Calendar /></StudentRoute>} />
        <Route path="/attendance" element={<StudentRoute><AttendanceTracking /></StudentRoute>} />
        <Route path="/reports" element={<StudentRoute><ReportingAnalytics /></StudentRoute>} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/internships" element={<AdminRoute><ManageInternships /></AdminRoute>} />
        <Route path="/admin/internships/create" element={<AdminRoute><CreateInternship /></AdminRoute>} />
        <Route path="/admin/internships/:id" element={<AdminRoute><InternshipDetail /></AdminRoute>} />
        <Route path="/admin/attendance" element={<AdminRoute><AttendanceTracking /></AdminRoute>} />
        <Route path="/admin/reports" element={<AdminRoute><ReportingAnalytics /></AdminRoute>} />
        
        <Route path="/other" element={<div className="text-center text-xl">Other Page - Coming Soon</div>} />
      </Routes>
    </Router>
  );
}
