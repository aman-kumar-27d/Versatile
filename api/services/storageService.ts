import { supabaseAdmin } from '../supabase/server.js'
import { v4 as uuidv4 } from 'uuid'
import path from 'path'

export interface FileUploadOptions {
  bucket: string
  folder?: string
  allowedTypes?: string[]
  maxSize?: number // in bytes
}

export interface FileUploadResult {
  url: string
  key: string
  size: number
  mimeType: string
}

export interface FileDownloadResult {
  url: string
  expiresAt: Date
}

const DEFAULT_MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'image/jpeg',
  'image/png',
  'image/gif'
]

export class StorageService {
  private static instance: StorageService

  static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService()
    }
    return StorageService.instance
  }

  async uploadFile(
    file: Express.Multer.File,
    options: FileUploadOptions
  ): Promise<FileUploadResult> {
    const { bucket, folder = '', allowedTypes = ALLOWED_DOCUMENT_TYPES, maxSize = DEFAULT_MAX_SIZE } = options

    // Validate file type
    if (!allowedTypes.includes(file.mimetype)) {
      throw new Error(`Invalid file type. Allowed types: ${allowedTypes.join(', ')}`)
    }

    // Validate file size
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`)
    }

    // Generate unique filename
    const fileExt = path.extname(file.originalname)
    const fileName = `${folder ? folder + '/' : ''}${uuidv4()}${fileExt}`

    try {
      // Upload to Supabase Storage
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false
        })

      if (error) {
        throw new Error(`Upload failed: ${error.message}`)
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(data.path)

      return {
        url: publicUrl,
        key: data.path,
        size: file.size,
        mimeType: file.mimetype
      }
    } catch (error) {
      throw new Error(`Storage upload error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async getSignedUrl(bucket: string, key: string, expiresIn = 3600): Promise<FileDownloadResult> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(key, expiresIn)

      if (error) {
        throw new Error(`Signed URL creation failed: ${error.message}`)
      }

      return {
        url: data.signedUrl,
        expiresAt: new Date(Date.now() + expiresIn * 1000)
      }
    } catch (error) {
      throw new Error(`Storage signed URL error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async deleteFile(bucket: string, key: string): Promise<void> {
    try {
      const { error } = await supabaseAdmin.storage
        .from(bucket)
        .remove([key])

      if (error) {
        throw new Error(`Delete failed: ${error.message}`)
      }
    } catch (error) {
      throw new Error(`Storage delete error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async listFiles(bucket: string, prefix = '', limit = 100): Promise<any[]> {
    try {
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .list(prefix, {
          limit,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' }
        })

      if (error) {
        throw new Error(`List failed: ${error.message}`)
      }

      return data || []
    } catch (error) {
      throw new Error(`Storage list error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const storageService = StorageService.getInstance()