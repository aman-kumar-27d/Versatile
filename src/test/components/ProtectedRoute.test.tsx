import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ProtectedRoute from '../components/ProtectedRoute'
import { useAuthStore } from '../stores/authStore'

vi.mock('../stores/authStore')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false }
  }
})

const renderWithProviders = (component: React.ReactNode) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{component}</MemoryRouter>
    </QueryClientProvider>
  )
}

describe('ProtectedRoute Component', () => {
  it('renders children when user is authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: { id: '1', email: 'test@example.com', role: 'student' },
      isAuthenticated: true,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn()
    } as any)

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to login when user is not authenticated', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: false,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn()
    } as any)

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('shows loading state while checking authentication', () => {
    vi.mocked(useAuthStore).mockReturnValue({
      user: null,
      isAuthenticated: false,
      loading: true,
      login: vi.fn(),
      logout: vi.fn(),
      checkAuth: vi.fn()
    } as any)

    renderWithProviders(
      <ProtectedRoute>
        <div>Protected Content</div>
      </ProtectedRoute>
    )

    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })
})