import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import AttendanceTracking from '../pages/AttendanceTracking'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', role: 'student' },
    isAuthenticated: true,
    loading: false
  })
}))

vi.mock('../stores/attendanceStore', () => ({
  useAttendanceStore: () => ({
    records: [
      {
        id: '1',
        userId: '1',
        internshipId: '1',
        date: '2024-01-01',
        status: 'present',
        checkInTime: '09:00',
        checkOutTime: '17:00',
        notes: 'Regular day'
      },
      {
        id: '2',
        userId: '1',
        internshipId: '1',
        date: '2024-01-02',
        status: 'absent',
        checkInTime: null,
        checkOutTime: null,
        notes: 'Sick leave'
      }
    ],
    stats: {
      totalSessions: 10,
      presentCount: 8,
      absentCount: 2,
      lateCount: 0,
      attendanceRate: 80
    },
    loading: false,
    fetchAttendance: vi.fn(),
    markAttendance: vi.fn(),
    updateAttendance: vi.fn(),
    deleteAttendance: vi.fn()
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

describe('AttendanceTracking Component', () => {
  it('renders attendance statistics', () => {
    renderWithProviders(<AttendanceTracking />)
    
    expect(screen.getByText(/total sessions/i)).toBeInTheDocument()
    expect(screen.getByText(/attendance rate/i)).toBeInTheDocument()
    expect(screen.getByText('80%')).toBeInTheDocument()
  })

  it('displays attendance records', () => {
    renderWithProviders(<AttendanceTracking />)
    
    expect(screen.getByText(/present/i)).toBeInTheDocument()
    expect(screen.getByText(/absent/i)).toBeInTheDocument()
  })

  it('shows mark attendance button', () => {
    renderWithProviders(<AttendanceTracking />)
    
    expect(screen.getByRole('button', { name: /mark attendance/i })).toBeInTheDocument()
  })

  it('shows export button', () => {
    renderWithProviders(<AttendanceTracking />)
    
    expect(screen.getByRole('button', { name: /export csv/i })).toBeInTheDocument()
  })
})