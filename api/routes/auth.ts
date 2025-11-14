import { Router } from 'express'
import { z } from 'zod'
import { 
  authenticateUser, 
  createUser, 
  generateToken, 
  updateUserProfile, 
  changePassword,
  generatePasswordResetToken,
  verifyPasswordResetToken,
  getUserById,
  getUserByEmail
} from '../utils/auth.js'
import { authenticateToken } from '../middleware/auth.js'
import { AuthenticatedRequest } from '../middleware/auth.js'
import { supabaseAdmin } from '../../supabase/server.ts'

const router = Router()

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['admin', 'student']),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phone: z.string().optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

const updateProfileSchema = z.object({
  firstName: z.string().min(1, 'First name is required').optional(),
  lastName: z.string().min(1, 'Last name is required').optional(),
  phone: z.string().optional(),
  avatarUrl: z.string().url('Invalid URL').optional()
})

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
})

const resetPasswordSchema = z.object({
  email: z.string().email('Invalid email address')
})

const confirmResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters')
})

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', async (req, res) => {
  try {
    // Validate request body
    const validationResult = registerSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { email, password, role, firstName, lastName, phone } = validationResult.data

    // Check if user already exists
    const existingUser = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser.data) {
      return res.status(409).json({ error: 'User already exists with this email' })
    }

    // Create new user
    const user = await createUser(email, password, role, firstName, lastName, phone)
    if (!user) {
      return res.status(500).json({ error: 'Failed to create user' })
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      role: user.role,
      firstName: user.first_name,
      lastName: user.last_name,
      phone: user.phone || undefined,
      avatarUrl: user.avatar_url || undefined
    })

    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        avatarUrl: user.avatar_url
      },
      token
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', async (req, res) => {
  try {
    // Validate request body
    const validationResult = loginSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { email, password } = validationResult.data

    // Authenticate user
    const user = await authenticateUser(email, password)
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate token
    const token = generateToken(user)

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        avatarUrl: user.avatarUrl
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   GET /api/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' })
    }

    res.json({
      user: req.user
    })
  } catch (error) {
    console.error('Get profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   PUT /api/auth/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Validate request body
    const validationResult = updateProfileSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { firstName, lastName, phone, avatarUrl } = validationResult.data

    // Update user profile
    const updatedUser = await updateUserProfile(req.user.id, {
      first_name: firstName,
      last_name: lastName,
      phone,
      avatar_url: avatarUrl
    })

    if (!updatedUser) {
      return res.status(500).json({ error: 'Failed to update profile' })
    }

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        firstName: updatedUser.first_name,
        lastName: updatedUser.last_name,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatar_url
      }
    })
  } catch (error) {
    console.error('Update profile error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/auth/change-password
 * @desc    Change user password
 * @access  Private
 */
router.post('/change-password', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'User not found' })
    }

    // Validate request body
    const validationResult = changePasswordSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { currentPassword, newPassword } = validationResult.data

    // Verify current password by attempting to authenticate
    const isValid = await authenticateUser(req.user.email, currentPassword)
    if (!isValid) {
      return res.status(401).json({ error: 'Current password is incorrect' })
    }

    // Change password
    const success = await changePassword(req.user.id, newPassword)
    if (!success) {
      return res.status(500).json({ error: 'Failed to change password' })
    }

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/auth/reset-password
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password', async (req, res) => {
  try {
    // Validate request body
    const validationResult = resetPasswordSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { email } = validationResult.data

    // Check if user exists
    const user = await getUserByEmail(email)
    if (!user) {
      // Don't reveal whether user exists for security
      return res.json({ message: 'If an account exists with this email, a password reset link has been sent' })
    }

    // Generate reset token
    const resetToken = generatePasswordResetToken(user.id)

    // TODO: Send email with reset link
    // For now, just return the token (in production, this should be sent via email)
    res.json({
      message: 'Password reset link has been sent to your email',
      resetToken // Remove this in production - only for development
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/auth/confirm-reset-password
 * @desc    Confirm password reset
 * @access  Public
 */
router.post('/confirm-reset-password', async (req, res) => {
  try {
    // Validate request body
    const validationResult = confirmResetPasswordSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      })
    }

    const { token, newPassword } = validationResult.data

    // Verify reset token
    const userId = verifyPasswordResetToken(token)
    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' })
    }

    // Change password
    const success = await changePassword(userId, newPassword)
    if (!success) {
      return res.status(500).json({ error: 'Failed to reset password' })
    }

    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    console.error('Confirm reset password error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   DELETE /api/auth/logout
 * @desc    Logout user (invalidate token on client side)
 * @access  Private
 */
router.delete('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // In a stateless JWT system, logout is handled client-side
    // Here we can optionally perform server-side cleanup if needed
    
    res.json({ message: 'Logout successful' })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router