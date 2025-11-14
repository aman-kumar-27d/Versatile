import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Users, Briefcase, Calendar, Download, Filter, BarChart3, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface DashboardStats {
  total_students: number;
  total_internships: number;
  active_applications: number;
  completed_internships: number;
  average_attendance_rate: number;
  total_companies: number;
}

interface InternshipApplicationStats {
  month: string;
  applications: number;
  approved: number;
  rejected: number;
  pending: number;
}

interface AttendanceTrend {
  date: string;
  present: number;
  absent: number;
  late: number;
}

interface StudentPerformance {
  student_name: string;
  attendance_rate: number;
  completed_assignments: number;
  total_assignments: number;
  performance_score: number;
}

interface CompanyStats {
  company_name: string;
  total_internships: number;
  total_applications: number;
  average_rating: number;
}

interface ReportFilters {
  startDate: string;
  endDate: string;
  internshipId: string;
  studentId: string;
  companyId: string;
}

export default function ReportingAnalytics() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [applicationStats, setApplicationStats] = useState<InternshipApplicationStats[]>([]);
  const [attendanceTrend, setAttendanceTrend] = useState<AttendanceTrend[]>([]);
  const [studentPerformance, setStudentPerformance] = useState<StudentPerformance[]>([]);
  const [companyStats, setCompanyStats] = useState<CompanyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    endDate: new Date().toISOString().split('T')[0],
    internshipId: '',
    studentId: '',
    companyId: ''
  });
  const [chartType, setChartType] = useState<'bar' | 'line' | 'pie'>('bar');

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

  useEffect(() => {
    fetchDashboardStats();
    fetchApplicationStats();
    fetchAttendanceTrend();
    fetchStudentPerformance();
    fetchCompanyStats();
  }, [filters]);

  const fetchDashboardStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/analytics/dashboard?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch dashboard stats');
      }

      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch dashboard stats');
    }
  };

  const fetchApplicationStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/analytics/applications?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch application stats');
      }

      setApplicationStats(data.stats);
    } catch (err) {
      console.error('Failed to fetch application stats:', err);
    }
  };

  const fetchAttendanceTrend = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/analytics/attendance-trend?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance trend');
      }

      setAttendanceTrend(data.trend);
    } catch (err) {
      console.error('Failed to fetch attendance trend:', err);
    }
  };

  const fetchStudentPerformance = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/analytics/student-performance?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch student performance');
      }

      setStudentPerformance(data.performance);
    } catch (err) {
      console.error('Failed to fetch student performance:', err);
    }
  };

  const fetchCompanyStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/analytics/companies?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch company stats');
      }

      setCompanyStats(data.companies);
    } catch (err) {
      console.error('Failed to fetch company stats:', err);
    }
  };

  const exportReport = async (reportType: string) => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append('type', reportType);

      const response = await fetch(`/api/analytics/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export report');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export report');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat().format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reporting & Analytics</h1>
        <p className="text-gray-600">Comprehensive insights into internship program performance</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {user?.role === 'admin' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Internship</label>
                <input
                  type="text"
                  placeholder="Internship ID"
                  value={filters.internshipId}
                  onChange={(e) => setFilters(prev => ({ ...prev, internshipId: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
                <input
                  type="text"
                  placeholder="Student ID"
                  value={filters.studentId}
                  onChange={(e) => setFilters(prev => ({ ...prev, studentId: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Company</label>
                <input
                  type="text"
                  placeholder="Company ID"
                  value={filters.companyId}
                  onChange={(e) => setFilters(prev => ({ ...prev, companyId: e.target.value }))}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4 text-gray-500" />
              <select
                value={chartType}
                onChange={(e) => setChartType(e.target.value as 'bar' | 'line' | 'pie')}
                className="block border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="bar">Bar Chart</option>
                <option value="line">Line Chart</option>
                <option value="pie">Pie Chart</option>
              </select>
            </div>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => exportReport('dashboard')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Dashboard
            </button>
            <button
              onClick={() => exportReport('applications')}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Applications
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Students</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.total_students)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Internships</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.total_internships)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Active Applications</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.active_applications)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.completed_internships)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Avg Attendance</p>
                <p className="text-2xl font-semibold text-gray-900">{formatPercentage(stats.average_attendance_rate)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Companies</p>
                <p className="text-2xl font-semibold text-gray-900">{formatNumber(stats.total_companies)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Application Statistics */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Application Statistics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' && (
                <BarChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="applications" fill="#3B82F6" name="Total Applications" />
                  <Bar dataKey="approved" fill="#10B981" name="Approved" />
                  <Bar dataKey="rejected" fill="#EF4444" name="Rejected" />
                  <Bar dataKey="pending" fill="#F59E0B" name="Pending" />
                </BarChart>
              )}
              {chartType === 'line' && (
                <LineChart data={applicationStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="applications" stroke="#3B82F6" name="Total Applications" />
                  <Line type="monotone" dataKey="approved" stroke="#10B981" name="Approved" />
                  <Line type="monotone" dataKey="rejected" stroke="#EF4444" name="Rejected" />
                  <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Attendance Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Trend</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="present" stroke="#10B981" name="Present" />
                <Line type="monotone" dataKey="absent" stroke="#EF4444" name="Absent" />
                <Line type="monotone" dataKey="late" stroke="#F59E0B" name="Late" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Student Performance */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Top Performing Students</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Students with highest performance scores</p>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {studentPerformance.slice(0, 10).map((student, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">{index + 1}</span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{student.student_name}</p>
                        <p className="text-sm text-gray-500">
                          {student.completed_assignments}/{student.total_assignments} assignments
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{formatPercentage(student.attendance_rate)}</p>
                      <p className="text-sm text-gray-500">attendance</p>
                    </div>
                  </div>
                  <div className="mt-2">
                    <div className="flex items-center">
                      <div className="flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${student.performance_score}%` }}
                          ></div>
                        </div>
                      </div>
                      <span className="ml-3 text-sm font-medium text-gray-700">
                        {student.performance_score.toFixed(0)}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Company Statistics */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Company Statistics</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Top companies by internships and applications</p>
          </div>
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {companyStats.slice(0, 10).map((company, index) => (
                <li key={index} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <Building className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{company.company_name}</p>
                        <p className="text-sm text-gray-500">
                          {company.total_internships} internships, {company.total_applications} applications
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{company.average_rating.toFixed(1)}</p>
                      <p className="text-sm text-gray-500">avg rating</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}