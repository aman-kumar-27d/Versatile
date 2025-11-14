import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  role: 'admin' | 'student'
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isLoading: boolean
  error: string | null
  isAuthenticated: boolean
  loading: boolean
  
  // Actions
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (profileData: UpdateProfileData) => Promise<void>
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

export interface RegisterData {
  email: string
  password: string
  role: 'admin' | 'student'
  firstName: string
  lastName: string
  phone?: string
}

export interface UpdateProfileData {
  firstName?: string
  lastName?: string
  phone?: string
  avatarUrl?: string
}

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Create the auth store
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,
      isAuthenticated: false,
      loading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
          })

          // Check if response is ok before parsing JSON
          if (!response.ok) {
            // Try to parse error response
            let errorMessage = 'Login failed'
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
            } catch {
              // If JSON parsing fails, use status text
              errorMessage = response.statusText || errorMessage
            }
            throw new Error(errorMessage)
          }

          // Parse JSON response
          let data
          try {
            data = await response.json()
          } catch (jsonError) {
            throw new Error('Server returned invalid response. Please ensure the backend server is running.')
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          const errorMessage = error instanceof Error 
            ? error.message 
            : 'Login failed. Please check your connection.'
          set({
            isLoading: false,
            error: errorMessage,
          })
          throw error
        }
      },

      register: async (userData: RegisterData) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
          })

          // Check if response is ok before parsing JSON
          if (!response.ok) {
            let errorMessage = 'Registration failed'
            try {
              const errorData = await response.json()
              errorMessage = errorData.error || errorMessage
            } catch {
              errorMessage = response.statusText || errorMessage
            }
            throw new Error(errorMessage)
          }

          // Parse JSON response
          let data
          try {
            data = await response.json()
          } catch (jsonError) {
            throw new Error('Server returned invalid response. Please ensure the backend server is running.')
          }

          set({
            user: data.user,
            token: data.token,
            isLoading: false,
            error: null,
            isAuthenticated: true,
            loading: false,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Registration failed',
          })
          throw error
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          error: null,
          isAuthenticated: false,
          loading: false,
        })
      },

      updateProfile: async (profileData: UpdateProfileData) => {
        const { token } = get()
        if (!token) {
          throw new Error('No authentication token')
        }

        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/auth/profile`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(profileData),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Profile update failed')
          }

          set({
            user: data.user,
            isLoading: false,
            error: null,
          })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Profile update failed',
          })
          throw error
        }
      },

      changePassword: async (currentPassword: string, newPassword: string) => {
        const { token } = get()
        if (!token) {
          throw new Error('No authentication token')
        }

        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ currentPassword, newPassword }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Password change failed')
          }

          set({ isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password change failed',
          })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`${API_URL}/auth/reset-password`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email }),
          })

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.error || 'Password reset failed')
          }

          set({ isLoading: false, error: null })
        } catch (error) {
          set({
            isLoading: false,
            error: error instanceof Error ? error.message : 'Password reset failed',
          })
          throw error
        }
      },

      clearError: () => {
        set({ error: null })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
      }),
    }
  )
)

// Helper hook to check if user is authenticated
export const useIsAuthenticated = (): boolean => {
  const { user, token } = useAuth()
  return !!(user && token)
}

// Helper hook to check user role
export const useUserRole = (): 'admin' | 'student' | null => {
  const { user } = useAuth()
  return user?.role || null
}

// Helper hook to check if user is admin
export const useIsAdmin = (): boolean => {
  const { user } = useAuth()
  return user?.role === 'admin'
}

// Helper hook to check if user is student
export const useIsStudent = (): boolean => {
  const { user } = useAuth()
  return user?.role === 'student'
}

// Hook to get current user
export const useCurrentUser = (): User | null => {
  const { user } = useAuth()
  return user
}