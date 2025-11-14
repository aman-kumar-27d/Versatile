/**
 * This is a API server
 */

import express, {
  type Request,
  type Response,
  type NextFunction,
} from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import internshipRoutes from './routes/internships.js'
import documentRoutes from './routes/documents.js'
import documentGenerationRoutes from './routes/documentGeneration.js'
import attendanceRoutes from './routes/attendance.js'
import gdprRoutes from './routes/gdpr.js'
import {
  securityHeaders,
  sanitizeInput,
  preventNoSQLInjection,
  corsOptions,
  authRateLimiter,
  apiRateLimiter,
  uploadRateLimiter
} from './middleware/security.js'
import {
  requestLogger,
  auditLogger,
  errorLogger,
  performanceMonitor
} from './middleware/auditLogger.js'

// for esm mode
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// load env
dotenv.config()

const app: express.Application = express()

// Security middleware
app.use(securityHeaders)
app.use(cors(corsOptions))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(sanitizeInput)
app.use(preventNoSQLInjection)

// Logging middleware
app.use(requestLogger)
app.use(auditLogger)
app.use(performanceMonitor)

/**
 * API Routes
 */
app.use('/api/auth', authRateLimiter, authRoutes)
app.use('/api/internships', apiRateLimiter, internshipRoutes)
app.use('/api/documents', apiRateLimiter, uploadRateLimiter, documentRoutes)
app.use('/api/document-generation', apiRateLimiter, documentGenerationRoutes)
app.use('/api/attendance', apiRateLimiter, attendanceRoutes)
app.use('/api/gdpr', apiRateLimiter, gdprRoutes)

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use(errorLogger)

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
