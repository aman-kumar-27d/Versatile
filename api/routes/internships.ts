import { Router } from 'express'
import { z } from 'zod'
import { supabaseAdmin } from '../../supabase/config.js'
import { authenticateToken, requireAdmin, AuthenticatedRequest } from '../middleware/auth.js'
import type { Internship, Application } from '../../supabase/config.js'

const router = Router()

// Validation schemas
const createInternshipSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  requirements: z.array(z.string()).min(1, 'At least one requirement is required'),
  duration: z.string().min(1, 'Duration is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  organizerName: z.string().min(1, 'Organizer name is required'),
  organizerEmail: z.string().email('Invalid organizer email'),
  organizerPhone: z.string().optional(),
  organizerLogo: z.string().url('Invalid logo URL').optional(),
  instituteName: z.string().min(1, 'Institute name is required'),
  instituteAddress: z.string().min(1, 'Institute address is required'),
  status: z.enum(['draft', 'published', 'closed']).default('draft'),
})

const updateInternshipSchema = createInternshipSchema.partial()

const applicationSchema = z.object({
  coverLetter: z.string().min(1, 'Cover letter is required'),
  documents: z.array(z.string().url('Invalid document URL')).optional(),
})

const updateApplicationStatusSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
  notes: z.string().optional(),
})

