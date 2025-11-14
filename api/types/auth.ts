export interface User {
  id: string
  email: string
  role: 'admin' | 'student'
  first_name: string
  last_name: string
  phone?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}