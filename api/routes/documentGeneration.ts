import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { documentGenerationService, OfferLetterData, CertificateData } from '../services/documentGenerationService';
import { notificationService } from '../services/notificationService';
import { supabase } from '../config/supabase';

const router = express.Router();

// Validation schemas
const offerLetterSchema = z.object({
  student_name: z.string().min(2).max(100),
  student_email: z.string().email(),
  internship_title: z.string().min(2).max(200),
  company_name: z.string().min(2).max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  stipend: z.string().min(1).max(50),
  location: z.string().min(2).max(100),
  supervisor_name: z.string().min(2).max(100),
  internship_id: z.string().uuid()
});

const certificateSchema = z.object({
  student_name: z.string().min(2).max(100),
  internship_title: z.string().min(2).max(200),
  company_name: z.string().min(2).max(100),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completion_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  performance_grade: z.enum(['A', 'B', 'C', 'D']),
  skills_learned: z.array(z.string().min(1).max(100)).min(1).max(10),
  internship_id: z.string().uuid()
});

// Generate offer letter
router.post('/offer-letter', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const validationResult = offerLetterSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const offerLetterData: OfferLetterData = validationResult.data;
    
    // Generate the offer letter
    const generatedDocument = await documentGenerationService.generateOfferLetter(offerLetterData);
    
    // Send notification to student
    await notificationService.sendOfferLetterNotification({
      studentEmail: offerLetterData.student_email,
      studentName: offerLetterData.student_name,
      internshipTitle: offerLetterData.internship_title,
      companyName: offerLetterData.company_name,
      documentUrl: generatedDocument.document_url,
      verificationCode: generatedDocument.verification_code
    });

    res.json({
      success: true,
      document: generatedDocument,
      message: 'Offer letter generated and sent successfully'
    });
  } catch (error) {
    console.error('Error generating offer letter:', error);
    res.status(500).json({
      error: 'Failed to generate offer letter',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Generate completion certificate
router.post('/completion-certificate', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const validationResult = certificateSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const certificateData: CertificateData = validationResult.data;
    
    // Fetch student email from the internship application
    const { data: application, error: appError } = await supabase
      .from('internship_applications')
      .select('student_id, student:users!inner(email)')
      .eq('internship_id', certificateData.internship_id)
      .single();

    if (appError || !application) {
      console.error('Could not fetch student email for certificate notification:', appError);
    }
    
    // Generate the completion certificate
    const generatedDocument = await documentGenerationService.generateCompletionCertificate(certificateData);
    
    // Send notification to student if we have their email
    if (application?.student?.email) {
      await notificationService.sendCertificateNotification({
        studentName: certificateData.student_name,
        studentEmail: application.student.email,
        internshipTitle: certificateData.internship_title,
        companyName: certificateData.company_name,
        documentUrl: generatedDocument.document_url,
        verificationCode: generatedDocument.verification_code
      });
    }

    res.json({
      success: true,
      document: generatedDocument,
      message: 'Completion certificate generated and sent successfully'
    });
  } catch (error) {
    console.error('Error generating completion certificate:', error);
    res.status(500).json({
      error: 'Failed to generate completion certificate',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Verify document by verification code
router.get('/verify/:verificationCode', async (req, res) => {
  try {
    const { verificationCode } = req.params;
    
    if (!verificationCode || verificationCode.length !== 16) {
      return res.status(400).json({
        error: 'Invalid verification code format'
      });
    }

    const document = await documentGenerationService.verifyDocument(verificationCode);
    
    if (!document) {
      return res.status(404).json({
        error: 'Document not found or expired',
        verified: false
      });
    }

    res.json({
      success: true,
      verified: true,
      document: {
        id: document.id,
        type: document.type,
        student_id: document.student_id,
        internship_id: document.internship_id,
        created_at: document.created_at,
        expires_at: document.expires_at,
        document_url: document.document_url
      }
    });
  } catch (error) {
    console.error('Error verifying document:', error);
    res.status(500).json({
      error: 'Failed to verify document',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get student's generated documents
router.get('/student/:studentId', requireAuth, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user!.id;
    const userRole = req.user!.role;

    // Students can only access their own documents
    // Admins can access any student's documents
    if (userRole === 'student' && studentId !== userId) {
      return res.status(403).json({
        error: 'Access denied. You can only view your own documents.'
      });
    }

    const documents = await documentGenerationService.getStudentDocuments(studentId);

    res.json({
      success: true,
      documents: documents.map(doc => ({
        id: doc.id,
        type: doc.type,
        internship_id: doc.internship_id,
        verification_code: doc.verification_code,
        document_url: doc.document_url,
        created_at: doc.created_at,
        expires_at: doc.expires_at
      }))
    });
  } catch (error) {
    console.error('Error fetching student documents:', error);
    res.status(500).json({
      error: 'Failed to fetch student documents',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get all generated documents (admin only)
router.get('/all', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 50, type, student_id } = req.query;
    
    let query = supabase
      .from('generated_documents')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (type) {
      query = query.eq('type', type);
    }

    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch documents: ${error.message}`);
    }

    res.json({
      success: true,
      documents: data || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({
      error: 'Failed to fetch documents',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Delete generated document
router.delete('/:documentId', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { documentId } = req.params;
    
    // First, get the document to find the file URL
    const { data: document, error: fetchError } = await supabase
      .from('generated_documents')
      .select('document_url')
      .eq('id', documentId)
      .single();

    if (fetchError || !document) {
      return res.status(404).json({
        error: 'Document not found'
      });
    }

    // Delete from storage
    const fileName = document.document_url.split('/').pop();
    if (fileName) {
      const { error: storageError } = await supabase.storage
        .from('documents')
        .remove([fileName]);

      if (storageError) {
        console.error('Error deleting file from storage:', storageError);
      }
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('generated_documents')
      .delete()
      .eq('id', documentId);

    if (deleteError) {
      throw new Error(`Failed to delete document: ${deleteError.message}`);
    }

    res.json({
      success: true,
      message: 'Document deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({
      error: 'Failed to delete document',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;