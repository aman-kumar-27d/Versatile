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
import Unauthorized from "@/pages/Unauthorized";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/ProtectedRoute";
import AdminLayout from "@/layouts/AdminLayout";
import StudentLayout from "@/layouts/StudentLayout";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-document" element={<VerifyDocument />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
        
        {/* Student Routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <StudentLayout>
              <StudentDashboard />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses" element={
          <ProtectedRoute>
            <StudentLayout>
              <Courses />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/courses/:courseId" element={
          <ProtectedRoute>
            <StudentLayout>
              <CourseDetail />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/documents" element={
          <ProtectedRoute>
            <StudentLayout>
              <Documents />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/calendar" element={
          <ProtectedRoute>
            <StudentLayout>
              <Calendar />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/attendance" element={
          <ProtectedRoute>
            <StudentLayout>
              <AttendanceTracking />
            </StudentLayout>
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <StudentLayout>
              <ReportingAnalytics />
            </StudentLayout>
          </ProtectedRoute>
        } />
        
        {/* Admin Routes with Layout */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AdminDashboard />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/internships" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <ManageInternships />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/internships/create" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <CreateInternship />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/internships/:id" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <InternshipDetail />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/attendance" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <AttendanceTracking />
            </AdminLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/reports" element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout>
              <ReportingAnalytics />
            </AdminLayout>
          </ProtectedRoute>
        } />
      </Routes>
    </Router>
  );
}
