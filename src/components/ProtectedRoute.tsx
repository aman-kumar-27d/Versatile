import { Navigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'admin' | 'student' | ('admin' | 'student')[]
  fallback?: string
}

export default function ProtectedRoute({ 
  children, 
  requiredRole, 
  fallback = '/login' 
}: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuthStore()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={fallback} replace />
  }

  if (requiredRole) {
    const requiredRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!requiredRoles.includes(user.role as 'admin' | 'student')) {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}