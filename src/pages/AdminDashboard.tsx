import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Internship } from '../../supabase/config';
import { Plus, Users, BookOpen, Calendar, FileText, Settings, LogOut, BarChart3 } from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalInternships: 0,
    activeApplications: 0,
    totalStudents: 0,
    upcomingMeetings: 0
  });

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Mock data for testing
      const mockInternships: Internship[] = [
        {
          id: '1',
          title: 'Software Development Intern',
          description: 'Join our development team to work on cutting-edge web applications.',
          type: 'full-time',
          duration: '3 months',
          location: 'Remote',
          stipend: 15000,
          application_deadline: '2024-12-31',
          start_date: '2025-01-15',
          requirements: 'Bachelor\'s degree in Computer Science, knowledge of JavaScript and React',
          responsibilities: 'Develop web applications, write clean code, collaborate with team',
          skills_required: 'JavaScript, React, Node.js, Git',
          max_applicants: 50,
          is_active: true,
          created_by: 'admin-user-id',
          created_at: '2024-01-01T00:00:00Z',
          updated_at: '2024-01-01T00:00:00Z'
        },
        {
          id: '2',
          title: 'Data Science Intern',
          description: 'Work with our data team to analyze large datasets and build ML models.',
          type: 'part-time',
          duration: '6 months',
          location: 'Mumbai',
          stipend: 20000,
          application_deadline: '2024-12-15',
          start_date: '2025-01-01',
          requirements: 'Bachelor\'s degree in Statistics, Python programming',
          responsibilities: 'Data analysis, model building, report generation',
          skills_required: 'Python, R, SQL, Machine Learning',
          max_applicants: 30,
          is_active: true,
          created_by: 'admin-user-id',
          created_at: '2024-01-02T00:00:00Z',
          updated_at: '2024-01-02T00:00:00Z'
        }
      ];

      setInternships(mockInternships);
      setStats({
        totalInternships: mockInternships.length,
        activeApplications: 5,
        totalStudents: 25,
        upcomingMeetings: 3
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleCreateInternship = () => {
    navigate('/admin/internships/create');
  };

  const handleViewInternship = (id: string) => {
    navigate(`/admin/internships/${id}`);
  };

  const handleViewApplications = () => {
    navigate('/admin/applications');
  };

  const handleViewStudents = () => {
    navigate('/admin/students');
  };

  const handleViewCourses = () => {
    navigate('/admin/courses');
  };

  const handleViewCalendar = () => {
    navigate('/admin/calendar');
  };

  const handleViewReports = () => {
    navigate('/admin/reports');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">LMS Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center px-3 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Internships</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInternships}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeApplications}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalStudents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Meetings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.upcomingMeetings}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={handleCreateInternship}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Plus className="h-8 w-8 text-blue-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Create Internship</span>
            </button>

            <button
              onClick={handleViewApplications}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-green-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">View Applications</span>
            </button>

            <button
              onClick={handleViewStudents}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-8 w-8 text-purple-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Students</span>
            </button>

            <button
              onClick={handleViewCourses}
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <BookOpen className="h-8 w-8 text-orange-600 mb-2" />
              <span className="text-sm font-medium text-gray-900">Manage Courses</span>
            </button>
          </div>
        </div>

        {/* Recent Internships */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Internships</h2>
              <button
                onClick={() => navigate('/admin/internships')}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View All
              </button>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {internships.slice(0, 5).map((internship) => (
              <div key={internship.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">{internship.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{internship.description}</p>
                    <div className="flex items-center mt-2 text-xs text-gray-500">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {internship.type}
                      </span>
                      <span className="ml-2">Duration: {internship.duration}</span>
                      <span className="ml-2">Stipend: ₹{internship.stipend}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleViewInternship(internship.id)}
                    className="ml-4 text-sm text-blue-600 hover:text-blue-800"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
            
            {internships.length === 0 && (
              <div className="px-6 py-8 text-center text-gray-500">
                <BookOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No internships found. Create your first internship to get started.</p>
                <button
                  onClick={handleCreateInternship}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Internship
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;