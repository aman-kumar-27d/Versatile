import { Request, Response, NextFunction } from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import mongoSanitize from 'express-mongo-sanitize'
import xss from 'xss'

// Rate limiting configuration
export const createRateLimiter = (windowMs: number = 15 * 60 * 1000, max: number = 100) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      error: 'Too many requests from this IP, please try again later.',
      retryAfter: Math.ceil(windowMs / 1000)
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res: Response) => {
      res.status(429).json({
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: Math.ceil(windowMs / 1000)
      })
    }
  })
}

// Specific rate limiters for different endpoints
export const authRateLimiter = createRateLimiter(15 * 60 * 1000, 5) // 5 attempts per 15 minutes
export const apiRateLimiter = createRateLimiter(15 * 60 * 1000, 100) // 100 requests per 15 minutes
export const uploadRateLimiter = createRateLimiter(60 * 60 * 1000, 10) // 10 uploads per hour

// Security headers middleware
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.supabase.io"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: 'same-origin' }
})

// Input sanitization middleware
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  const sanitizeObject = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove potential XSS
      return xss(obj, {
        whiteList: {}, // No HTML tags allowed
        stripIgnoreTag: true,
        stripIgnoreTagBody: ['script']
      })
    } else if (typeof obj === 'object' && obj !== null) {
      const sanitized: any = Array.isArray(obj) ? [] : {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          sanitized[key] = sanitizeObject(obj[key])
        }
      }
      return sanitized
    }
    return obj
  }

  if (req.body) {
    req.body = sanitizeObject(req.body)
  }
  
  if (req.query) {
    req.query = sanitizeObject(req.query)
  }
  
  if (req.params) {
    req.params = sanitizeObject(req.params)
  }

  next()
}

// MongoDB injection prevention
export const preventNoSQLInjection = mongoSanitize()

// Request validation middleware
export const validateRequest = (schema: any) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map((detail: any) => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      })
    }
    
    next()
  }
}

// File upload validation
export const validateFileUpload = (req: Request, res: Response, next: NextFunction) => {
  if (!req.file && !req.files) {
    return res.status(400).json({ error: 'No file uploaded' })
  }

  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'image/jpeg',
    'image/png',
    'image/gif'
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const validateFile = (file: any) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      return res.status(400).json({
        error: 'Invalid file type. Allowed types: PDF, DOC, DOCX, TXT, JPG, PNG, GIF'
      })
    }

    if (file.size > maxFileSize) {
      return res.status(400).json({
        error: 'File too large. Maximum size: 10MB'
      })
    }
  }

  if (req.file) {
    validateFile(req.file)
  } else if (req.files) {
    const files = Array.isArray(req.files) ? req.files : Object.values(req.files)
    files.forEach(validateFile)
  }

  next()
}

// IP whitelist/blacklist middleware
export const ipFilter = (whitelist: string[] = [], blacklist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const clientIP = req.ip || req.connection.remoteAddress || ''

    if (blacklist.length > 0 && blacklist.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
      return res.status(403).json({ error: 'Access denied' })
    }

    next()
  }
}

// CORS configuration
export const corsOptions = {
  origin: (origin: string | undefined, callback: Function) => {
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://yourdomain.com'
    ]

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}