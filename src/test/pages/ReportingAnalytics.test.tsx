import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import ReportingAnalytics from '../pages/ReportingAnalytics'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', role: 'admin' },
    isAuthenticated: true,
    loading: false
  })
}))

vi.mock('../stores/analyticsStore', () => ({
  useAnalyticsStore: () => ({
    metrics: {
      totalUsers: 150,
      totalInternships: 25,
      totalApplications: 300,
      averageAttendance: 85,
      completionRate: 92,
      satisfactionScore: 4.5
    },
    charts: {
      applications: [
        { name: 'Jan', value: 20 },
        { name: 'Feb', value: 35 },
        { name: 'Mar', value: 45 }
      ],
      attendance: [
        { name: 'Week 1', value: 80 },
        { name: 'Week 2', value: 85 },
        { name: 'Week 3', value: 90 }
      ],
      progress: [
        { name: 'Completed', value: 75 },
        { name: 'In Progress', value: 20 },
        { name: 'Not Started', value: 5 }
      ]
    },
    loading: false,
    fetchAnalytics: vi.fn(),
    exportReport: vi.fn()
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

describe('ReportingAnalytics Component', () => {
  it('renders analytics dashboard', () => {
    renderWithProviders(<ReportingAnalytics />)
    
    expect(screen.getByText(/analytics dashboard/i)).toBeInTheDocument()
  })

  it('displays key metrics', () => {
    renderWithProviders(<ReportingAnalytics />)
    
    expect(screen.getByText(/150/i)).toBeInTheDocument()
    expect(screen.getByText(/25/i)).toBeInTheDocument()
    expect(screen.getByText(/300/i)).toBeInTheDocument()
    expect(screen.getByText(/85%/i)).toBeInTheDocument()
  })

  it('shows charts', () => {
    renderWithProviders(<ReportingAnalytics />)
    
    expect(screen.getByText(/applications over time/i)).toBeInTheDocument()
    expect(screen.getByText(/attendance trends/i)).toBeInTheDocument()
    expect(screen.getByText(/progress distribution/i)).toBeInTheDocument()
  })

  it('shows export button', () => {
    renderWithProviders(<ReportingAnalytics />)
    
    expect(screen.getByRole('button', { name: /export report/i })).toBeInTheDocument()
  })

  it('shows date range selector', () => {
    renderWithProviders(<ReportingAnalytics />)
    
    expect(screen.getByLabelText(/from date/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/to date/i)).toBeInTheDocument()
  })
})