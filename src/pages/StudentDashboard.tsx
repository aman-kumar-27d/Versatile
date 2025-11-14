import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, FileText, Users, Clock, Award, TrendingUp, CheckCircle, Clock3, XCircle, FolderOpen } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  instructor: string;
  duration: string;
  status: 'active' | 'completed' | 'pending';
}

interface Internship {
  id: string;
  title: string;
  company: string;
  status: 'applied' | 'interview' | 'accepted' | 'rejected';
  appliedDate: string;
}

interface Task {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'completed' | 'overdue';
  type: 'assignment' | 'project' | 'meeting';
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript',
    progress: 75,
    totalLessons: 20,
    completedLessons: 15,
    instructor: 'John Doe',
    duration: '8 weeks',
    status: 'active'
  },
  {
    id: '2',
    title: 'React Development',
    description: 'Build modern web applications with React',
    progress: 45,
    totalLessons: 15,
    completedLessons: 7,
    instructor: 'Jane Smith',
    duration: '6 weeks',
    status: 'active'
  }
];

const mockInternships: Internship[] = [
  {
    id: '1',
    title: 'Frontend Developer Intern',
    company: 'Tech Corp',
    status: 'interview',
    appliedDate: '2024-11-01'
  },
  {
    id: '2',
    title: 'Full Stack Developer Intern',
    company: 'StartupXYZ',
    status: 'applied',
    appliedDate: '2024-11-10'
  }
];

const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Complete React Assignment',
    dueDate: '2024-11-15',
    status: 'pending',
    type: 'assignment'
  },
  {
    id: '2',
    title: 'Team Meeting',
    dueDate: '2024-11-14',
    status: 'pending',
    type: 'meeting'
  },
  {
    id: '3',
    title: 'Submit Project Proposal',
    dueDate: '2024-11-12',
    status: 'completed',
    type: 'project'
  }
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [internships, setInternships] = useState<Internship[]>(mockInternships);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'pending':
      case 'applied':
        return <Clock3 className="w-4 h-4 text-yellow-500" />;
      case 'overdue':
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'interview':
        return <Users className="w-4 h-4 text-blue-500" />;
      default:
        return <Clock3 className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'pending':
      case 'applied':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'active':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const totalProgress = courses.reduce((acc, course) => acc + course.progress, 0) / courses.length;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.email || 'Student'}!
          </h1>
          <p className="text-gray-600">
            Track your progress, manage your courses, and stay updated with your internships.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="text-2xl font-bold text-gray-900">{courses.filter(c => c.status === 'active').length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overall Progress</p>
                <p className="text-2xl font-bold text-gray-900">{Math.round(totalProgress)}%</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FileText className="w-6 h-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Active Applications</p>
                <p className="text-2xl font-bold text-gray-900">{internships.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{tasks.filter(t => t.status === 'pending').length}</p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white rounded-lg shadow p-6 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/documents')}
          >
            <div className="flex items-center">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <FolderOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">View</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Courses Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
                  <button
                    onClick={() => navigate('/courses')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {courses.map((course) => (
                    <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-medium text-gray-900 mb-1">{course.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{course.description}</p>
                          <div className="flex items-center text-sm text-gray-500">
                            <Users className="w-4 h-4 mr-1" />
                            <span className="mr-4">{course.instructor}</span>
                            <Clock className="w-4 h-4 mr-1" />
                            <span>{course.duration}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(course.status)}`}>
                          {course.status}
                        </span>
                      </div>
                      
                      <div className="mb-2">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{course.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${course.progress}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">
                          {course.completedLessons} of {course.totalLessons} lessons completed
                        </span>
                        <button
                          onClick={() => navigate(`/courses/${course.id}`)}
                          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Continue Learning
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Internships */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">My Applications</h2>
                  <button
                    onClick={() => navigate('/internships')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Browse
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {internships.map((internship) => (
                    <div key={internship.id} className="border border-gray-200 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-1">{internship.title}</h3>
                      <p className="text-sm text-gray-600 mb-2">{internship.company}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(internship.status)}
                          <span className={`ml-2 text-sm font-medium capitalize ${
                            internship.status === 'accepted' ? 'text-green-600' :
                            internship.status === 'rejected' ? 'text-red-600' :
                            internship.status === 'interview' ? 'text-blue-600' :
                            'text-yellow-600'
                          }`}>
                            {internship.status}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {new Date(internship.appliedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Tasks */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Upcoming Tasks</h2>
                  <button
                    onClick={() => navigate('/tasks')}
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View All
                  </button>
                </div>
              </div>
              <div className="p-6">
                <div className="space-y-3">
                  {tasks.filter(task => task.status !== 'completed').slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        {getStatusIcon(task.status)}
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-xs text-gray-500">
                            Due: {new Date(task.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}