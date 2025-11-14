import { Request, Response } from 'express'
import { supabase } from '../../supabase/server.ts'
import { authenticateToken } from '../middleware/auth'
import { logger } from '../middleware/auditLogger'

// GDPR Data Export Service
export class GDPRService {
  static async exportUserData(userId: string): Promise<Record<string, any>> {
    try {
      const userData: Record<string, any> = {}

      // User profile data
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (userError) throw userError
      userData.profile = user

      // Applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', userId)

      if (!applicationsError) {
        userData.applications = applications
      }

      // Attendance records
      const { data: attendance, error: attendanceError } = await supabase
        .from('attendance')
        .select('*')
        .eq('user_id', userId)

      if (!attendanceError) {
        userData.attendance = attendance
      }

      // Documents
      const { data: documents, error: documentsError } = await supabase
        .from('documents')
        .select('*')
        .eq('user_id', userId)

      if (!documentsError) {
        userData.documents = documents
      }

      // Generated documents
      const { data: generatedDocs, error: generatedDocsError } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('user_id', userId)

      if (!generatedDocsError) {
        userData.generatedDocuments = generatedDocs
      }

      // Notifications
      const { data: notifications, error: notificationsError } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)

      if (!notificationsError) {
        userData.notifications = notifications
      }

      return userData
    } catch (error) {
      logger.error('GDPR Export Error', { userId, error })
      throw error
    }
  }

  static async anonymizeUserData(userId: string): Promise<void> {
    try {
      // Create anonymized user data
      const anonymizedData = {
        email: `user_${userId.slice(0, 8)}@anonymized.local`,
        first_name: 'Anonymous',
        last_name: 'User',
        phone: null,
        date_of_birth: null,
        address: null,
        is_anonymized: true,
        anonymized_at: new Date().toISOString()
      }

      // Update user profile
      const { error: userError } = await supabase
        .from('users')
        .update(anonymizedData)
        .eq('id', userId)

      if (userError) throw userError

      // Anonymize applications
      await supabase
        .from('applications')
        .update({ 
          cover_letter: '[ANONYMIZED]',
          notes: '[ANONYMIZED]'
        })
        .eq('user_id', userId)

      // Anonymize attendance notes
      await supabase
        .from('attendance')
        .update({ notes: '[ANONYMIZED]' })
        .eq('user_id', userId)

      // Anonymize document titles and descriptions
      await supabase
        .from('documents')
        .update({ 
          title: '[ANONYMIZED]',
          description: '[ANONYMIZED]'
        })
        .eq('user_id', userId)

      logger.info('User data anonymized', { userId })
    } catch (error) {
      logger.error('GDPR Anonymization Error', { userId, error })
      throw error
    }
  }

  static async deleteUserData(userId: string, hardDelete: boolean = false): Promise<void> {
    try {
      if (hardDelete) {
        // Hard delete - remove all user data
        await this.hardDeleteUserData(userId)
      } else {
        // Soft delete - mark as deleted but retain for legal/operational purposes
        await this.softDeleteUserData(userId)
      }

      logger.info('User data deleted', { userId, hardDelete })
    } catch (error) {
      logger.error('GDPR Deletion Error', { userId, hardDelete, error })
      throw error
    }
  }

  private static async hardDeleteUserData(userId: string): Promise<void> {
    // Delete in order of dependencies
    const tablesToDelete = [
      'notifications',
      'generated_documents',
      'attendance',
      'applications',
      'documents',
      'user_sessions',
      'users'
    ]

    for (const table of tablesToDelete) {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('user_id', userId)

      if (error) {
        logger.error(`Error deleting from ${table}`, { userId, error })
        throw error
      }
    }
  }

  private static async softDeleteUserData(userId: string): Promise<void> {
    // Mark user as deleted but retain data
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        is_deleted: true,
        deleted_at: new Date().toISOString(),
        email: `deleted_${userId.slice(0, 8)}@deleted.local`
      })
      .eq('id', userId)

    if (userError) throw userError

    // Deactivate all sessions
    await supabase
      .from('user_sessions')
      .update({ is_active: false })
      .eq('user_id', userId)
  }

  static async getDataRetentionInfo(userId: string): Promise<Record<string, any>> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('created_at, last_login, is_anonymized, anonymized_at, is_deleted, deleted_at')
        .eq('id', userId)
        .single()

      if (userError) throw userError

      // Count data across different tables
      const counts = await Promise.all([
        supabase.from('applications').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('attendance').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('documents').select('id', { count: 'exact' }).eq('user_id', userId),
        supabase.from('notifications').select('id', { count: 'exact' }).eq('user_id', userId)
      ])

      return {
        user: user,
        dataCounts: {
          applications: counts[0].count || 0,
          attendance: counts[1].count || 0,
          documents: counts[2].count || 0,
          notifications: counts[3].count || 0
        },
        retentionPeriod: '7 years', // Configurable based on legal requirements
        lastActivity: user.last_login || user.created_at
      }
    } catch (error) {
      logger.error('GDPR Retention Info Error', { userId, error })
      throw error
    }
  }
}

// GDPR Routes
export const gdprRoutes = {
  // Export user data
  exportData: [
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user.id
        const userData = await GDPRService.exportUserData(userId)
        
        res.json({
          success: true,
          data: userData,
          exportedAt: new Date().toISOString()
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to export user data'
        })
      }
    }
  ],

  // Anonymize user data
  anonymizeData: [
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user.id
        await GDPRService.anonymizeUserData(userId)
        
        res.json({
          success: true,
          message: 'User data anonymized successfully'
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to anonymize user data'
        })
      }
    }
  ],

  // Delete user data
  deleteData: [
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user.id
        const { hardDelete = false } = req.body
        
        await GDPRService.deleteUserData(userId, hardDelete)
        
        res.json({
          success: true,
          message: 'User data deleted successfully'
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to delete user data'
        })
      }
    }
  ],

  // Get data retention information
  getRetentionInfo: [
    authenticateToken,
    async (req: Request, res: Response) => {
      try {
        const userId = (req as any).user.id
        const retentionInfo = await GDPRService.getDataRetentionInfo(userId)
        
        res.json({
          success: true,
          data: retentionInfo
        })
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to get retention information'
        })
      }
    }
  ]
}