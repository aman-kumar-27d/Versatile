import React, { useState, useEffect } from 'react';
import { Upload, Download, FileText, Image, FileSpreadsheet, FileArchive, Trash2, Eye, Share2, Folder, Plus, Search, Filter, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Document {
  id: string;
  title: string;
  description?: string;
  type: 'application' | 'assignment' | 'certificate' | 'offer_letter' | 'other';
  file_size: number;
  file_url: string;
  mime_type: string;
  created_at: string;
  internship_id?: string;
  course_id?: string;
}

const documentTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'application', label: 'Application' },
  { value: 'assignment', label: 'Assignment' },
  { value: 'certificate', label: 'Certificate' },
  { value: 'offer_letter', label: 'Offer Letter' },
  { value: 'other', label: 'Other' },
];

export default function Documents() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadingFile, setUploadingFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadType, setUploadType] = useState<Document['type']>('other');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    let filtered = documents;

    if (searchTerm) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedType !== 'all') {
      filtered = filtered.filter(doc => doc.type === selectedType);
    }

    setFilteredDocuments(filtered);
  }, [searchTerm, selectedType, documents]);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/documents', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await response.json();
      setDocuments(data.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    } else if (mimeType.includes('image')) {
      return <Image className="w-5 h-5 text-green-500" />;
    } else if (mimeType.includes('sheet')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-600" />;
    } else if (mimeType.includes('zip') || mimeType.includes('rar')) {
      return <FileArchive className="w-5 h-5 text-purple-500" />;
    } else if (mimeType.includes('word') || mimeType.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    } else {
      return <FileText className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadingFile(file);
      setUploadTitle(file.name);
    }
  };

  const handleUpload = async () => {
    if (!uploadingFile || !uploadTitle) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', uploadingFile);
    formData.append('title', uploadTitle);
    formData.append('description', uploadDescription);
    formData.append('type', uploadType);

    try {
      const response = await fetch('/api/documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setDocuments(prev => [data.data, ...prev]);
      resetUploadModal();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const resetUploadModal = () => {
    setShowUploadModal(false);
    setUploadingFile(null);
    setUploadTitle('');
    setUploadDescription('');
    setUploadType('other');
  };

  const handleDownload = async (document: Document) => {
    try {
      const response = await fetch(`/api/documents/${document.id}/download`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Download failed');
      }

      const data = await response.json();
      window.open(data.data.url, '_blank');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleDelete = async (documentId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      const response = await fetch(`/api/documents/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      console.error('Delete error:', error);
      alert('Delete failed. Please try again.');
    }
  };

  const handleShare = async (documentId: string) => {
    try {
      const response = await fetch(`/api/documents/${documentId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ expiresIn: 86400 }), // 24 hours
      });

      if (!response.ok) {
        throw new Error('Share failed');
      }

      const data = await response.json();
      navigator.clipboard.writeText(data.data.shareUrl);
      alert('Share link copied to clipboard!');
    } catch (error) {
      console.error('Share error:', error);
      alert('Share failed. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-gray-600">Manage and share your course documents</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Document
            </button>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDocuments.map((document) => (
            <div key={document.id} className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    {getFileIcon(document.mime_type)}
                    <div className="ml-3">
                      <h3 className="font-medium text-gray-900 truncate">{document.title}</h3>
                      <p className="text-sm text-gray-500">{formatFileSize(document.file_size)}</p>
                    </div>
                  </div>
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                    {document.type.replace('_', ' ')}
                  </span>
                </div>

                {document.description && (
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{document.description}</p>
                )}

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="mr-2">Uploaded:</span>
                    <span className="font-medium">{new Date(document.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleDownload(document)}
                    className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center text-sm"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </button>
                  <button
                    onClick={() => handleShare(document.id)}
                    className="px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(document.id)}
                    className="px-3 py-2 border border-red-300 text-red-600 rounded-md hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No documents found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedType !== 'all'
                ? 'Try adjusting your search criteria'
                : 'No documents uploaded yet'
              }
            </p>
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Upload Document</h3>
              <button
                onClick={resetUploadModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Enter document description (optional)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Document Type
                </label>
                <select
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value as Document['type'])}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {documentTypes.slice(1).map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select File *
                </label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif,.zip,.rar"
                />
              </div>

              {uploadingFile && (
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    <strong>Selected:</strong> {uploadingFile.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Size: {formatFileSize(uploadingFile.size)}
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleUpload}
                disabled={!uploadingFile || !uploadTitle || isUploading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  'Upload'
                )}
              </button>
              <button
                onClick={resetUploadModal}
                disabled={isUploading}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}