/**
 * @route   GET /api/internships
 * @desc    Get all internships (with filtering)
 * @access  Public (published), Private (all)
 */
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabaseAdmin
      .from('internships')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    // Search functionality
    if (search && typeof search === 'string') {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`)
    }

    // If user is not admin, only show published internships
    if (!req.user || req.user.role !== 'admin') {
      query = query.eq('status', 'published')
    }

    const { data: internships, error, count } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      internships,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get internships error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   GET /api/internships/:id
 * @desc    Get single internship by ID
 * @access  Public (published), Private (all)
 */
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params

    let query = supabaseAdmin
      .from('internships')
      .select('*')
      .eq('id', id)
      .single()

    // If user is not admin, only show published internships
    if (!req.user || req.user.role !== 'admin') {
      query = query.eq('status', 'published')
    }

    const { data: internship, error } = await query

    if (error || !internship) {
      return res.status(404).json({ error: 'Internship not found' })
    }

    res.json({ internship })
  } catch (error) {
    console.error('Get internship error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/internships
 * @desc    Create new internship
 * @access  Private (Admin only)
 */
router.post('/', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    // Validate request body
    const validationResult = createInternshipSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      })
    }

    const internshipData = validationResult.data

    // Create internship
    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .insert({
        ...internshipData,
        created_by: req.user!.id,
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Internship created successfully',
      internship,
    })
  } catch (error) {
    console.error('Create internship error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   PUT /api/internships/:id
 * @desc    Update internship
 * @access  Private (Admin only)
 */
router.put('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params

    // Validate request body
    const validationResult = updateInternshipSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      })
    }

    const updateData = validationResult.data

    // Check if internship exists and belongs to the admin
    const { data: existingInternship, error: checkError } = await supabaseAdmin
      .from('internships')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (checkError || !existingInternship) {
      return res.status(404).json({ error: 'Internship not found' })
    }

    if (existingInternship.created_by !== req.user!.id) {
      return res.status(403).json({ error: 'You can only update your own internships' })
    }

    // Update internship
    const { data: internship, error } = await supabaseAdmin
      .from('internships')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      message: 'Internship updated successfully',
      internship,
    })
  } catch (error) {
    console.error('Update internship error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   DELETE /api/internships/:id
 * @desc    Delete internship
 * @access  Private (Admin only)
 */
router.delete('/:id', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params

    // Check if internship exists and belongs to the admin
    const { data: existingInternship, error: checkError } = await supabaseAdmin
      .from('internships')
      .select('id, created_by')
      .eq('id', id)
      .single()

    if (checkError || !existingInternship) {
      return res.status(404).json({ error: 'Internship not found' })
    }

    if (existingInternship.created_by !== req.user!.id) {
      return res.status(403).json({ error: 'You can only delete your own internships' })
    }

    // Delete internship
    const { error } = await supabaseAdmin
      .from('internships')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ message: 'Internship deleted successfully' })
  } catch (error) {
    console.error('Delete internship error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   POST /api/internships/:id/apply
 * @desc    Apply for internship
 * @access  Private (Student only)
 */
router.post('/:id/apply', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params

    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can apply for internships' })
    }

    // Validate request body
    const validationResult = applicationSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      })
    }

    const applicationData = validationResult.data

    // Check if internship exists and is published
    const { data: internship, error: internshipError } = await supabaseAdmin
      .from('internships')
      .select('id, status')
      .eq('id', id)
      .single()

    if (internshipError || !internship) {
      return res.status(404).json({ error: 'Internship not found' })
    }

    if (internship.status !== 'published') {
      return res.status(400).json({ error: 'This internship is not available for applications' })
    }

    // Check if student already applied
    const { data: existingApplication } = await supabaseAdmin
      .from('applications')
      .select('id')
      .eq('student_id', req.user!.id)
      .eq('internship_id', id)
      .single()

    if (existingApplication) {
      return res.status(409).json({ error: 'You have already applied for this internship' })
    }

    // Create application
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .insert({
        student_id: req.user!.id,
        internship_id: id,
        cover_letter: applicationData.coverLetter,
        documents: applicationData.documents || [],
      })
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.status(201).json({
      message: 'Application submitted successfully',
      application,
    })
  } catch (error) {
    console.error('Apply for internship error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   GET /api/internships/:id/applications
 * @desc    Get applications for internship
 * @access  Private (Admin only)
 */
router.get('/:id/applications', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params
    const { status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabaseAdmin
      .from('applications')
      .select(`*, users!inner(first_name, last_name, email)`)
      .eq('internship_id', id)
      .order('applied_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    const { data: applications, error, count } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get applications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   PUT /api/internships/:id/applications/:applicationId
 * @desc    Update application status
 * @access  Private (Admin only)
 */
router.put('/:id/applications/:applicationId', authenticateToken, requireAdmin, async (req: AuthenticatedRequest, res) => {
  try {
    const { id, applicationId } = req.params

    // Validate request body
    const validationResult = updateApplicationStatusSchema.safeParse(req.body)
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      })
    }

    const { status, notes } = validationResult.data

    // Check if application exists and belongs to the internship
    const { data: existingApplication, error: checkError } = await supabaseAdmin
      .from('applications')
      .select('id, internship_id')
      .eq('id', applicationId)
      .single()

    if (checkError || !existingApplication) {
      return res.status(404).json({ error: 'Application not found' })
    }

    if (existingApplication.internship_id !== id) {
      return res.status(400).json({ error: 'Application does not belong to this internship' })
    }

    // Update application status
    const { data: application, error } = await supabaseAdmin
      .from('applications')
      .update({
        status,
        notes,
        reviewed_at: new Date().toISOString(),
        reviewed_by: req.user!.id,
      })
      .eq('id', applicationId)
      .select()
      .single()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      message: 'Application status updated successfully',
      application,
    })
  } catch (error) {
    console.error('Update application status error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

/**
 * @route   GET /api/internships/student/applications
 * @desc    Get student's applications
 * @access  Private (Student only)
 */
router.get('/student/applications', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    if (req.user!.role !== 'student') {
      return res.status(403).json({ error: 'Only students can view their applications' })
    }

    const { status, page = 1, limit = 10 } = req.query
    const offset = (Number(page) - 1) * Number(limit)

    let query = supabaseAdmin
      .from('applications')
      .select(`*, internships!inner(title, organizer_name, start_date, end_date)`)
      .eq('student_id', req.user!.id)
      .order('applied_at', { ascending: false })
      .range(offset, offset + Number(limit) - 1)

    // Filter by status
    if (status && typeof status === 'string') {
      query = query.eq('status', status)
    }

    const { data: applications, error, count } = await query

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({
      applications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit)),
      },
    })
  } catch (error) {
    console.error('Get student applications error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

export default router