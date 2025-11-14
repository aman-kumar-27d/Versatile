import { useAuthStore } from '../stores/authStore'
import { Navigate } from 'react-router-dom'

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role !== 'admin') {
    return <Navigate to="/unauthorized" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Admin Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="p-6">
            <h2 className="text-xl font-bold text-gray-800">Admin Panel</h2>
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
              Internships
            </a>
            <a
              href="/applications"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Applications
            </a>
            <a
              href="/users"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Users
            </a>
            <a
              href="/attendance"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Attendance
            </a>
            <a
              href="/analytics"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Analytics
            </a>
            <a
              href="/documents"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Documents
            </a>
            <a
              href="/settings"
              className="block px-6 py-3 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Settings
            </a>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <header className="bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4">
              <h1 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h1>
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