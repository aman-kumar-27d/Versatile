import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useInternshipFilters } from '../hooks/useInternshipFilters'

const mockInternships = [
  {
    id: '1',
    title: 'Software Engineering Intern',
    department: 'Engineering',
    location: 'Remote',
    duration: '3 months',
    isActive: true,
    startDate: '2024-02-01',
    endDate: '2024-05-01'
  },
  {
    id: '2',
    title: 'Marketing Intern',
    department: 'Marketing',
    location: 'New York',
    duration: '6 months',
    isActive: false,
    startDate: '2024-01-01',
    endDate: '2024-07-01'
  },
  {
    id: '3',
    title: 'Design Intern',
    department: 'Design',
    location: 'Remote',
    duration: '3 months',
    isActive: true,
    startDate: '2024-03-01',
    endDate: '2024-06-01'
  }
]

describe('useInternshipFilters Hook', () => {
  it('should filter by search term', () => {
    const { result } = renderHook(() => useInternshipFilters(mockInternships))
    
    act(() => {
      result.current.setSearchTerm('Software')
    })
    
    expect(result.current.filteredInternships).toHaveLength(1)
    expect(result.current.filteredInternships[0].title).toBe('Software Engineering Intern')
  })

  it('should filter by department', () => {
    const { result } = renderHook(() => useInternshipFilters(mockInternships))
    
    act(() => {
      result.current.setDepartment('Marketing')
    })
    
    expect(result.current.filteredInternships).toHaveLength(1)
    expect(result.current.filteredInternships[0].department).toBe('Marketing')
  })

  it('should filter by location', () => {
    const { result } = renderHook(() => useInternshipFilters(mockInternships))
    
    act(() => {
      result.current.setLocation('Remote')
    })
    
    expect(result.current.filteredInternships).toHaveLength(2)
    expect(result.current.filteredInternships.every(i => i.location === 'Remote')).toBe(true)
  })

  it('should filter by status', () => {
    const { result } = renderHook(() => useInternshipFilters(mockInternships))
    
    act(() => {
      result.current.setStatus('active')
    })
    
    expect(result.current.filteredInternships).toHaveLength(2)
    expect(result.current.filteredInternships.every(i => i.isActive)).toBe(true)
  })

  it('should clear all filters', () => {
    const { result } = renderHook(() => useInternshipFilters(mockInternships))
    
    act(() => {
      result.current.setSearchTerm('Software')
      result.current.setDepartment('Engineering')
      result.current.clearFilters()
    })
    
    expect(result.current.filteredInternships).toHaveLength(3)
    expect(result.current.searchTerm).toBe('')
    expect(result.current.department).toBe('all')
  })
})