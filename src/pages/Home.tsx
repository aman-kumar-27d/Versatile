import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogin = () => {
    navigate('/login');
  };

  const handleAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleStudentDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-4xl mx-auto text-center px-4">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          Learning Management System
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Comprehensive platform for managing internship programs and student learning
        </p>
        
        <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
          {!user ? (
            <button
              onClick={handleLogin}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Get Started
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleStudentDashboard}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Student Dashboard
              </button>
              <button
                onClick={handleAdminDashboard}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Admin Dashboard
              </button>
            </div>
          )}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-blue-600 text-3xl font-bold mb-2">Admin</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">For Organizations</h3>
            <p className="text-gray-600">
              Create and manage internship programs, review applications, and track student progress
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-green-600 text-3xl font-bold mb-2">Students</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">For Students</h3>
            <p className="text-gray-600">
              Browse internship opportunities, submit applications, and track your learning progress
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <div className="text-purple-600 text-3xl font-bold mb-2">Features</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Comprehensive</h3>
            <p className="text-gray-600">
              Secure authentication, document management, attendance tracking, and detailed reporting
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}