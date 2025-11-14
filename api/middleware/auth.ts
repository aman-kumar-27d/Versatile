import { Request, Response, NextFunction } from 'express'
import { verifyToken, getUserById } from '../utils/auth.js'
import type { JWTPayload, AuthUser } from '../utils/auth.js'

export interface AuthenticatedRequest extends Request {
  user?: AuthUser
}

/**
 * Middleware to authenticate requests using JWT tokens
 */
export async function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      res.status(401).json({ error: 'Access token required' })
      return
    }

    const payload = verifyToken(token)
    if (!payload) {
      res.status(401).json({ error: 'Invalid or expired token' })
      return
    }

    // Get user from database
    const user = await getUserById(payload.userId)
    if (!user) {
      res.status(401).json({ error: 'User not found' })
      return
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || undefined,
      avatarUrl: user.avatar_url || undefined
    }

    next()
  } catch (error) {
    console.error('Authentication error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

/**
 * Middleware to require admin role
 */
export function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({ error: 'Admin access required' })
    return
  }

  next()
}

/**
 * Middleware to require student role
 */
export function requireStudent(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  if (req.user.role !== 'student') {
    res.status(403).json({ error: 'Student access required' })
    return
  }

  next()
}

/**
 * Middleware to require either admin or student role
 */
export function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  next()
}

/**
 * Middleware to validate user owns resource or is admin
 */
export function requireOwnershipOrAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  // Admin can access any resource
  if (req.user.role === 'admin') {
    next()
    return
  }

  // For non-admin users, check if they own the resource
  const userId = req.params.userId || req.body.userId || req.query.userId
  if (!userId) {
    res.status(400).json({ error: 'User ID required' })
    return
  }

  if (req.user.id !== userId) {
    res.status(403).json({ error: 'Access denied' })
    return
  }

  next()
}

/**
 * Middleware to validate user is part of internship
 */
export function requireInternshipAccess(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' })
    return
  }

  // Admin can access any internship
  if (req.user.role === 'admin') {
    next()
    return
  }

  // For students, internship access will be validated in the route handler
  // based on their application status
  next()
}