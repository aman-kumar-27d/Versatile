import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
  roles?: ('admin' | 'student')[]
  requireAuth?: boolean
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles, 
  requireAuth = true 
}) => {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />
  }

  if (roles && user && !roles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute roles={['admin']}>
    {children}
  </ProtectedRoute>
)

export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute roles={['student']}>
    {children}
  </ProtectedRoute>
)