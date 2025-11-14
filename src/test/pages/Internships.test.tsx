import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Internships from '../pages/Internships'

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
      {
        id: '1',
        title: 'Software Engineering Intern',
        description: 'Join our engineering team',
        department: 'Engineering',
        location: 'Remote',
        duration: '3 months',
        requirements: ['JavaScript', 'React'],
        isActive: true,
        startDate: '2024-02-01',
        endDate: '2024-05-01'
      }
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

describe('Internships Component', () => {
  it('renders internships list', () => {
    renderWithProviders(<Internships />)
    
    expect(screen.getByText(/software engineering intern/i)).toBeInTheDocument()
    expect(screen.getByText(/join our engineering team/i)).toBeInTheDocument()
  })

  it('displays internship details', () => {
    renderWithProviders(<Internships />)
    
    expect(screen.getByText(/engineering/i)).toBeInTheDocument()
    expect(screen.getByText(/remote/i)).toBeInTheDocument()
    expect(screen.getByText(/3 months/i)).toBeInTheDocument()
  })

  it('shows apply button for active internships', () => {
    renderWithProviders(<Internships />)
    
    expect(screen.getByRole('button', { name: /apply now/i })).toBeInTheDocument()
  })
})