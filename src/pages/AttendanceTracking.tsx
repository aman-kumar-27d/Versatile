import React, { useState, useEffect } from 'react';
import { Calendar, Clock, User, CheckCircle, XCircle, AlertCircle, Download, Filter, Search } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface AttendanceRecord {
  id: string;
  student_id: string;
  student_name: string;
  student_email: string;
  internship_id: string;
  internship_title: string;
  date: string;
  status: 'present' | 'absent' | 'late' | 'excused';
  check_in_time?: string;
  check_out_time?: string;
  hours_worked?: number;
  notes?: string;
  marked_by: string;
  created_at: string;
  updated_at: string;
}

interface AttendanceStats {
  total_days: number;
  present_days: number;
  absent_days: number;
  late_days: number;
  attendance_percentage: number;
  total_hours: number;
}

interface AttendanceFilters {
  startDate: string;
  endDate: string;
  status: string;
  internshipId: string;
  studentId: string;
}

export default function AttendanceTracking() {
  const { user } = useAuth();
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AttendanceFilters>({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0],
    status: '',
    internshipId: '',
    studentId: ''
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchAttendanceRecords();
    fetchAttendanceStats();
  }, [filters]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      if (searchTerm) queryParams.append('search', searchTerm);

      const response = await fetch(`/api/attendance?${queryParams}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance records');
      }

      setAttendanceRecords(data.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch attendance records');
    } finally {
      setLoading(false);
    }
  };

  const fetchAttendanceStats = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.studentId) queryParams.append('student_id', filters.studentId);
      if (filters.internshipId) queryParams.append('internship_id', filters.internshipId);
      if (filters.startDate) queryParams.append('start_date', filters.startDate);
      if (filters.endDate) queryParams.append('end_date', filters.endDate);

      const response = await fetch(`/api/attendance/stats?${queryParams}`);
      const data = await response.json();

      if (response.ok) {
        setAttendanceStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch attendance stats:', err);
    }
  };

  const markAttendance = async (studentId: string, status: AttendanceRecord['status'], notes?: string) => {
    try {
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: studentId,
          date: selectedDate,
          status,
          notes,
          internship_id: filters.internshipId
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to mark attendance');
      }

      // Refresh records
      fetchAttendanceRecords();
      fetchAttendanceStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to mark attendance');
    }
  };

  const updateAttendance = async (recordId: string, status: AttendanceRecord['status'], notes?: string) => {
    try {
      const response = await fetch(`/api/attendance/${recordId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status,
          notes
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update attendance');
      }

      // Refresh records
      fetchAttendanceRecords();
      fetchAttendanceStats();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update attendance');
    }
  };

  const exportAttendance = async () => {
    try {
      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const response = await fetch(`/api/attendance/export?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to export attendance data');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to export attendance data');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'late':
        return 'bg-yellow-100 text-yellow-800';
      case 'excused':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4" />;
      case 'absent':
        return <XCircle className="h-4 w-4" />;
      case 'late':
        return <Clock className="h-4 w-4" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Attendance Tracking</h1>
        <p className="text-gray-600">Monitor and manage student attendance for internships</p>
      </div>

      {/* Attendance Stats */}
      {attendanceStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Days</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceStats.total_days}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Present</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceStats.present_days}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <XCircle className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Absent</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceStats.absent_days}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Late</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceStats.late_days}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                  <span className="text-purple-600 font-bold">%</span>
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Attendance Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{attendanceStats.attendance_percentage.toFixed(1)}%</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="excused">Excused</option>
            </select>
          </div>

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

          <div className="flex items-end">
            <button
              onClick={exportAttendance}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </button>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search by student name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Records */}
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Attendance Records</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Showing {attendanceRecords.length} attendance records
          </p>
        </div>

        <ul className="divide-y divide-gray-200">
          {attendanceRecords.map((record) => (
            <li key={record.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${getStatusColor(record.status)}`}>
                      {getStatusIcon(record.status)}
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <p className="text-sm font-medium text-gray-900">{record.student_name}</p>
                      <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(record.status)}">
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-gray-500">
                      <p>{record.student_email}</p>
                      <p>{record.internship_title}</p>
                      <p>{formatDate(record.date)}</p>
                    </div>
                    {record.notes && (
                      <p className="mt-1 text-sm text-gray-600">Notes: {record.notes}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  {record.check_in_time && (
                    <div className="text-sm text-gray-500">
                      <p>Check-in: {record.check_in_time}</p>
                      {record.check_out_time && <p>Check-out: {record.check_out_time}</p>}
                      {record.hours_worked && <p>Hours: {record.hours_worked}</p>}
                    </div>
                  )}
                  
                  {user?.role === 'admin' && (
                    <div className="mt-2 flex space-x-2">
                      <button
                        onClick={() => updateAttendance(record.id, 'present')}
                        className="text-green-600 hover:text-green-900 text-sm"
                      >
                        Present
                      </button>
                      <button
                        onClick={() => updateAttendance(record.id, 'absent')}
                        className="text-red-600 hover:text-red-900 text-sm"
                      >
                        Absent
                      </button>
                      <button
                        onClick={() => updateAttendance(record.id, 'late')}
                        className="text-yellow-600 hover:text-yellow-900 text-sm"
                      >
                        Late
                      </button>
                      <button
                        onClick={() => updateAttendance(record.id, 'excused')}
                        className="text-blue-600 hover:text-blue-900 text-sm"
                      >
                        Excused
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>

        {attendanceRecords.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No attendance records</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by marking attendance for students.</p>
          </div>
        )}
      </div>
    </div>
  );
}