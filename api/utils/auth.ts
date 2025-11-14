import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { supabaseAdmin } from '../../supabase/server.ts'
import type { User } from '../../supabase/server.ts'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'
const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS || '12')

export interface JWTPayload {
  userId: string
  email: string
  role: 'admin' | 'student'
  exp: number
}

export interface AuthUser {
  id: string
  email: string
  role: 'admin' | 'student'
  firstName: string
  lastName: string
  phone?: string
  avatarUrl?: string
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Compare a plain password with a hashed password
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7) // 7 days
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    return null
  }
}

/**
 * Get user by email from database
 */
export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('email', email)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

/**
 * Get user by ID from database
 */
export async function getUserById(id: string): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

/**
 * Create a new user
 */
export async function createUser(
  email: string,
  password: string,
  role: 'admin' | 'student',
  firstName: string,
  lastName: string,
  phone?: string
): Promise<User | null> {
  // First, create the auth user in Supabase
  const { data: authData, error: authError } = await supabaseAdmin.auth.signUp({
    email,
    password,
  })
  
  if (authError || !authData.user) {
    return null
  }
  
  // Then create the user profile in our users table
  const { data: userData, error: userError } = await supabaseAdmin
    .from('users')
    .insert({
      id: authData.user.id,
      email,
      role,
      first_name: firstName,
      last_name: lastName,
      phone
    })
    .select()
    .single()
  
  if (userError || !userData) {
    // If profile creation fails, try to delete the auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return null
  }
  
  return userData
}

/**
 * Authenticate user with email and password
 */
export async function authenticateUser(email: string, password: string): Promise<AuthUser | null> {
  // Sign in with Supabase auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  })
  
  if (authError || !authData.user) {
    return null
  }
  
  // Get user profile from our users table
  const user = await getUserById(authData.user.id)
  if (!user) {
    return null
  }
  
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: user.first_name,
    lastName: user.last_name,
    phone: user.phone || undefined,
    avatarUrl: user.avatar_url || undefined
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, 'first_name' | 'last_name' | 'phone' | 'avatar_url'>>
): Promise<User | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error || !data) {
    return null
  }
  
  return data
}

/**
 * Change user password
 */
export async function changePassword(userId: string, newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password: newPassword }
    )
    
    return !error
  } catch (error) {
    return false
  }
}

/**
 * Generate password reset token
 */
export function generatePasswordResetToken(userId: string): string {
  const payload = {
    userId,
    type: 'password_reset',
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
  }
  
  return jwt.sign(payload, JWT_SECRET)
}

/**
 * Verify password reset token
 */
export function verifyPasswordResetToken(token: string): string | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as any
    if (payload.type === 'password_reset') {
      return payload.userId
    }
    return null
  } catch (error) {
    return null
  }
}