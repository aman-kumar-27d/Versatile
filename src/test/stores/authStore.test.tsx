import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAuthStore } from '../stores/authStore'

vi.mock('../stores/authStore', () => ({
  useAuthStore: () => ({
    user: { id: '1', email: 'test@example.com', role: 'admin' },
    isAuthenticated: true,
    loading: false
  })
}))

describe('useAuth Hook', () => {
  it('should return auth state', () => {
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toEqual({
      id: '1',
      email: 'test@example.com',
      role: 'admin'
    })
    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.loading).toBe(false)
  })

  it('should handle non-authenticated state', () => {
    vi.mock('../stores/authStore', () => ({
      useAuthStore: () => ({
        user: null,
        isAuthenticated: false,
        loading: false
      })
    }))
    
    const { result } = renderHook(() => useAuthStore())
    
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.loading).toBe(false)
  })
})