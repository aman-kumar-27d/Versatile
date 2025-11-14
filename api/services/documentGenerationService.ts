import { createClient } from '@supabase/supabase-js';
// @ts-ignore
import * as QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../../supabase/server.ts';

export interface DocumentTemplate {
  id: string;
  name: string;
  type: 'offer_letter' | 'completion_certificate';
  template: string;
  variables: string[];
  created_at: Date;
  updated_at: Date;
}

export interface GeneratedDocument {
  id: string;
  type: 'offer_letter' | 'completion_certificate';
  student_id: string;
  internship_id: string;
  verification_code: string;
  document_url: string;
  metadata: Record<string, any>;
  created_at: Date;
  expires_at?: Date;
}

export interface OfferLetterData {
  student_name: string;
  student_email: string;
  internship_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  stipend: string;
  location: string;
  supervisor_name: string;
  internship_id: string;
}

export interface CertificateData {
  student_name: string;
  internship_title: string;
  company_name: string;
  start_date: string;
  end_date: string;
  completion_date: string;
  performance_grade: string;
  skills_learned: string[];
  internship_id: string;
}

class DocumentGenerationService {
  private static instance: DocumentGenerationService;

  private constructor() {}

  static getInstance(): DocumentGenerationService {
    if (!DocumentGenerationService.instance) {
      DocumentGenerationService.instance = new DocumentGenerationService();
    }
    return DocumentGenerationService.instance;
  }

  generateVerificationCode(): string {
    return uuidv4().replace(/-/g, '').toUpperCase().substring(0, 16);
  }

