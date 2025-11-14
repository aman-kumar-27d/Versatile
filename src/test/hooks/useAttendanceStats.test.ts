import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useAttendanceStats } from '../hooks/useAttendanceStats'

vi.mock('../stores/attendanceStore', () => ({
  useAttendanceStore: () => ({
    records: [
      { id: '1', status: 'present', date: '2024-01-01' },
      { id: '2', status: 'absent', date: '2024-01-02' },
      { id: '3', status: 'present', date: '2024-01-03' },
      { id: '4', status: 'late', date: '2024-01-04' },
      { id: '5', status: 'present', date: '2024-01-05' }
    ]
  })
}))

describe('useAttendanceStats Hook', () => {
  it('should calculate attendance statistics correctly', () => {
    const { result } = renderHook(() => useAttendanceStats())
    
    expect(result.current.totalSessions).toBe(5)
    expect(result.current.presentCount).toBe(3)
    expect(result.current.absentCount).toBe(1)
    expect(result.current.lateCount).toBe(1)
    expect(result.current.attendanceRate).toBe(60)
  })

  it('should handle empty records', () => {
    vi.mock('../stores/attendanceStore', () => ({
      useAttendanceStore: () => ({
        records: []
      })
    }))
    
    const { result } = renderHook(() => useAttendanceStats())
    
    expect(result.current.totalSessions).toBe(0)
    expect(result.current.presentCount).toBe(0)
    expect(result.current.absentCount).toBe(0)
    expect(result.current.lateCount).toBe(0)
    expect(result.current.attendanceRate).toBe(0)
  })

  it('should calculate weekly trends', () => {
    const { result } = renderHook(() => useAttendanceStats())
    
    expect(result.current.weeklyTrend).toBeInstanceOf(Array)
    expect(result.current.weeklyTrend.length).toBeGreaterThan(0)
  })
})