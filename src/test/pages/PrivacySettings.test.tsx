import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import PrivacySettings from '../pages/PrivacySettings'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com' },
    logout: vi.fn()
  })
}))

vi.mock('../config/supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: '1' } } })
    }
  }
}))

// Mock fetch
global.fetch = vi.fn()

describe('PrivacySettings Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('token', 'test-token')
  })

  it('renders privacy settings page', () => {
    render(<PrivacySettings />)
    
    expect(screen.getByText(/privacy settings/i)).toBeInTheDocument()
    expect(screen.getByText(/export your data/i)).toBeInTheDocument()
    expect(screen.getByText(/anonymize your data/i)).toBeInTheDocument()
    expect(screen.getByText(/delete your account/i)).toBeInTheDocument()
  })

  it('handles data export successfully', async () => {
    const mockResponse = {
      success: true,
      data: { profile: { email: 'test@example.com' } }
    }
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse
    } as Response)

    render(<PrivacySettings />)
    
    const exportButton = screen.getByRole('button', { name: /export data/i })
    await userEvent.click(exportButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/gdpr/export', {
        method: 'GET',
        headers: {
          'Authorization': 'Bearer test-token'
        }
      })
      expect(screen.getByText(/your data has been exported successfully/i)).toBeInTheDocument()
    })
  })

  it('handles data export error', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: false
    } as Response)

    render(<PrivacySettings />)
    
    const exportButton = screen.getByRole('button', { name: /export data/i })
    await userEvent.click(exportButton)

    await waitFor(() => {
      expect(screen.getByText(/failed to export data/i)).toBeInTheDocument()
    })
  })

  it('handles data anonymization with confirmation', async () => {
    window.confirm = vi.fn().mockReturnValue(true)
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as Response)

    render(<PrivacySettings />)
    
    const anonymizeButton = screen.getByRole('button', { name: /anonymize data/i })
    await userEvent.click(anonymizeButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Are you sure you want to anonymize your data? This action cannot be undone. You will lose access to your account.'
    )

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/gdpr/anonymize', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      })
      expect(screen.getByText(/your data has been anonymized successfully/i)).toBeInTheDocument()
    })
  })

  it('handles account deletion with confirmation', async () => {
    window.confirm = vi.fn().mockReturnValue(true)
    
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true })
    } as Response)

    render(<PrivacySettings />)
    
    const softDeleteButton = screen.getByRole('button', { name: /soft delete account/i })
    await userEvent.click(softDeleteButton)

    expect(window.confirm).toHaveBeenCalled()

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/gdpr/delete', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ hardDelete: false })
      })
      expect(screen.getByText(/your data has been deleted successfully/i)).toBeInTheDocument()
    })
  })

  it('cancels action when user declines confirmation', async () => {
    window.confirm = vi.fn().mockReturnValue(false)

    render(<PrivacySettings />)
    
    const anonymizeButton = screen.getByRole('button', { name: /anonymize data/i })
    await userEvent.click(anonymizeButton)

    expect(window.confirm).toHaveBeenCalled()
    expect(fetch).not.toHaveBeenCalled()
  })
})