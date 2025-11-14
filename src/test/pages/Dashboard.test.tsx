import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Dashboard from '../pages/Dashboard'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', role: 'student' },
    isAuthenticated: true,
    loading: false
  })
}))

vi.mock('../stores/internshipStore', () => ({
  useInternshipStore: () => ({
    internships: [
      { id: '1', title: 'Software Engineering Intern', status: 'active' },
      { id: '2', title: 'Design Intern', status: 'active' }
    ],
    loading: false,
    fetchInternships: vi.fn()
  })
}))

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

describe('Dashboard Component', () => {
  it('renders dashboard for student', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByText(/software engineering intern/i)).toBeInTheDocument()
    expect(screen.getByText(/design intern/i)).toBeInTheDocument()
  })

  it('displays internship statistics', () => {
    renderWithProviders(<Dashboard />)
    
    expect(screen.getByText(/total internships/i)).toBeInTheDocument()
    expect(screen.getByText(/active internships/i)).toBeInTheDocument()
  })
})