import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../../supabase/config';
import { Internship, Application } from '../../supabase/config';
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, Users, FileText, CheckCircle, XCircle, Clock3 } from 'lucide-react';

const InternshipDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [internship, setInternship] = useState<Internship | null>(null);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/login');
      return;
    }
    if (id) {
      fetchInternshipDetails();
      fetchApplications();
    } 
  }, [user, navigate, id]);

  const fetchInternshipDetails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('internships')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setInternship(data);
    } catch (error) {
      console.error('Error fetching internship details:', error);
      navigate('/admin/internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchApplications = async () => {
    try {
      const response = await fetch(`/api/internships/${id}/applications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const updateApplicationStatus = async (applicationId: string, status: 'approved' | 'rejected') => {
    try {
      setUpdatingStatus(applicationId);
      
      const response = await fetch(`/api/internships/${id}/applications/${applicationId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        throw new Error('Failed to update application status');
      }

      // Refresh applications
      await fetchApplications();
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Failed to update application status');
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status as keyof typeof statusColors]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeColors = {
      'full-time': 'bg-blue-100 text-blue-800',
      'part-time': 'bg-yellow-100 text-yellow-800',
      'remote': 'bg-purple-100 text-purple-800',
      'hybrid': 'bg-indigo-100 text-indigo-800'
    };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeColors[type as keyof typeof typeColors]}`}>
        {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
      </span>
    );
  };

  const handleBack = () => {
    navigate('/admin/internships');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Internship not found</h2>
          <button
            onClick={handleBack}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            Go back to internships
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Internship Details</h1>
            </div>
            <button
              onClick={() => navigate(`/admin/internships/${internship.id}/edit`)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Internship
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Internship Details */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  <h2 className="text-xl font-semibold text-gray-900">{internship.title}</h2>
                  {getTypeBadge(internship.type)}
                  {internship.is_active ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                  <p className="text-gray-600 whitespace-pre-wrap">{internship.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Requirements</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{internship.requirements}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Responsibilities</h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{internship.responsibilities}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Skills Required</h3>
                  <p className="text-gray-600">{internship.skills_required}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Key Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Application Deadline: {new Date(internship.application_deadline).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Start Date: {new Date(internship.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Duration: {internship.duration}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Location: {internship.location}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <DollarSign className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Stipend: ₹{internship.stipend}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Application Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Total Applications: {applications.length}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock3 className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Pending: {applications.filter(a => a.status === 'pending').length}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Approved: {applications.filter(a => a.status === 'approved').length}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <XCircle className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Rejected: {applications.filter(a => a.status === 'rejected').length}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Max Applicants: {internship.max_applicants}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Applications Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Applications</h3>
                <p className="text-sm text-gray-600 mt-1">{applications.length} total applications</p>
              </div>

              <div className="divide-y divide-gray-200 max-h-96 overflow-y-auto">
                {applications.length === 0 ? (
                  <div className="px-6 py-8 text-center text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>No applications yet</p>
                    <p className="text-sm">Students will be able to apply once the internship is published</p>
                  </div>
                ) : (
                  applications.map((application) => (
                    <div key={application.id} className="px-6 py-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {application.student_name}
                          </h4>
                          <p className="text-xs text-gray-500">{application.student_email}</p>
                        </div>
                        {getStatusBadge(application.status)}
                      </div>

                      <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                        {application.cover_letter}
                      </p>

                      <div className="text-xs text-gray-500 mb-3">
                        <p>Applied: {new Date(application.created_at).toLocaleDateString()}</p>
                        {application.resume_url && (
                          <a
                            href={application.resume_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            View Resume
                          </a>
                        )}
                      </div>

                      {application.status === 'pending' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'approved')}
                            disabled={updatingStatus === application.id}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === application.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                            ) : (
                              <>
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => updateApplicationStatus(application.id, 'rejected')}
                            disabled={updatingStatus === application.id}
                            className="flex-1 inline-flex items-center justify-center px-3 py-1 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {updatingStatus === application.id ? (
                              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600"></div>
                            ) : (
                              <>
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipDetail;