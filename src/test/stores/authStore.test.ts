import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signIn: vi.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null
      }),
      signUp: vi.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '1', email: 'test@example.com' } },
        error: null
      }),
      onAuthStateChange: vi.fn((callback) => {
        callback('SIGNED_IN', { user: { id: '1', email: 'test@example.com' } })
        return { data: { subscription: { unsubscribe: vi.fn() } } }
      })
    },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { role: 'student' },
        error: null
      })
    }))
  })
}))

describe('AuthStore', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(true)
  })

  it('should login successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com'
    })
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should logout successfully', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    // First login
    await act(async () => {
      await result.current.login('test@example.com', 'password123')
    })
    
    expect(result.current.isAuthenticated).toBe(true)
    
    // Then logout
    await act(async () => {
      await result.current.logout()
    })
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should check auth status', async () => {
    const { result } = renderHook(() => useAuthStore())
    
    await act(async () => {
      await result.current.checkAuth()
    })
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com'
    })
    expect(result.current.isAuthenticated).toBe(true)
  })
})