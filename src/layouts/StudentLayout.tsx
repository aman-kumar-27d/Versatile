import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'

interface StudentLayoutProps {
  children: React.ReactNode
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'student') {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Student Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Student Portal</h2>
          </div>
          <nav className="mt-6">
            <a
              href="/dashboard"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="/internships"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Browse Internships
            </a>
            <a
              href="/my-applications"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              My Applications
            </a>
            <a
              href="/attendance"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Attendance
            </a>
            <a
              href="/documents"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              My Documents
            </a>
            <a
              href="/progress"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Progress
            </a>
            <a
              href="/profile"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Profile
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-800">Student Dashboard</h1>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{user.email}</span>
                <button
                  onClick={() => useAuthStore.getState().logout()}
                  className="px-4 py-2 text-sm text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </header>
          <main className="p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}