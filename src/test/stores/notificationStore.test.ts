import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useNotificationStore } from '../stores/notificationStore'

describe('NotificationStore', () => {
  it('should initialize with empty notifications', () => {
    const { result } = renderHook(() => useNotificationStore())
    
    expect(result.current.notifications).toEqual([])
  })

  it('should add a notification', () => {
    const { result } = renderHook(() => useNotificationStore())
    
    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info',
        timestamp: new Date()
      })
    })
    
    expect(result.current.notifications).toHaveLength(1)
    expect(result.current.notifications[0].title).toBe('Test Notification')
  })

  it('should remove a notification', () => {
    const { result } = renderHook(() => useNotificationStore())
    
    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test Notification',
        message: 'Test message',
        type: 'info',
        timestamp: new Date()
      })
    })
    
    expect(result.current.notifications).toHaveLength(1)
    
    act(() => {
      result.current.removeNotification('1')
    })
    
    expect(result.current.notifications).toHaveLength(0)
  })

  it('should clear all notifications', () => {
    const { result } = renderHook(() => useNotificationStore())
    
    act(() => {
      result.current.addNotification({
        id: '1',
        title: 'Test Notification 1',
        message: 'Test message 1',
        type: 'info',
        timestamp: new Date()
      })
      result.current.addNotification({
        id: '2',
        title: 'Test Notification 2',
        message: 'Test message 2',
        type: 'warning',
        timestamp: new Date()
      })
    })
    
    expect(result.current.notifications).toHaveLength(2)
    
    act(() => {
      result.current.clearNotifications()
    })
    
    expect(result.current.notifications).toHaveLength(0)
  })
})