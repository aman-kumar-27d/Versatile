import nodemailer from 'nodemailer'
import { z } from 'zod'

// Email configuration
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

// SMS configuration (Twilio example)
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN 
  ? require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null

// Notification types
export type NotificationType = 
  | 'application_received'
  | 'application_approved'
  | 'application_rejected'
  | 'offer_letter_sent'
  | 'certificate_generated'
  | 'meeting_scheduled'
  | 'meeting_reminder'
  | 'assignment_due'
  | 'assignment_submitted'
  | 'attendance_marked'
  | 'course_enrollment'
  | 'general_announcement'

export interface NotificationData {
  type: NotificationType
  recipient: {
    email: string
    phone?: string
    name: string
  }
  data: Record<string, any>
  priority?: 'low' | 'medium' | 'high'
}

export interface EmailTemplate {
  subject: string
  html: string
  text?: string
}

export interface SMSTemplate {
  message: string
}

// Email templates
const emailTemplates: Record<NotificationType, (data: Record<string, any>) => EmailTemplate> = {
  application_received: (data) => ({
    subject: `Application Received - ${data.internshipTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>Thank you for applying to the <strong>${data.internshipTitle}</strong> internship program.</p>
      <p>We have received your application and will review it shortly. You will be notified once a decision has been made.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, Thank you for applying to the ${data.internshipTitle} internship program. We have received your application and will review it shortly.`
  }),

  application_approved: (data) => ({
    subject: `Application Approved - ${data.internshipTitle}`,
    html: `
      <h2>Congratulations ${data.studentName}!</h2>
      <p>Your application for the <strong>${data.internshipTitle}</strong> internship has been approved.</p>
      <p>Please check your dashboard for next steps and required documents.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Congratulations ${data.studentName}! Your application for the ${data.internshipTitle} internship has been approved.`
  }),

  application_rejected: (data) => ({
    subject: `Application Update - ${data.internshipTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>Thank you for your interest in the <strong>${data.internshipTitle}</strong> internship program.</p>
      <p>After careful consideration, we regret to inform you that we will not be moving forward with your application at this time.</p>
      <p>We encourage you to apply for other opportunities that match your qualifications.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, Thank you for your interest in the ${data.internshipTitle} internship program. We regret to inform you that we will not be moving forward with your application at this time.`
  }),

  offer_letter_sent: (data) => ({
    subject: `Offer Letter - ${data.internshipTitle}`,
    html: `
      <h2>Congratulations ${data.studentName}!</h2>
      <p>We are pleased to offer you a position in the <strong>${data.internshipTitle}</strong> internship program.</p>
      <p>Your offer letter is attached to this email. Please review the terms and conditions carefully.</p>
      <p>You have until ${data.deadline} to accept this offer.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Congratulations ${data.studentName}! We are pleased to offer you a position in the ${data.internshipTitle} internship program. Please review the attached offer letter.`
  }),

  certificate_generated: (data) => ({
    subject: `Internship Completion Certificate`,
    html: `
      <h2>Congratulations ${data.studentName}!</h2>
      <p>You have successfully completed the <strong>${data.internshipTitle}</strong> internship program.</p>
      <p>Your completion certificate is attached to this email. You can also download it from your dashboard.</p>
      <p>Certificate ID: <strong>${data.certificateId}</strong></p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Congratulations ${data.studentName}! You have successfully completed the ${data.internshipTitle} internship program. Your certificate ID is ${data.certificateId}.`
  }),

  meeting_scheduled: (data) => ({
    subject: `Meeting Scheduled - ${data.meetingTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>A meeting has been scheduled for you:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Title:</strong> ${data.meetingTitle}</p>
        <p><strong>Date:</strong> ${data.meetingDate}</p>
        <p><strong>Time:</strong> ${data.meetingTime}</p>
        <p><strong>Location:</strong> ${data.location}</p>
      </div>
      <p>Please make sure to attend on time.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, A meeting has been scheduled for you: ${data.meetingTitle} on ${data.meetingDate} at ${data.meetingTime}.`
  }),

  meeting_reminder: (data) => ({
    subject: `Meeting Reminder - ${data.meetingTitle}`,
    html: `
      <h2>Reminder: ${data.studentName},</h2>
      <p>This is a reminder about your upcoming meeting:</p>
      <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Title:</strong> ${data.meetingTitle}</p>
        <p><strong>Date:</strong> ${data.meetingDate}</p>
        <p><strong>Time:</strong> ${data.meetingTime}</p>
        <p><strong>Location:</strong> ${data.location}</p>
      </div>
      <p>The meeting is in ${data.timeUntil}.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Reminder: ${data.studentName}, Your meeting ${data.meetingTitle} is in ${data.timeUntil}.`
  }),

  assignment_due: (data) => ({
    subject: `Assignment Due Soon - ${data.assignmentTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>This is a reminder that your assignment is due soon:</p>
      <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Assignment:</strong> ${data.assignmentTitle}</p>
        <p><strong>Course:</strong> ${data.courseTitle}</p>
        <p><strong>Due Date:</strong> ${data.dueDate}</p>
        <p><strong>Time Remaining:</strong> ${data.timeRemaining}</p>
      </div>
      <p>Please submit your assignment before the deadline.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, Your assignment ${data.assignmentTitle} is due in ${data.timeRemaining}.`
  }),

  assignment_submitted: (data) => ({
    subject: `Assignment Submitted - ${data.assignmentTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>Thank you for submitting your assignment:</p>
      <div style="background-color: #d1edff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Assignment:</strong> ${data.assignmentTitle}</p>
        <p><strong>Course:</strong> ${data.courseTitle}</p>
        <p><strong>Submitted:</strong> ${data.submittedAt}</p>
      </div>
      <p>Your submission will be reviewed and graded soon.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, Thank you for submitting your assignment ${data.assignmentTitle}.`
  }),

  attendance_marked: (data) => ({
    subject: `Attendance Marked - ${data.courseTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>Your attendance has been marked for:</p>
      <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Course:</strong> ${data.courseTitle}</p>
        <p><strong>Date:</strong> ${data.date}</p>
        <p><strong>Status:</strong> ${data.status}</p>
      </div>
      <p>Keep up the good work!</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, Your attendance for ${data.courseTitle} on ${data.date} has been marked as ${data.status}.`
  }),

  course_enrollment: (data) => ({
    subject: `Course Enrollment Confirmed - ${data.courseTitle}`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>You have been successfully enrolled in:</p>
      <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Course:</strong> ${data.courseTitle}</p>
        <p><strong>Instructor:</strong> ${data.instructorName}</p>
        <p><strong>Start Date:</strong> ${data.startDate}</p>
      </div>
      <p>You can access the course materials from your dashboard.</p>
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, You have been enrolled in ${data.courseTitle} starting ${data.startDate}.`
  }),

  general_announcement: (data) => ({
    subject: `Important Announcement`,
    html: `
      <h2>Hello ${data.studentName},</h2>
      <p>${data.message}</p>
      ${data.actionUrl ? `<p><a href="${data.actionUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Learn More</a></p>` : ''}
      <p>Best regards,<br>The Internship Team</p>
    `,
    text: `Hello ${data.studentName}, ${data.message}`
  })
}

// SMS templates
const smsTemplates: Record<NotificationType, (data: Record<string, any>) => SMSTemplate> = {
  application_received: (data) => ({
    message: `Hi ${data.studentName}, your application for ${data.internshipTitle} was received. We'll update you soon.`
  }),

  application_approved: (data) => ({
    message: `Congrats ${data.studentName}! Your application for ${data.internshipTitle} was approved. Check your dashboard for next steps.`
  }),

  application_rejected: (data) => ({
    message: `Hi ${data.studentName}, your application for ${data.internshipTitle} was not selected this time. Keep applying!`
  }),

  offer_letter_sent: (data) => ({
    message: `Congrats ${data.studentName}! Offer letter for ${data.internshipTitle} sent to your email. Check it out.`
  }),

  certificate_generated: (data) => ({
    message: `Great job ${data.studentName}! Your completion certificate for ${data.internshipTitle} is ready. Check your email.`
  }),

  meeting_scheduled: (data) => ({
    message: `Hi ${data.studentName}, meeting "${data.meetingTitle}" scheduled for ${data.meetingDate} at ${data.meetingTime}.`
  }),

  meeting_reminder: (data) => ({
    message: `Reminder: Your meeting "${data.meetingTitle}" is in ${data.timeUntil}.`
  }),

  assignment_due: (data) => ({
    message: `Hi ${data.studentName}, assignment "${data.assignmentTitle}" is due in ${data.timeRemaining}. Submit soon!`
  }),

  assignment_submitted: (data) => ({
    message: `Thanks ${data.studentName}! Your assignment "${data.assignmentTitle}" was submitted successfully.`
  }),

  attendance_marked: (data) => ({
    message: `Your attendance for ${data.courseTitle} was marked as ${data.status}.`
  }),

  course_enrollment: (data) => ({
    message: `Welcome to ${data.courseTitle}! Course materials available in your dashboard.`
  }),

  general_announcement: (data) => ({
    message: `Hi ${data.studentName}, ${data.message}`
  })
}

