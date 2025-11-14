import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { supabase } from '../config/supabase'
import { logSecurityEvent } from './auditLogger'

// JWT token validation middleware
export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    logSecurityEvent('MISSING_TOKEN', {
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      method: req.method
    })
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as any
    
    // Verify user still exists and is active
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, is_active')
      .eq('id', decoded.userId)
      .single()

    if (error || !user || !user.is_active) {
      logSecurityEvent('INVALID_TOKEN_USER', {
        userId: decoded.userId,
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl
      })
      return res.status(401).json({ error: 'Invalid or expired token' })
    }

    // Add user to request object
    ;(req as any).user = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    next()
  } catch (error) {
    logSecurityEvent('INVALID_TOKEN', {
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

// Role-based authorization middleware
export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user

    if (!user) {
      logSecurityEvent('UNAUTHORIZED_ACCESS', {
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl,
        requiredRoles: roles,
        reason: 'No user found'
      })
      return res.status(401).json({ error: 'Authentication required' })
    }

    if (!roles.includes(user.role)) {
      logSecurityEvent('FORBIDDEN_ACCESS', {
        userId: user.id,
        userRole: user.role,
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl,
        requiredRoles: roles
      })
      return res.status(403).json({ error: 'Insufficient permissions' })
    }

    next()
  }
}

// Admin-only authorization
export const requireAdmin = authorize(['admin'])

// Student-only authorization
export const requireStudent = authorize(['student'])

// Admin or Student authorization
export const requireAdminOrStudent = authorize(['admin', 'student'])

// Resource ownership middleware
export const requireOwnership = (resourceTable: string, resourceIdField: string = 'id') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    const resourceId = req.params.id

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' })
    }

    // Admins can access all resources
    if (user.role === 'admin') {
      return next()
    }

    try {
      // Check if user owns the resource
      const { data: resource, error } = await supabase
        .from(resourceTable)
        .select('user_id')
        .eq(resourceIdField, resourceId)
        .single()

      if (error || !resource) {
        return res.status(404).json({ error: 'Resource not found' })
      }

      if (resource.user_id !== user.id) {
        logSecurityEvent('UNAUTHORIZED_RESOURCE_ACCESS', {
          userId: user.id,
          resourceId,
          resourceTable,
          ip: req.ip || req.connection.remoteAddress,
          url: req.originalUrl
        })
        return res.status(403).json({ error: 'Access denied to this resource' })
      }

      next()
    } catch (error) {
      logSecurityEvent('OWNERSHIP_CHECK_ERROR', {
        userId: user.id,
        resourceId,
        resourceTable,
        error: error instanceof Error ? error.message : 'Unknown error'
      })
      return res.status(500).json({ error: 'Error checking resource ownership' })
    }
  }
}

// API key authentication for service-to-service communication
export const authenticateApiKey = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key']

  if (!apiKey) {
    logSecurityEvent('MISSING_API_KEY', {
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl
    })
    return res.status(401).json({ error: 'API key required' })
  }

  // Validate API key against environment variable
  if (apiKey !== process.env.API_KEY) {
    logSecurityEvent('INVALID_API_KEY', {
      ip: req.ip || req.connection.remoteAddress,
      url: req.originalUrl
    })
    return res.status(403).json({ error: 'Invalid API key' })
  }

  next()
}

// Session validation middleware
export const validateSession = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user

  if (!user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    // Check if session is still valid (not expired, user not disabled, etc.)
    const { data: session, error } = await supabase
      .from('user_sessions')
      .select('expires_at, is_active')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (error || !session || new Date() > new Date(session.expires_at)) {
      logSecurityEvent('EXPIRED_SESSION', {
        userId: user.id,
        ip: req.ip || req.connection.remoteAddress,
        url: req.originalUrl
      })
      return res.status(401).json({ error: 'Session expired' })
    }

    next()
  } catch (error) {
    logSecurityEvent('SESSION_VALIDATION_ERROR', {
      userId: user.id,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return res.status(500).json({ error: 'Error validating session' })
  }
}