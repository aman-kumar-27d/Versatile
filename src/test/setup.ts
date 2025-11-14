import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      signIn: vi.fn(),
      signUp: vi.fn(),
      signOut: vi.fn(),
      getUser: vi.fn(),
      onAuthStateChange: vi.fn()
    },
    from: vi.fn(() => ({
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      eq: vi.fn(),
      neq: vi.fn(),
      gt: vi.fn(),
      lt: vi.fn(),
      gte: vi.fn(),
      lte: vi.fn(),
      like: vi.fn(),
      ilike: vi.fn(),
      in: vi.fn(),
      is: vi.fn(),
      order: vi.fn(),
      limit: vi.fn(),
      range: vi.fn(),
      single: vi.fn()
    })),
    storage: {
      from: vi.fn(() => ({
        upload: vi.fn(),
        download: vi.fn(),
        remove: vi.fn(),
        list: vi.fn()
      }))
    }
  })
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn()
  }))
})

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn()
}))