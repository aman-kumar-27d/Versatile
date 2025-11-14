import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useLocalStorage } from '../hooks/useLocalStorage'

describe('useLocalStorage Hook', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('should initialize with default value', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
  })

  it('should read existing value from localStorage', () => {
    localStorage.setItem('test-key', JSON.stringify('existing-value'))
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('existing-value')
  })

  it('should update localStorage when value changes', () => {
    const { result } = renderHook(() => useLocalStorage('test-key', 'initial-value'))
    
    act(() => {
      result.current[1]('updated-value')
    })
    
    expect(result.current[0]).toBe('updated-value')
    expect(JSON.parse(localStorage.getItem('test-key') || '')).toBe('updated-value')
  })

  it('should handle invalid JSON in localStorage', () => {
    localStorage.setItem('test-key', 'invalid-json')
    
    const { result } = renderHook(() => useLocalStorage('test-key', 'default-value'))
    
    expect(result.current[0]).toBe('default-value')
  })
})