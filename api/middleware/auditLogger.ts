import { Request, Response, NextFunction } from 'express'
import winston from 'winston'

// Configure Winston logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'lms-api' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Audit log interface
interface AuditLog {
  userId?: string
  action: string
  resource: string
  method: string
  ip: string
  userAgent: string
  timestamp: Date
  statusCode: number
  responseTime: number
  error?: string
  metadata?: Record<string, any>
}

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    const logData = {
      method: req.method,
      url: req.originalUrl,
      statusCode: res.statusCode,
      contentLength: res.get('content-length'),
      responseTime: duration,
      userAgent: req.get('user-agent'),
      ip: req.ip || req.connection.remoteAddress,
      userId: (req as any).user?.id
    }

    if (res.statusCode >= 400) {
      logger.error('HTTP Request', logData)
    } else {
      logger.info('HTTP Request', logData)
    }
  })

  next()
}

// Audit logging middleware
export const auditLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    const auditLog: AuditLog = {
      userId: (req as any).user?.id,
      action: `${req.method} ${req.originalUrl}`,
      resource: req.originalUrl,
      method: req.method,
      ip: req.ip || req.connection.remoteAddress || '',
      userAgent: req.get('user-agent') || '',
      timestamp: new Date(),
      statusCode: res.statusCode,
      responseTime: duration,
      metadata: {
        body: sanitizeSensitiveData(req.body),
        query: req.query,
        params: req.params
      }
    }

    if (res.statusCode >= 400) {
      auditLog.error = `HTTP ${res.statusCode} error`
    }

    // Log to audit file
    logger.info('AUDIT', auditLog)
  })

  next()
}

// Sanitize sensitive data from logs
function sanitizeSensitiveData(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }

  const sensitiveFields = [
    'password', 'token', 'secret', 'apiKey', 'privateKey',
    'creditCard', 'ssn', 'dob', 'email', 'phone'
  ]

  const sanitized = { ...data }
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }

  return sanitized
}

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  const errorLog = {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip || req.connection.remoteAddress,
    userId: (req as any).user?.id,
    userAgent: req.get('user-agent'),
    timestamp: new Date()
  }

  logger.error('Application Error', errorLog)
  
  // Send error response
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  })
}

// Security event logging
export const logSecurityEvent = (event: string, details: Record<string, any>) => {
  logger.warn('SECURITY', {
    event,
    details: sanitizeSensitiveData(details),
    timestamp: new Date()
  })
}

// Performance monitoring middleware
export const performanceMonitor = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  res.on('finish', () => {
    const duration = Date.now() - start
    
    if (duration > 5000) { // Log slow requests
      logger.warn('Slow Request', {
        method: req.method,
        url: req.originalUrl,
        duration,
        statusCode: res.statusCode,
        ip: req.ip || req.connection.remoteAddress
      })
    }
  })

  next()
}

// Export logger for use in other modules
export { logger }