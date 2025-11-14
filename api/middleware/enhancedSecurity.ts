import { securityHeaders, corsOptions, authRateLimiter, apiRateLimiter, uploadRateLimiter } from './security.js'
import { sanitizeInput, preventNoSQLInjection } from './security.js'
import { productionSecurityConfig } from './securityConfig.js'
import { body, validationResult } from 'express-validator'
import cors from 'cors'

// Enhanced security middleware for production
export const enhancedSecurityMiddleware = [
  // Security headers with enhanced CSP
  securityHeaders,
  
  // CORS with stricter controls
  cors(corsOptions),
  
  // Rate limiting with different tiers
  apiRateLimiter,
  
  // Input sanitization
  sanitizeInput,
  preventNoSQLInjection,
  
  // Additional security headers for production
  (req: any, res: any, next: any) => {
    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('X-Frame-Options', 'DENY')
    res.setHeader('X-XSS-Protection', '1; mode=block')
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')
    
    // Remove server identification headers
    res.removeHeader('X-Powered-By')
    res.removeHeader('Server')
    
    next()
  }
]

// Input validation middleware to prevent injection attacks
export const validateInput = (req: any, res: any, next: any) => {
  // Prevent common injection patterns
  const suspiciousPatterns = [
    /<script[^>]*>.*?<\/script>/gi, // XSS attempts
    /javascript:/gi, // JavaScript protocol
    /on\w+\s*=/gi, // Event handlers
    /union.*select/gi, // SQL injection
    /drop.*table/gi, // SQL injection
    /exec\s*\(/gi, // Command injection
    /['";].*--/gi, // SQL comment injection
  ]
  
  const checkForSuspiciousContent = (obj: any): boolean => {
    if (typeof obj === 'string') {
      return suspiciousPatterns.some(pattern => pattern.test(obj))
    } else if (typeof obj === 'object' && obj !== null) {
      return Object.values(obj).some(checkForSuspiciousContent)
    }
    return false
  }
  
  if (checkForSuspiciousContent(req.body) || 
      checkForSuspiciousContent(req.query) || 
      checkForSuspiciousContent(req.params)) {
    return res.status(400).json({ 
      error: 'Suspicious content detected',
      message: 'Your request contains potentially harmful content'
    })
  }
  
  next()
}

// Request size limiter
export const requestSizeLimiter = (maxSize: number = 10 * 1024 * 1024) => {
  return (req: any, res: any, next: any) => {
    let size = 0
    
    req.on('data', (chunk: any) => {
      size += chunk.length
      if (size > maxSize) {
        req.destroy()
        res.status(413).json({ error: 'Request entity too large' })
      }
    })
    
    next()
  }
}

// Timeout middleware
export const requestTimeout = (timeout: number = 30000) => {
  return (req: any, res: any, next: any) => {
    req.setTimeout(timeout, () => {
      res.status(408).json({ error: 'Request timeout' })
    })
    
    res.setTimeout(timeout, () => {
      res.status(408).json({ error: 'Response timeout' })
    })
    
    next()
  }
}

// Security event logger
export const securityLogger = (req: any, res: any, next: any) => {
  const suspiciousHeaders = [
    'x-forwarded-for',
    'x-real-ip',
    'x-client-ip',
    'x-forwarded',
    'forwarded-for',
    'forwarded'
  ]
  
  const hasSuspiciousHeaders = suspiciousHeaders.some(header => 
    req.headers[header] && req.headers[header].length > 50
  )
  
  if (hasSuspiciousHeaders) {
    console.warn(`[SECURITY] Suspicious headers detected from ${req.ip}:`, {
      url: req.url,
      headers: req.headers,
      timestamp: new Date().toISOString()
    })
  }
  
  next()
}

// Production security middleware stack
export const productionSecurityStack = [
  // Request timeout
  requestTimeout(),
  
  // Request size limit
  requestSizeLimiter(),
  
  // Security logging
  securityLogger,
  
  // Enhanced security middleware
  ...enhancedSecurityMiddleware,
  
  // Input validation
  validateInput,
  
  // Additional rate limiting for production
  productionSecurityConfig.production.strictRateLimit
]

// Specific route protections
export const protectAuthRoutes = [
  authRateLimiter,
  validateInput,
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 })
]

export const protectUploadRoutes = [
  uploadRateLimiter,
  validateInput,
  requestSizeLimiter(5 * 1024 * 1024) // 5MB limit for uploads
]

export const protectApiRoutes = [
  apiRateLimiter,
  validateInput
]