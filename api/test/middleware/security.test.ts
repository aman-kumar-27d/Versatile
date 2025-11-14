import { describe, it, expect, vi } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { createRateLimiter, sanitizeInput, validateRequest } from '../middleware/security'

describe('Security Middleware', () => {
  describe('createRateLimiter', () => {
    it('should create rate limiter with default settings', () => {
      const limiter = createRateLimiter()
      expect(limiter).toBeDefined()
      expect(typeof limiter).toBe('function')
    })

    it('should create rate limiter with custom settings', () => {
      const limiter = createRateLimiter(60000, 10)
      expect(limiter).toBeDefined()
      expect(typeof limiter).toBe('function')
    })
  })

  describe('sanitizeInput', () => {
    it('should sanitize XSS from request body', () => {
      const req = {
        body: {
          name: '<script>alert("xss")</script>John',
          email: 'john@example.com'
        }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      sanitizeInput(req, res, next)

      expect(req.body.name).toBe('John')
      expect(req.body.email).toBe('john@example.com')
      expect(next).toHaveBeenCalled()
    })

    it('should sanitize nested objects', () => {
      const req = {
        body: {
          user: {
            name: '<script>alert("xss")</script>John',
            profile: {
              bio: '<img src="x" onerror="alert(1)">'
            }
          }
        }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      sanitizeInput(req, res, next)

      expect(req.body.user.name).toBe('John')
      expect(req.body.user.profile.bio).toBe('')
      expect(next).toHaveBeenCalled()
    })

    it('should handle arrays', () => {
      const req = {
        body: {
          items: ['<script>alert("xss")</script>item1', 'normal-item']
        }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      sanitizeInput(req, res, next)

      expect(req.body.items[0]).toBe('item1')
      expect(req.body.items[1]).toBe('normal-item')
      expect(next).toHaveBeenCalled()
    })
  })

  describe('validateRequest', () => {
    it('should validate request body successfully', () => {
      const schema = {
        validate: vi.fn().mockReturnValue({ error: null })
      }
      const req = {
        body: { name: 'John', email: 'john@example.com' }
      } as Request
      const res = {} as Response
      const next = vi.fn() as NextFunction

      const middleware = validateRequest(schema)
      middleware(req, res, next)

      expect(schema.validate).toHaveBeenCalledWith(req.body)
      expect(next).toHaveBeenCalled()
    })

    it('should return validation errors', () => {
      const mockError = {
        details: [
          { path: ['name'], message: 'Name is required' },
          { path: ['email'], message: 'Email is invalid' }
        ]
      }
      const schema = {
        validate: vi.fn().mockReturnValue({ error: mockError })
      }
      const req = {
        body: { name: '', email: 'invalid' }
      } as Request
      const res = {
        status: vi.fn().mockReturnThis(),
        json: vi.fn()
      } as unknown as Response
      const next = vi.fn() as NextFunction

      const middleware = validateRequest(schema)
      middleware(req, res, next)

      expect(schema.validate).toHaveBeenCalledWith(req.body)
      expect(res.status).toHaveBeenCalledWith(400)
      expect(res.json).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [
          { field: 'name', message: 'Name is required' },
          { field: 'email', message: 'Email is invalid' }
        ]
      })
      expect(next).not.toHaveBeenCalled()
    })
  })
})