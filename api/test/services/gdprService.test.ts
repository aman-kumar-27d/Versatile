import { describe, it, expect, vi } from 'vitest'
import { GDPRService } from '../services/gdprService'

vi.mock('../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: '1', email: 'test@example.com', role: 'student' },
        error: null
      }),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockResolvedValue({ error: null })
    }))
  }
}))

describe('GDPRService', () => {
  describe('exportUserData', () => {
    it('should export user data successfully', async () => {
      const userId = 'test-user-id'
      const result = await GDPRService.exportUserData(userId)

      expect(result).toHaveProperty('profile')
      expect(result).toHaveProperty('applications')
      expect(result).toHaveProperty('attendance')
      expect(result).toHaveProperty('documents')
      expect(result).toHaveProperty('generatedDocuments')
      expect(result).toHaveProperty('notifications')
    })
  })

  describe('anonymizeUserData', () => {
    it('should anonymize user data successfully', async () => {
      const userId = 'test-user-id'
      
      await expect(GDPRService.anonymizeUserData(userId)).resolves.not.toThrow()
    })
  })

  describe('deleteUserData', () => {
    it('should soft delete user data successfully', async () => {
      const userId = 'test-user-id'
      
      await expect(GDPRService.deleteUserData(userId, false)).resolves.not.toThrow()
    })

    it('should hard delete user data successfully', async () => {
      const userId = 'test-user-id'
      
      await expect(GDPRService.deleteUserData(userId, true)).resolves.not.toThrow()
    })
  })

  describe('getDataRetentionInfo', () => {
    it('should get data retention information', async () => {
      const userId = 'test-user-id'
      const result = await GDPRService.getDataRetentionInfo(userId)

      expect(result).toHaveProperty('user')
      expect(result).toHaveProperty('dataCounts')
      expect(result).toHaveProperty('retentionPeriod')
      expect(result).toHaveProperty('lastActivity')
      expect(result.dataCounts).toHaveProperty('applications')
      expect(result.dataCounts).toHaveProperty('attendance')
      expect(result.dataCounts).toHaveProperty('documents')
      expect(result.dataCounts).toHaveProperty('notifications')
    })
  })
})