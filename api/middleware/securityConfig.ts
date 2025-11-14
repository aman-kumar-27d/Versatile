import { securityHeaders, corsOptions, createRateLimiter, authRateLimiter, apiRateLimiter, uploadRateLimiter } from './security.js'
import { sanitizeInput, preventNoSQLInjection } from './security.js'
import cors from 'cors'

// Production security configuration
export const productionSecurityConfig = {
  // Rate limiting
  rateLimiters: {
    auth: authRateLimiter,
    api: apiRateLimiter,
    upload: uploadRateLimiter
  },

  // Security headers
  headers: securityHeaders,

  // CORS configuration
  cors: cors(),

  // Input sanitization
  sanitization: [sanitizeInput, preventNoSQLInjection],

  // Production-specific settings
  production: {
    // Stricter rate limiting in production
    strictRateLimit: createRateLimiter(5 * 60 * 1000, 50), // 50 requests per 5 minutes
    
    // IP-based rate limiting
    ipRateLimit: createRateLimiter(60 * 60 * 1000, 200), // 200 requests per hour per IP
    
    // Upload restrictions
    uploadLimits: {
      maxFileSize: 5 * 1024 * 1024, // 5MB in production
      maxFilesPerHour: 5,
      allowedTypes: [
        'application/pdf',
        'image/jpeg',
        'image/png'
      ]
    }
  }
}

// Security monitoring
export const securityMonitoring = {
  // Log security events
  logSecurityEvent: (event: string, details: any) => {
    console.log(`[SECURITY] ${new Date().toISOString()} - ${event}:`, JSON.stringify(details))
  },

  // Monitor suspicious activity
  suspiciousPatterns: {
    // Multiple failed login attempts
    failedLoginThreshold: 5,
    
    // Suspicious file access patterns
    fileAccessPatterns: [
      /\.\./, // Directory traversal attempts
      /etc\/passwd/, // Unix password file
      /windows\/system32/ // Windows system files
    ],
    
    // SQL injection patterns
    sqlInjectionPatterns: [
      /union.*select/i,
      /drop.*table/i,
      /insert.*into/i,
      /delete.*from/i
    ]
  }
}

// Content Security Policy for production
export const productionCSP = {
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", "data:", "https:"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}

// Security headers for production
export const productionSecurityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload'
}