import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Client for frontend (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Client for backend (service role key)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
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
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['users']['Insert']>
      }
      internships: {
        Row: {
          id: string
          title: string
          description: string
          requirements: string[]
          duration: string
          start_date: string
          end_date: string
          organizer_name: string
          organizer_email: string
          organizer_phone?: string
          organizer_logo?: string
          institute_name: string
          institute_address: string
          status: 'draft' | 'published' | 'closed'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['internships']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['internships']['Insert']>
      }
      applications: {
        Row: {
          id: string
          student_id: string
          internship_id: string
          status: 'pending' | 'approved' | 'rejected'
          cover_letter: string
          documents: string[]
          applied_at: string
          reviewed_at?: string
          reviewed_by?: string
          notes?: string
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'applied_at'>
        Update: Partial<Database['public']['Tables']['applications']['Insert']>
      }
      courses: {
        Row: {
          id: string
          title: string
          description: string
          content: string
          duration: number
          internship_id: string
          instructor_id: string
          materials: string[]
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['courses']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['courses']['Insert']>
      }
      student_courses: {
        Row: {
          id: string
          student_id: string
          course_id: string
          progress: number
          completed_at?: string
          enrolled_at: string
        }
        Insert: Omit<Database['public']['Tables']['student_courses']['Row'], 'id' | 'enrolled_at'>
        Update: Partial<Database['public']['Tables']['student_courses']['Insert']>
      }
      attendance: {
        Row: {
          id: string
          student_id: string
          course_id: string
          date: string
          status: 'present' | 'absent' | 'late'
          notes?: string
          marked_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['attendance']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['attendance']['Insert']>
      }
      meetings: {
        Row: {
          id: string
          title: string
          description: string
          type: 'class' | 'meeting' | 'event'
          start_time: string
          end_time: string
          internship_id: string
          organizer_id: string
          attendees: string[]
          location?: string
          meeting_link?: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['meetings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['meetings']['Insert']>
      }
      documents: {
        Row: {
          id: string
          name: string
          type: 'offer_letter' | 'certificate' | 'assignment' | 'material' | 'other'
          file_url: string
          file_size: number
          mime_type: string
          related_id?: string
          related_type?: 'internship' | 'application' | 'course' | 'user'
          uploaded_by: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['documents']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['documents']['Insert']>
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: 'info' | 'warning' | 'success' | 'error'
          read: boolean
          related_id?: string
          related_type?: 'internship' | 'application' | 'course' | 'meeting'
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['notifications']['Row'], 'id' | 'read' | 'created_at'>
        Update: Partial<Database['public']['Tables']['notifications']['Insert']>
      }
    }
  }
}

export type Tables = Database['public']['Tables']
export type User = Tables['users']['Row']
export type Internship = Tables['internships']['Row']
export type Application = Tables['applications']['Row']
export type Course = Tables['courses']['Row']
export type StudentCourse = Tables['student_courses']['Row']
export type Attendance = Tables['attendance']['Row']
export type Meeting = Tables['meetings']['Row']
export type Document = Tables['documents']['Row']
export type Notification = Tables['notifications']['Row']