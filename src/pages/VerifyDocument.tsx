import React, { useState } from 'react';
import { Search, CheckCircle, XCircle, FileText, Download, Calendar, User, Building } from 'lucide-react';

interface VerificationResult {
  success: boolean;
  document?: {
    id: string;
    type: 'offer_letter' | 'completion_certificate';
    student_id: string;
    internship_id: string;
    created_at: string;
    expires_at?: string;
    document_url: string;
  };
  error?: string;
}

export default function VerifyDocument() {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!verificationCode.trim() || verificationCode.length !== 16) {
      setVerificationResult({
        success: false,
        error: 'Please enter a valid 16-character verification code.'
      });
      return;
    }

    setIsVerifying(true);
    
    try {
      const response = await fetch(`/api/document-generation/verify/${verificationCode}`);
      const result = await response.json();
      
      if (response.ok && result.verified) {
        setVerificationResult({
          success: true,
          document: result.document
        });
      } else {
        setVerificationResult({
          success: false,
          error: result.error || 'Document verification failed.'
        });
      }
    } catch (error) {
      setVerificationResult({
        success: false,
        error: 'Failed to verify document. Please try again.'
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'offer_letter':
        return 'Offer Letter';
      case 'completion_certificate':
        return 'Completion Certificate';
      default:
        return 'Document';
    }
  };

  const handleDownload = () => {
    if (verificationResult?.document?.document_url) {
      window.open(verificationResult.document.document_url, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Document Verification Portal
          </h1>
          <p className="text-gray-600">
            Verify the authenticity of internship documents using the verification code provided.
          </p>
        </div>

        <div className="bg-white shadow-lg rounded-lg p-6 mb-8">
          <form onSubmit={handleVerification} className="space-y-4">
            <div>
              <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                Verification Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="verificationCode"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.toUpperCase())}
                  placeholder="Enter 16-character verification code"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center font-mono text-lg tracking-wider"
                  maxLength={16}
                  disabled={isVerifying}
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                The verification code is found on the document you received.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !verificationCode.trim()}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Verifying...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Verify Document
                </>
              )}
            </button>
          </form>
        </div>

        {verificationResult && (
          <div className={`bg-white shadow-lg rounded-lg p-6 border-l-4 ${
            verificationResult.success ? 'border-green-500' : 'border-red-500'
          }`}>
            {verificationResult.success ? (
              <div className="space-y-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <h3 className="text-lg font-semibold text-green-800">
                      Document Verified Successfully
                    </h3>
                    <p className="text-green-600">
                      This document is authentic and issued by our organization.
                    </p>
                  </div>
                </div>

                {verificationResult.document && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">Document Type:</span>
                      <span className="ml-2 text-gray-700">
                        {getDocumentTypeLabel(verificationResult.document.type)}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">Issued To:</span>
                      <span className="ml-2 text-gray-700">
                        {verificationResult.document.student_id}
                      </span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="font-medium">Issue Date:</span>
                      <span className="ml-2 text-gray-700">
                        {formatDate(verificationResult.document.created_at)}
                      </span>
                    </div>

                    {verificationResult.document.expires_at && (
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                        <span className="font-medium">Expires:</span>
                        <span className="ml-2 text-gray-700">
                          {formatDate(verificationResult.document.expires_at)}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-gray-200">
                      <button
                        onClick={handleDownload}
                        className="flex items-center justify-center w-full py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center">
                <XCircle className="h-8 w-8 text-red-500 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold text-red-800">
                    Verification Failed
                  </h3>
                  <p className="text-red-600">
                    {verificationResult.error || 'This document could not be verified.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 mb-2">
            How to find your verification code:
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Look for a 16-character code on your document</li>
            <li>• The code is usually located in the verification section</li>
            <li>• Enter the code exactly as shown (case-insensitive)</li>
            <li>• Contact support if you cannot locate your verification code</li>
          </ul>
        </div>
      </div>
    </div>
  );
}