import express from 'express'
import multer from 'multer'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.js'
import { storageService } from '../services/storageService.js'
import { supabaseAdmin } from '../supabase/server.js'

const router = express.Router()

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
})

// Document validation schema
const documentSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  type: z.enum(['application', 'assignment', 'certificate', 'offer_letter', 'other']),
  internship_id: z.string().uuid().optional(),
  course_id: z.string().uuid().optional(),
})

// Upload document
router.post('/upload', requireAuth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file provided',
      })
    }

    const user = req.user!
    const metadata = documentSchema.parse(req.body)

    // Upload to storage
    const uploadResult = await storageService.uploadFile(req.file, {
      bucket: 'documents',
      folder: `${user.id}/${metadata.type}`,
    })

    // Save document metadata to database
    const { data: document, error: dbError } = await supabaseAdmin
      .from('documents')
      .insert({
        user_id: user.id,
        title: metadata.title,
        description: metadata.description,
        type: metadata.type,
        file_url: uploadResult.url,
        file_key: uploadResult.key,
        file_size: uploadResult.size,
        mime_type: uploadResult.mimeType,
        internship_id: metadata.internship_id,
        course_id: metadata.course_id,
      })
      .select()
      .single()

    if (dbError) {
      // Rollback storage upload if DB fails
      await storageService.deleteFile('documents', uploadResult.key)
      throw dbError
    }

    res.status(201).json({
      success: true,
      data: document,
    })
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed',
    })
  }
})

// Get user documents
router.get('/', requireAuth, async (req, res) => {
  try {
    const user = req.user!
    const { type, internship_id, course_id } = req.query

    let query = supabaseAdmin
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    if (internship_id) {
      query = query.eq('internship_id', internship_id)
    }

    if (course_id) {
      query = query.eq('course_id', course_id)
    }

    const { data: documents, error } = await query

    if (error) {
      throw error
    }

    res.json({
      success: true,
      data: documents,
    })
  } catch (error) {
    console.error('Get documents error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
    })
  }
})

// Get document download URL
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const user = req.user!
    const { id } = req.params

    // Get document metadata
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      })
    }

    // Generate signed download URL
    const downloadResult = await storageService.getSignedUrl(
      'documents',
      document.file_key,
      3600 // 1 hour expiry
    )

    res.json({
      success: true,
      data: {
        url: downloadResult.url,
        expiresAt: downloadResult.expiresAt,
        filename: document.title,
      },
    })
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Download failed',
    })
  }
})

// Delete document
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const user = req.user!
    const { id } = req.params

    // Get document metadata
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      })
    }

    // Delete from storage first
    await storageService.deleteFile('documents', document.file_key)

    // Delete from database
    const { error: deleteError } = await supabaseAdmin
      .from('documents')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw deleteError
    }

    res.json({
      success: true,
      message: 'Document deleted successfully',
    })
  } catch (error) {
    console.error('Delete error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Delete failed',
    })
  }
})

// Share document (generate shareable link)
router.post('/:id/share', requireAuth, async (req, res) => {
  try {
    const user = req.user!
    const { id } = req.params
    const { expiresIn = 86400 } = req.body // 24 hours default

    // Get document metadata
    const { data: document, error: docError } = await supabaseAdmin
      .from('documents')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single()

    if (docError || !document) {
      return res.status(404).json({
        success: false,
        error: 'Document not found',
      })
    }

    // Generate signed URL for sharing
    const downloadResult = await storageService.getSignedUrl(
      'documents',
      document.file_key,
      expiresIn
    )

    res.json({
      success: true,
      data: {
        shareUrl: downloadResult.url,
        expiresAt: downloadResult.expiresAt,
      },
    })
  } catch (error) {
    console.error('Share error:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Share failed',
    })
  }
})

export default router