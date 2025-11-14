import { Router } from 'express'
import { gdprRoutes } from '../services/gdprService'

const router = Router()

// GDPR compliance routes
router.get('/export', ...gdprRoutes.exportData)
router.post('/anonymize', ...gdprRoutes.anonymizeData)
router.delete('/delete', ...gdprRoutes.deleteData)
router.get('/retention-info', ...gdprRoutes.getRetentionInfo)

export default router