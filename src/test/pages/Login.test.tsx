import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Login from '../pages/Login'

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

describe('Login Component', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />)
    
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows validation errors for empty fields', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument()
      expect(screen.getByText(/password is required/i)).toBeInTheDocument()
    })
  })

  it('shows validation error for invalid email', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'invalid-email')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please enter a valid email/i)).toBeInTheDocument()
    })
  })

  it('submits form with valid data', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Login />)
    
    const emailInput = screen.getByLabelText(/email/i)
    const passwordInput = screen.getByLabelText(/password/i)
    
    await user.type(emailInput, 'test@example.com')
    await user.type(passwordInput, 'password123')
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    // Form should be submitted without validation errors
    await waitFor(() => {
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument()
      expect(screen.queryByText(/password is required/i)).not.toBeInTheDocument()
    })
  })
})