  async generateOfferLetter(data: OfferLetterData): Promise<GeneratedDocument> {
    try {
      const verificationCode = this.generateVerificationCode();
      const template = this.getOfferLetterTemplate();
      
      const htmlContent = this.processTemplate(template, {
        ...data,
        verification_code: verificationCode,
        generated_date: new Date().toLocaleDateString(),
        company_logo: 'https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=COMPANY',
        qr_code_url: await this.generateQRCode(verificationCode)
      });

      const pdfBuffer = await this.generatePDF(htmlContent);
      const fileName = `offer_letter_${data.student_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload document: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const generatedDocument: GeneratedDocument = {
        id: uuidv4(),
        type: 'offer_letter',
        student_id: data.student_email,
        internship_id: data.internship_id,
        verification_code: verificationCode,
        document_url: publicUrl,
        metadata: data,
        created_at: new Date(),
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
      };

      await this.saveGeneratedDocument(generatedDocument);

      return generatedDocument;
    } catch (error) {
      console.error('Error generating offer letter:', error);
      throw error;
    }
  }

  async generateCompletionCertificate(data: CertificateData): Promise<GeneratedDocument> {
    try {
      const verificationCode = this.generateVerificationCode();
      const template = this.getCertificateTemplate();
      
      const htmlContent = this.processTemplate(template, {
        ...data,
        verification_code: verificationCode,
        certificate_date: new Date().toLocaleDateString(),
        company_logo: 'https://via.placeholder.com/200x80/4F46E5/FFFFFF?text=COMPANY',
        qr_code_url: await this.generateQRCode(verificationCode),
        skills_formatted: data.skills_learned.join(', ')
      });

      const pdfBuffer = await this.generatePDF(htmlContent);
      const fileName = `certificate_${data.student_name.replace(/\s+/g, '_')}_${Date.now()}.pdf`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, pdfBuffer, {
          contentType: 'application/pdf',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Failed to upload certificate: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      const generatedDocument: GeneratedDocument = {
        id: uuidv4(),
        type: 'completion_certificate',
        student_id: data.student_name,
        internship_id: data.internship_id,
        verification_code: verificationCode,
        document_url: publicUrl,
        metadata: data,
        created_at: new Date()
      };

      await this.saveGeneratedDocument(generatedDocument);

      return generatedDocument;
    } catch (error) {
      console.error('Error generating completion certificate:', error);
      throw error;
    }
  }

  private getOfferLetterTemplate(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Internship Offer Letter</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-width: 200px; margin-bottom: 20px; }
            .company-name { font-size: 24px; font-weight: bold; color: #4F46E5; }
            .letter-title { font-size: 20px; font-weight: bold; margin: 30px 0; text-align: center; }
            .content { margin-bottom: 20px; }
            .highlight { background-color: #f0f0ff; padding: 15px; border-left: 4px solid #4F46E5; margin: 20px 0; }
            .details-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .details-table th, .details-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            .details-table th { background-color: #f8f9ff; font-weight: bold; }
            .verification-section { background-color: #f8f9ff; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; }
            .verification-code { font-size: 18px; font-weight: bold; color: #4F46E5; letter-spacing: 2px; }
            .qr-code { margin: 20px auto; max-width: 150px; }
            .signature { margin-top: 50px; }
            .footer { margin-top: 50px; font-size: 12px; color: #666; text-align: center; }
        </style>
    </head>
    <body>
        <div class="header">
            <img src="{{company_logo}}" alt="Company Logo" class="logo">
            <div class="company-name">{{company_name}}</div>
        </div>
        
        <div class="letter-title">INTERNSHIP OFFER LETTER</div>
        
        <div class="content">
            <p><strong>Date:</strong> {{generated_date}}</p>
            <p><strong>To:</strong> {{student_name}}</p>
            <p><strong>Email:</strong> {{student_email}}</p>
        </div>
        
        <div class="content">
            <p>Dear {{student_name}},</p>
            
            <p>We are pleased to offer you an internship position with {{company_name}}. Congratulations on being selected for this exciting opportunity!</p>
            
            <div class="highlight">
                <strong>Internship Details:</strong>
            </div>
            
            <table class="details-table">
                <tr>
                    <th>Position</th>
                    <td>{{internship_title}}</td>
                </tr>
                <tr>
                    <th>Department/Team</th>
                    <td>{{department}}</td>
                </tr>
                <tr>
                    <th>Start Date</th>
                    <td>{{start_date}}</td>
                </tr>
                <tr>
                    <th>End Date</th>
                    <td>{{end_date}}</td>
                </tr>
                <tr>
                    <th>Stipend</th>
                    <td>{{stipend}}</td>
                </tr>
                <tr>
                    <th>Location</th>
                    <td>{{location}}</td>
                </tr>
                <tr>
                    <th>Reporting Manager</th>
                    <td>{{supervisor_name}}</td>
                </tr>
            </table>
            
            <p>During your internship, you will have the opportunity to work on challenging projects, gain hands-on experience, and contribute to our team's success. We believe this experience will be mutually beneficial and help you develop valuable skills for your future career.</p>
            
            <p>Please confirm your acceptance of this offer by replying to this email within 5 business days. Upon acceptance, you will receive further information about the onboarding process, required documentation, and your first-day schedule.</p>
            
            <p>We look forward to having you join our team and are excited about the contributions you will make during your internship.</p>
            
            <p>If you have any questions, please don't hesitate to reach out to your supervisor or the HR department.</p>
        </div>
        
        <div class="signature">
            <p>Sincerely,</p>
            <p><strong>{{supervisor_name}}</strong><br>
            {{supervisor_title}}<br>
            {{company_name}}</p>
        </div>
        
        <div class="verification-section">
            <h3>Document Verification</h3>
            <p>This document is authentic and can be verified using the code below:</p>
            <div class="verification-code">{{verification_code}}</div>
            <img src="{{qr_code_url}}" alt="Verification QR Code" class="qr-code">
            <p><small>Scan the QR code or visit our verification portal to authenticate this document.</small></p>
        </div>
        
        <div class="footer">
            <p>This is an electronically generated document. No physical signature required.</p>
            <p>Generated on {{generated_date}} | Document ID: {{document_id}}</p>
        </div>
    </body>
    </html>
    `;
  }

  private getCertificateTemplate(): string {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Internship Completion Certificate</title>
        <style>
            body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #fafafa; }
            .certificate { background-color: white; border: 3px solid #4F46E5; border-radius: 10px; padding: 40px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); }
            .header { text-align: center; margin-bottom: 30px; }
            .logo { max-width: 150px; margin-bottom: 20px; }
            .company-name { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
            .certificate-title { font-size: 32px; font-weight: bold; color: #D97706; margin: 30px 0; text-align: center; text-transform: uppercase; letter-spacing: 2px; }
            .recipient-name { font-size: 36px; font-weight: bold; color: #4F46E5; text-align: center; margin: 20px 0; text-transform: uppercase; }
            .certificate-content { font-size: 16px; line-height: 1.8; text-align: justify; margin: 30px 0; }
            .details-section { background-color: #f8f9ff; padding: 25px; border-radius: 8px; margin: 30px 0; border-left: 5px solid #4F46E5; }
            .details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px; }
            .detail-item { margin-bottom: 10px; }
            .detail-label { font-weight: bold; color: #4F46E5; }
            .skills-section { margin: 20px 0; }
            .skills-list { background-color: #f0f0ff; padding: 15px; border-radius: 5px; font-style: italic; }
            .performance-section { text-align: center; margin: 30px 0; padding: 20px; background-color: #fef3c7; border-radius: 8px; }
            .grade { font-size: 24px; font-weight: bold; color: #D97706; }
            .verification-section { background-color: #f0f0ff; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center; }
            .verification-code { font-size: 16px; font-weight: bold; color: #4F46E5; letter-spacing: 1px; }
            .qr-code { margin: 15px auto; max-width: 120px; }
            .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 50px; margin-top: 50px; }
            .signature-box { text-align: center; padding-top: 20px; border-top: 2px solid #4F46E5; }
            .signature-name { font-weight: bold; margin-top: 10px; }
            .signature-title { color: #666; font-size: 14px; }
            .certificate-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 20px; }
            .certificate-number { background-color: #4F46E5; color: white; padding: 5px 15px; border-radius: 20px; font-size: 12px; display: inline-block; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div class="certificate">
            <div class="header">
                <img src="{{company_logo}}" alt="Company Logo" class="logo">
                <div class="company-name">{{company_name}}</div>
            </div>
            
            <div class="certificate-title">Certificate of Internship Completion</div>
            
            <div class="certificate-content">
                <p>This is to certify that</p>
                <div class="recipient-name">{{student_name}}</div>
                <p>has successfully completed the internship program and has demonstrated exceptional dedication, professionalism, and competence throughout the internship period.</p>
            </div>
            
            <div class="details-section">
                <h3>Internship Details</h3>
                <div class="details-grid">
                    <div class="detail-item">
                        <span class="detail-label">Internship Title:</span><br>
                        {{internship_title}}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Internship Period:</span><br>
                        {{start_date}} to {{end_date}}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Completion Date:</span><br>
                        {{completion_date}}
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Duration:</span><br>
                        {{duration_months}} months
                    </div>
                </div>
            </div>
            
            <div class="skills-section">
                <h3>Skills and Knowledge Acquired</h3>
                <div class="skills-list">
                    {{skills_formatted}}
                </div>
            </div>
            
            <div class="performance-section">
                <h3>Overall Performance</h3>
                <div class="grade">{{performance_grade}}</div>
                <p>Excellent performance throughout the internship period</p>
            </div>
            
            <div class="verification-section">
                <h4>Certificate Verification</h4>
                <p>This certificate can be verified using the code:</p>
                <div class="verification-code">{{verification_code}}</div>
                <img src="{{qr_code_url}}" alt="Verification QR Code" class="qr-code">
                <p><small>Scan the QR code or visit our verification portal to authenticate this certificate.</small></p>
            </div>
            
            <div class="signatures">
                <div class="signature-box">
                    <div class="signature-name">{{hr_manager_name}}</div>
                    <div class="signature-title">HR Manager</div>
                </div>
                <div class="signature-box">
                    <div class="signature-name">{{supervisor_name}}</div>
                    <div class="signature-title">Internship Supervisor</div>
                </div>
            </div>
            
            <div class="certificate-footer">
                <div class="certificate-number">Certificate #: {{certificate_number}}</div>
                <p>Issued on {{certificate_date}} | This is an electronically generated certificate.</p>
                <p>© {{company_name}} - All rights reserved</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    let processed = template;
    
    // Add computed fields
    if (data.start_date && data.end_date) {
      const start = new Date(data.start_date);
      const end = new Date(data.end_date);
      const months = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24 * 30));
      data.duration_months = months;
    }
    
    if (data.performance_grade) {
      data.performance_grade = this.getPerformanceGradeText(data.performance_grade);
    }
    
    // Generate certificate number
    data.certificate_number = `CERT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    data.document_id = uuidv4();
    
    // Replace all template variables
    Object.keys(data).forEach(key => {
      const placeholder = new RegExp(`{{${key}}}`, 'g');
      processed = processed.replace(placeholder, data[key] || '');
    });
    
    return processed;
  }

  private getPerformanceGradeText(grade: string): string {
    const gradeMap: Record<string, string> = {
      'A': 'Outstanding',
      'B': 'Excellent',
      'C': 'Good',
      'D': 'Satisfactory'
    };
    return gradeMap[grade] || 'Excellent';
  }

  private async generateQRCode(text: string): Promise<string> {
    try {
      const qrCodeDataURL = await QRCode.toDataURL(text, {
        width: 200,
        margin: 2,
        color: {
          dark: '#4F46E5',
          light: '#FFFFFF'
        }
      });
      return qrCodeDataURL;
    } catch (error) {
      console.error('Error generating QR code:', error);
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
    }
  }

  private async generatePDF(htmlContent: string): Promise<Buffer> {
    // For now, we'll return the HTML as a buffer
    // In a production environment, you'd use a library like Puppeteer or PDFKit
    return Buffer.from(htmlContent, 'utf-8');
  }

  private async saveGeneratedDocument(document: GeneratedDocument): Promise<void> {
    try {
      const { error } = await supabase
        .from('generated_documents')
        .insert([{
          id: document.id,
          type: document.type,
          student_id: document.student_id,
          internship_id: document.internship_id,
          verification_code: document.verification_code,
          document_url: document.document_url,
          metadata: document.metadata,
          created_at: document.created_at,
          expires_at: document.expires_at
        }]);

      if (error) {
        throw new Error(`Failed to save generated document: ${error.message}`);
      }
    } catch (error) {
      console.error('Error saving generated document:', error);
      throw error;
    }
  }

  async verifyDocument(verificationCode: string): Promise<GeneratedDocument | null> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('verification_code', verificationCode)
        .single();

      if (error || !data) {
        return null;
      }

      // Check if document has expired
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        return null;
      }

      return data as GeneratedDocument;
    } catch (error) {
      console.error('Error verifying document:', error);
      return null;
    }
  }

  async getStudentDocuments(studentId: string): Promise<GeneratedDocument[]> {
    try {
      const { data, error } = await supabase
        .from('generated_documents')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Failed to fetch student documents: ${error.message}`);
      }

      return (data || []) as GeneratedDocument[];
    } catch (error) {
      console.error('Error fetching student documents:', error);
      return [];
    }
  }
}

export const documentGenerationService = DocumentGenerationService.getInstance();