export class NotificationService {
  private static instance: NotificationService

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  async sendEmail(data: NotificationData): Promise<void> {
    try {
      const template = emailTemplates[data.type](data.data)
      
      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@internship-portal.com',
        to: data.recipient.email,
        subject: template.subject,
        text: template.text || template.html.replace(/<[^>]*>/g, ''),
        html: template.html,
      }

      await emailTransporter.sendMail(mailOptions)
      console.log(`Email sent to ${data.recipient.email} for ${data.type}`)
    } catch (error) {
      console.error(`Failed to send email to ${data.recipient.email}:`, error)
      throw new Error(`Email notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendSMS(data: NotificationData): Promise<void> {
    if (!twilioClient || !data.recipient.phone) {
      console.log('SMS not configured or no phone number provided')
      return
    }

    try {
      const template = smsTemplates[data.type](data.data)
      
      await twilioClient.messages.create({
        body: template.message,
        from: process.env.SMS_FROM,
        to: data.recipient.phone,
      })
      
      console.log(`SMS sent to ${data.recipient.phone} for ${data.type}`)
    } catch (error) {
      console.error(`Failed to send SMS to ${data.recipient.phone}:`, error)
      throw new Error(`SMS notification failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async sendNotification(data: NotificationData): Promise<void> {
    const promises: Promise<void>[] = []

    // Always send email
    promises.push(this.sendEmail(data))

    // Send SMS if phone number is provided and priority is medium or high
    if (data.recipient.phone && (data.priority === 'medium' || data.priority === 'high')) {
      promises.push(this.sendSMS(data))
    }

    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Notification sending failed:', error)
      throw error
    }
  }

  async sendBulkNotifications(notifications: NotificationData[]): Promise<void> {
    const promises = notifications.map(notification => this.sendNotification(notification))
    
    try {
      await Promise.allSettled(promises)
    } catch (error) {
      console.error('Bulk notification sending failed:', error)
      throw error
    }
  }

  // Helper methods for common notification scenarios
  async notifyApplicationReceived(studentEmail: string, studentName: string, internshipTitle: string): Promise<void> {
    await this.sendNotification({
      type: 'application_received',
      recipient: {
        email: studentEmail,
        name: studentName,
      },
      data: {
        studentName,
        internshipTitle,
      },
      priority: 'medium',
    })
  }

  async notifyApplicationApproved(studentEmail: string, studentName: string, internshipTitle: string): Promise<void> {
    await this.sendNotification({
      type: 'application_approved',
      recipient: {
        email: studentEmail,
        name: studentName,
      },
      data: {
        studentName,
        internshipTitle,
      },
      priority: 'high',
    })
  }

  async notifyApplicationRejected(studentEmail: string, studentName: string, internshipTitle: string): Promise<void> {
    await this.sendNotification({
      type: 'application_rejected',
      recipient: {
        email: studentEmail,
        name: studentName,
      },
      data: {
        studentName,
        internshipTitle,
      },
      priority: 'medium',
    })
  }

  async notifyOfferLetterSent(studentEmail: string, studentName: string, internshipTitle: string, deadline: string): Promise<void> {
    await this.sendNotification({
      type: 'offer_letter_sent',
      recipient: {
        email: studentEmail,
        name: studentName,
      },
      data: {
        studentName,
        internshipTitle,
        deadline,
      },
      priority: 'high',
    })
  }

  async notifyCertificateGenerated(studentEmail: string, studentName: string, internshipTitle: string, certificateId: string): Promise<void> {
    await this.sendNotification({
      type: 'certificate_generated',
      recipient: {
        email: studentEmail,
        name: studentName,
      },
      data: {
        studentName,
        internshipTitle,
        certificateId,
      },
      priority: 'high',
    })
  }

  async sendOfferLetterNotification(params: {
    studentEmail: string
    studentName: string
    internshipTitle: string
    companyName: string
    documentUrl: string
    verificationCode: string
  }): Promise<void> {
    await this.sendNotification({
      type: 'offer_letter_sent',
      recipient: {
        email: params.studentEmail,
        name: params.studentName,
      },
      data: {
        studentName: params.studentName,
        internshipTitle: params.internshipTitle,
        companyName: params.companyName,
        documentUrl: params.documentUrl,
        verificationCode: params.verificationCode,
      },
      priority: 'high',
    })
  }

  async sendCertificateNotification(params: {
    studentName: string
    studentEmail: string
    internshipTitle: string
    companyName: string
    documentUrl: string
    verificationCode: string
  }): Promise<void> {
    await this.sendNotification({
      type: 'certificate_generated',
      recipient: {
        email: params.studentEmail,
        name: params.studentName,
      },
      data: {
        studentName: params.studentName,
        internshipTitle: params.internshipTitle,
        companyName: params.companyName,
        documentUrl: params.documentUrl,
        verificationCode: params.verificationCode,
      },
      priority: 'high',
    })
  }
}

export const notificationService = NotificationService.getInstance()