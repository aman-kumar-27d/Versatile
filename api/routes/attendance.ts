import express from 'express';
import { z } from 'zod';
import { requireAuth, requireRole } from '../middleware/auth';
import { supabase } from '../config/supabase';
import { notificationService } from '../services/notificationService';

const router = express.Router();

// Validation schemas
const attendanceSchema = z.object({
  student_id: z.string().uuid(),
  internship_id: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD
  status: z.enum(['present', 'absent', 'late', 'excused']),
  check_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  check_out_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(), // HH:MM format
  hours_worked: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional()
});

const updateAttendanceSchema = z.object({
  status: z.enum(['present', 'absent', 'late', 'excused']),
  check_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  check_out_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional(),
  hours_worked: z.number().min(0).max(24).optional(),
  notes: z.string().max(500).optional()
});

// Get attendance records with filters
router.get('/', requireAuth, async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      status,
      internship_id,
      student_id,
      search,
      page = 1,
      limit = 50
    } = req.query;

    let query = supabase
      .from('attendance')
      .select(`
        *,
        student:users!student_id(id, email, full_name),
        internship:internships!internship_id(id, title, company_name)
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }
    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    // Role-based filtering
    if (req.user!.role === 'student') {
      query = query.eq('student_id', req.user!.id);
    }

    // Search functionality
    if (search) {
      query = query.or(`student.full_name.ilike.%${search}%,student.email.ilike.%${search}%`);
    }

    // Pagination
    const from = (Number(page) - 1) * Number(limit);
    const to = from + Number(limit) - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch attendance records: ${error.message}`);
    }

    const records = data.map(record => ({
      id: record.id,
      student_id: record.student_id,
      student_name: record.student?.full_name || 'Unknown Student',
      student_email: record.student?.email || 'Unknown Email',
      internship_id: record.internship_id,
      internship_title: record.internship?.title || 'Unknown Internship',
      date: record.date,
      status: record.status,
      check_in_time: record.check_in_time,
      check_out_time: record.check_out_time,
      hours_worked: record.hours_worked,
      notes: record.notes,
      marked_by: record.marked_by,
      created_at: record.created_at,
      updated_at: record.updated_at
    }));

    res.json({
      success: true,
      records,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching attendance records:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance records',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Get attendance statistics
router.get('/stats', requireAuth, async (req, res) => {
  try {
    const { student_id, internship_id, start_date, end_date } = req.query;

    let query = supabase
      .from('attendance')
      .select('status, hours_worked', { count: 'exact' });

    // Apply filters
    if (student_id) {
      query = query.eq('student_id', student_id);
    }
    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }

    // Role-based filtering
    if (req.user!.role === 'student') {
      query = query.eq('student_id', req.user!.id);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch attendance stats: ${error.message}`);
    }

    const stats = {
      total_days: count || 0,
      present_days: data.filter(r => r.status === 'present').length,
      absent_days: data.filter(r => r.status === 'absent').length,
      late_days: data.filter(r => r.status === 'late').length,
      attendance_percentage: count ? ((data.filter(r => r.status === 'present').length / count) * 100) : 0,
      total_hours: data.reduce((sum, r) => sum + (r.hours_worked || 0), 0)
    };

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching attendance stats:', error);
    res.status(500).json({
      error: 'Failed to fetch attendance statistics',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Mark attendance
router.post('/', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const validationResult = attendanceSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const attendanceData = validationResult.data;

    // Check if attendance already exists for this student and date
    const { data: existingRecord } = await supabase
      .from('attendance')
      .select('id')
      .eq('student_id', attendanceData.student_id)
      .eq('date', attendanceData.date)
      .single();

    if (existingRecord) {
      return res.status(400).json({
        error: 'Attendance already marked for this student on this date',
        existing_record_id: existingRecord.id
      });
    }

    // Insert new attendance record
    const { data, error } = await supabase
      .from('attendance')
      .insert([{
        ...attendanceData,
        marked_by: req.user!.id
      }])
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to mark attendance: ${error.message}`);
    }

    // Send notification to student
    try {
      const { data: student } = await supabase
        .from('users')
        .select('email, full_name')
        .eq('id', attendanceData.student_id)
        .single();

      const { data: internship } = await supabase
        .from('internships')
        .select('title')
        .eq('id', attendanceData.internship_id)
        .single();

      if (student && internship) {
        await notificationService.sendNotification({
          type: 'attendance_marked',
          recipient: {
            email: student.email,
            name: student.full_name
          },
          data: {
            studentName: student.full_name,
            courseTitle: internship.title,
            status: attendanceData.status,
            date: attendanceData.date
          },
          priority: 'medium'
        });
      }
    } catch (notificationError) {
      console.error('Failed to send attendance notification:', notificationError);
    }

    res.json({
      success: true,
      record: data,
      message: 'Attendance marked successfully'
    });
  } catch (error) {
    console.error('Error marking attendance:', error);
    res.status(500).json({
      error: 'Failed to mark attendance',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Update attendance record
router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;
    const validationResult = updateAttendanceSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors
      });
    }

    const updateData = validationResult.data;

    // Update attendance record
    const { data, error } = await supabase
      .from('attendance')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update attendance: ${error.message}`);
    }

    if (!data) {
      return res.status(404).json({
        error: 'Attendance record not found'
      });
    }

    res.json({
      success: true,
      record: data,
      message: 'Attendance updated successfully'
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    res.status(500).json({
      error: 'Failed to update attendance',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Delete attendance record
router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('attendance')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete attendance record: ${error.message}`);
    }

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting attendance record:', error);
    res.status(500).json({
      error: 'Failed to delete attendance record',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

// Export attendance data
router.get('/export', requireAuth, async (req, res) => {
  try {
    const {
      start_date,
      end_date,
      status,
      internship_id,
      student_id
    } = req.query;

    let query = supabase
      .from('attendance')
      .select(`
        date,
        status,
        check_in_time,
        check_out_time,
        hours_worked,
        notes,
        student:users!student_id(full_name, email),
        internship:internships!internship_id(title, company_name)
      `)
      .order('date', { ascending: false });

    // Apply filters
    if (start_date) {
      query = query.gte('date', start_date);
    }
    if (end_date) {
      query = query.lte('date', end_date);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (internship_id) {
      query = query.eq('internship_id', internship_id);
    }
    if (student_id) {
      query = query.eq('student_id', student_id);
    }

    // Role-based filtering
    if (req.user!.role === 'student') {
      query = query.eq('student_id', req.user!.id);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch attendance data for export: ${error.message}`);
    }

    // Convert to CSV format
    const csvHeaders = ['Date', 'Student Name', 'Student Email', 'Internship', 'Company', 'Status', 'Check In', 'Check Out', 'Hours Worked', 'Notes'];
    const csvRows = data.map(record => [
      record.date,
      record.student?.full_name || 'Unknown',
      record.student?.email || 'Unknown',
      record.internship?.title || 'Unknown',
      record.internship?.company_name || 'Unknown',
      record.status,
      record.check_in_time || '',
      record.check_out_time || '',
      record.hours_worked || '',
      record.notes || ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n');

    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="attendance_export_${new Date().toISOString().split('T')[0]}.csv"`);
    
    res.send(csvContent);
  } catch (error) {
    console.error('Error exporting attendance data:', error);
    res.status(500).json({
      error: 'Failed to export attendance data',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
});

export default router;