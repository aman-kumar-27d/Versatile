import { describe, it, expect, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { authenticateToken, authorize, requireAdmin, requireStudent } from '../middleware/auth'
import jwt from 'jsonwebtoken'

vi.mock('../config/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: '1', email: 'test@example.com', role: 'student', is_active: true },
        error: null
      })
    }))
  }
}))

describe('Auth Middleware', () => {
  describe('authenticateToken', () => {
    it('should authenticate valid token', async () => {
      const token = jwt.sign({ userId: '1' }, 'test-secret')
      const req = {
        headers: { authorization: `Bearer ${token}` },
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      process.env.JWT_SECRET = 'test-secret'
      await authenticateToken(req, res, next)

      expect((req as any).user).toEqual({
        id: '1',
        email: 'test@example.com',
        role: 'student'
      })
      expect(next).toHaveBeenCalled()
    })

    it('should reject missing token', async () => {
      const req = {
        headers: {},
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should reject invalid token', async () => {
      const req = {
        headers: { authorization: 'Bearer invalid-token' },
        ip: '127.0.0.1',
        connection: { remoteAddress: '127.0.0.1' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      await authenticateToken(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('authorize', () => {
    it('should allow access for authorized role', () => {
      const req = {
        user: { id: '1', role: 'admin' }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      const middleware = authorize(['admin', 'student'])
      middleware(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should deny access for unauthorized role', () => {
      const req = {
        user: { id: '1', role: 'student' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      const middleware = authorize(['admin'])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' })
      expect(next).not.toHaveBeenCalled()
    })

    it('should deny access when no user', () => {
      const req = {} as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      const middleware = authorize(['admin'])
      middleware(req, res, next)

      expect(res.status).toHaveBeenCalledWith(401)
      expect(res.json).toHaveBeenCalledWith({ error: 'Authentication required' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('requireAdmin', () => {
    it('should allow admin access', () => {
      const req = {
        user: { id: '1', role: 'admin' }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      requireAdmin(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should deny student access', () => {
      const req = {
        user: { id: '1', role: 'student' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      requireAdmin(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' })
      expect(next).not.toHaveBeenCalled()
    })
  })

  describe('requireStudent', () => {
    it('should allow student access', () => {
      const req = {
        user: { id: '1', role: 'student' }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      requireStudent(req, res, next)

      expect(next).toHaveBeenCalled()
    })

    it('should deny admin access', () => {
      const req = {
        user: { id: '1', role: 'admin' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      requireStudent(req, res, next)

      expect(res.status).toHaveBeenCalledWith(403)
      expect(res.json).toHaveBeenCalledWith({ error: 'Insufficient permissions' })
      expect(next).not.toHaveBeenCalled()
    })
  })
})