import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../hooks/useAuth';
import { ArrowLeft, Save, Calendar, MapPin, DollarSign, Clock, FileText } from 'lucide-react';

const internshipSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title must be less than 100 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters').max(1000, 'Description must be less than 1000 characters'),
  type: z.enum(['full-time', 'part-time', 'remote', 'hybrid']),
  duration: z.string().min(1, 'Duration is required'),
  location: z.string().min(2, 'Location is required').max(100, 'Location must be less than 100 characters'),
  stipend: z.number().min(0, 'Stipend must be a positive number'),
  application_deadline: z.string().min(1, 'Application deadline is required'),
  start_date: z.string().min(1, 'Start date is required'),
  requirements: z.string().min(50, 'Requirements must be at least 50 characters').max(1000, 'Requirements must be less than 1000 characters'),
  responsibilities: z.string().min(50, 'Responsibilities must be at least 50 characters').max(1000, 'Responsibilities must be less than 1000 characters'),
  skills_required: z.string().min(10, 'Skills required must be at least 10 characters').max(500, 'Skills required must be less than 500 characters'),
  max_applicants: z.number().min(1, 'Maximum applicants must be at least 1').max(1000, 'Maximum applicants must be less than 1000'),
  is_active: z.boolean().default(true)
});

type InternshipFormData = z.infer<typeof internshipSchema>;

const CreateInternship: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<InternshipFormData>({
    resolver: zodResolver(internshipSchema),
    defaultValues: {
      type: 'full-time',
      is_active: true,
      stipend: 0,
      max_applicants: 50
    }
  });

  const onSubmit = async (data: InternshipFormData) => {
    try {
      setIsSubmitting(true);
      setSubmitError('');

      const response = await fetch('/api/internships', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create internship');
      }

      navigate('/admin/dashboard');
    } catch (error) {
      console.error('Error creating internship:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create internship');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <button
                onClick={handleBack}
                className="mr-4 p-2 text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create Internship</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
              <p className="text-sm text-gray-600 mt-1">Provide the basic details about the internship</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Internship Title *
                </label>
                <input
                  type="text"
                  id="title"
                  {...register('title')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., Software Development Intern"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <textarea
                  id="description"
                  rows={4}
                  {...register('description')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe the internship opportunity, company culture, learning opportunities..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                    Internship Type *
                  </label>
                  <select
                    id="type"
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
                    Duration *
                  </label>
                  <input
                    type="text"
                    id="duration"
                    {...register('duration')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    placeholder="e.g., 3 months, 6 months"
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="location"
                      {...register('location')}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="e.g., Mumbai, Remote"
                    />
                  </div>
                  {errors.location && (
                    <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="stipend" className="block text-sm font-medium text-gray-700">
                    Stipend (₹) *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      id="stipend"
                      {...register('stipend', { valueAsNumber: true })}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      placeholder="0"
                    />
                  </div>
                  {errors.stipend && (
                    <p className="mt-1 text-sm text-red-600">{errors.stipend.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
              <p className="text-sm text-gray-600 mt-1">Set important dates for the internship</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="application_deadline" className="block text-sm font-medium text-gray-700">
                    Application Deadline *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="application_deadline"
                      {...register('application_deadline')}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {errors.application_deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.application_deadline.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                    Start Date *
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="start_date"
                      {...register('start_date')}
                      className="block w-full pl-10 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  </div>
                  {errors.start_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.start_date.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Requirements & Responsibilities */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Requirements & Responsibilities</h2>
              <p className="text-sm text-gray-600 mt-1">Define what you're looking for in candidates</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700">
                  Requirements *
                </label>
                <textarea
                  id="requirements"
                  rows={4}
                  {...register('requirements')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="List the educational qualifications, experience, and other requirements..."
                />
                {errors.requirements && (
                  <p className="mt-1 text-sm text-red-600">{errors.requirements.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="responsibilities" className="block text-sm font-medium text-gray-700">
                  Responsibilities *
                </label>
                <textarea
                  id="responsibilities"
                  rows={4}
                  {...register('responsibilities')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Describe the main tasks and responsibilities of the intern..."
                />
                {errors.responsibilities && (
                  <p className="mt-1 text-sm text-red-600">{errors.responsibilities.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="skills_required" className="block text-sm font-medium text-gray-700">
                  Skills Required *
                </label>
                <textarea
                  id="skills_required"
                  rows={3}
                  {...register('skills_required')}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="e.g., JavaScript, React, Python, Communication Skills..."
                />
                {errors.skills_required && (
                  <p className="mt-1 text-sm text-red-600">{errors.skills_required.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Application Settings */}
          <div className="bg-white shadow-sm rounded-lg border">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Application Settings</h2>
              <p className="text-sm text-gray-600 mt-1">Configure application limits and visibility</p>
            </div>
            
            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="max_applicants" className="block text-sm font-medium text-gray-700">
                    Maximum Applicants *
                  </label>
                  <input
                    type="number"
                    id="max_applicants"
                    {...register('max_applicants', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    min="1"
                    max="1000"
                  />
                  {errors.max_applicants && (
                    <p className="mt-1 text-sm text-red-600">{errors.max_applicants.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register('is_active')}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    Make internship active immediately
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {submitError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-600">{submitError}</p>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Internship
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateInternship;