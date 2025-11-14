import React, { useState, useEffect } from 'react';
import { BookOpen, Users, Clock, Award, TrendingUp, Plus, Edit, Trash2, Search, Filter, BarChart3, FileText, CheckCircle, Circle } from 'lucide-react';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  enrolledStudents: number;
  maxStudents: number;
  modules: Module[];
  assessments: Assessment[];
  createdAt: string;
  status: 'draft' | 'published' | 'archived';
  thumbnail: string;
  rating: number;
  reviews: number;
}

interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
  duration: string;
}

interface Lesson {
  id: string;
  title: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  duration: string;
  content: string;
  resources: Resource[];
  completed: boolean;
  order: number;
}

interface Resource {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'document';
  url: string;
}

interface Assessment {
  id: string;
  title: string;
  type: 'quiz' | 'assignment' | 'project';
  totalMarks: number;
  passingMarks: number;
  duration: string;
  dueDate: string;
  submitted: boolean;
  score?: number;
}

interface StudentProgress {
  studentId: string;
  studentName: string;
  courseId: string;
  overallProgress: number;
  completedLessons: number;
  totalLessons: number;
  lastAccessed: string;
  grades: { [key: string]: number };
}

const CourseManagement: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([
    {
      id: '1',
      title: 'Introduction to React Development',
      description: 'Comprehensive course covering React fundamentals, hooks, state management, and modern development practices.',
      instructor: 'Dr. Sarah Wilson',
      duration: '8 weeks',
      level: 'beginner',
      category: 'Web Development',
      enrolledStudents: 45,
      maxStudents: 60,
      createdAt: '2024-10-01',
      status: 'published',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20course%20thumbnail%20with%20modern%20design&image_size=landscape_16_9',
      rating: 4.8,
      reviews: 32,
      modules: [
        {
          id: 'm1',
          title: 'React Fundamentals',
          description: 'Core concepts of React including components, props, and state',
          order: 1,
          duration: '2 weeks',
          lessons: [
            {
              id: 'l1',
              title: 'Introduction to React',
              type: 'video',
              duration: '45 min',
              content: 'Overview of React and its ecosystem',
              resources: [
                { id: 'r1', title: 'React Documentation', type: 'link', url: 'https://react.dev' },
                { id: 'r2', title: 'Course Slides', type: 'pdf', url: '/slides/react-intro.pdf' }
              ],
              completed: true,
              order: 1
            },
            {
              id: 'l2',
              title: 'Components and Props',
              type: 'video',
              duration: '60 min',
              content: 'Understanding React components and props',
              resources: [
                { id: 'r3', title: 'Component Examples', type: 'document', url: '/examples/components.tsx' }
              ],
              completed: true,
              order: 2
            }
          ]
        },
        {
          id: 'm2',
          title: 'React Hooks',
          description: 'Deep dive into React hooks including useState, useEffect, and custom hooks',
          order: 2,
          duration: '3 weeks',
          lessons: [
            {
              id: 'l3',
              title: 'useState and useEffect',
              type: 'video',
              duration: '90 min',
              content: 'Managing state and side effects in functional components',
              resources: [],
              completed: false,
              order: 1
            }
          ]
        }
      ],
      assessments: [
        {
          id: 'a1',
          title: 'React Basics Quiz',
          type: 'quiz',
          totalMarks: 50,
          passingMarks: 35,
          duration: '30 min',
          dueDate: '2024-11-20',
          submitted: true,
          score: 42
        },
        {
          id: 'a2',
          title: 'Build a Todo App',
          type: 'assignment',
          totalMarks: 100,
          passingMarks: 70,
          duration: '2 hours',
          dueDate: '2024-11-25',
          submitted: false
        }
      ]
    },
    {
      id: '2',
      title: 'Advanced JavaScript Concepts',
      description: 'Master advanced JavaScript features including closures, prototypes, async programming, and ES6+.',
      instructor: 'Prof. Mike Chen',
      duration: '6 weeks',
      level: 'advanced',
      category: 'Programming',
      enrolledStudents: 28,
      maxStudents: 40,
      createdAt: '2024-09-15',
      status: 'published',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Advanced%20JavaScript%20course%20thumbnail%20with%20code%20syntax&image_size=landscape_16_9',
      rating: 4.6,
      reviews: 18,
      modules: [],
      assessments: []
    },
    {
      id: '3',
      title: 'Web Development Fundamentals',
      description: 'Learn HTML, CSS, and JavaScript from scratch with hands-on projects.',
      instructor: 'Dr. Emily Brown',
      duration: '10 weeks',
      level: 'beginner',
      category: 'Web Development',
      enrolledStudents: 67,
      maxStudents: 80,
      createdAt: '2024-08-20',
      status: 'published',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Web%20development%20course%20thumbnail%20with%20HTML%20CSS%20JS%20logos&image_size=landscape_16_9',
      rating: 4.9,
      reviews: 45,
      modules: [],
      assessments: []
    }
  ]);

  const [studentProgress, setStudentProgress] = useState<StudentProgress[]>([
    {
      studentId: 's1',
      studentName: 'John Doe',
      courseId: '1',
      overallProgress: 75,
      completedLessons: 6,
      totalLessons: 8,
      lastAccessed: '2024-11-14T10:30:00',
      grades: { 'a1': 42, 'a2': 0 }
    },
    {
      studentId: 's2',
      studentName: 'Jane Smith',
      courseId: '1',
      overallProgress: 90,
      completedLessons: 8,
      totalLessons: 8,
      lastAccessed: '2024-11-13T15:45:00',
      grades: { 'a1': 48, 'a2': 85 }
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'courses' | 'progress' | 'analytics'>('courses');

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         course.instructor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = filterLevel === 'all' || course.level === filterLevel;
    const matchesCategory = filterCategory === 'all' || course.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || course.status === filterStatus;
    
    return matchesSearch && matchesLevel && matchesCategory && matchesStatus;
  });

  const handleCreateCourse = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const newCourse: Course = {
      id: editingCourse?.id || Date.now().toString(),
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      instructor: formData.get('instructor') as string,
      duration: formData.get('duration') as string,
      level: formData.get('level') as Course['level'],
      category: formData.get('category') as string,
      maxStudents: parseInt(formData.get('maxStudents') as string),
      enrolledStudents: 0,
      modules: [],
      assessments: [],
      createdAt: new Date().toISOString(),
      status: 'draft',
      thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Course%20thumbnail%20with%20modern%20design&image_size=landscape_16_9',
      rating: 0,
      reviews: 0
    };

    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? newCourse : c));
    } else {
      setCourses([...courses, newCourse]);
    }

    setShowNewCourseModal(false);
    setEditingCourse(null);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(courses.filter(c => c.id !== courseId));
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Course Management</h1>
            </div>
            <button
              onClick={() => {
                setEditingCourse(null);
                setShowNewCourseModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>New Course</span>
            </button>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {[
                { id: 'courses', label: 'Courses', icon: BookOpen },
                { id: 'progress', label: 'Student Progress', icon: TrendingUp },
                { id: 'analytics', label: 'Analytics', icon: BarChart3 }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <select
              value={filterLevel}
              onChange={(e) => setFilterLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Programming">Programming</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'courses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map(course => (
              <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(course.level)}`}>
                        {course.level}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{course.description}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{course.enrolledStudents}/{course.maxStudents} students</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className="flex text-yellow-400">
                        {[...Array(5)].map((_, i) => (
                          <svg key={i} className={`h-4 w-4 ${i < Math.floor(course.rating) ? 'fill-current' : 'fill-gray-300'}`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">{course.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>{course.duration}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(course.status)}`}>
                      {course.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-gray-500">by {course.instructor}</span>
                    <span className="text-sm text-gray-500">{course.category}</span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => setSelectedCourse(course)}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      View Details
                    </button>
                    <button
                      onClick={() => {
                        setEditingCourse(course);
                        setShowNewCourseModal(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Student Progress Tracking</h2>
              <p className="text-gray-600 mt-1">Monitor individual student progress across courses</p>
            </div>
            <div className="divide-y divide-gray-200">
              {studentProgress.map(progress => {
                const course = courses.find(c => c.id === progress.courseId);
                return (
                  <div key={progress.studentId} className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{progress.studentName}</h3>
                        <p className="text-sm text-gray-500">{course?.title}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">{progress.overallProgress}%</div>
                        <p className="text-sm text-gray-500">Overall Progress</p>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Course Completion</span>
                        <span className="text-sm text-gray-500">{progress.completedLessons}/{progress.totalLessons} lessons</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(progress.overallProgress)}`}
                          style={{ width: `${progress.overallProgress}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Assessment Grades</h4>
                        <div className="space-y-2">
                          {Object.entries(progress.grades).map(([assessmentId, grade]) => {
                            const assessment = course?.assessments.find(a => a.id === assessmentId);
                            return (
                              <div key={assessmentId} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">{assessment?.title}</span>
                                <span className={`text-sm font-medium ${
                                  grade >= (assessment?.passingMarks || 0) ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {grade}/{assessment?.totalMarks}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Last Activity</h4>
                        <p className="text-sm text-gray-600">
                          Last accessed: {new Date(progress.lastAccessed).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <BarChart3 className="h-6 w-6 text-blue-600" />
                <h3 className="text-lg font-semibold text-gray-900">Course Statistics</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Courses</span>
                  <span className="text-2xl font-bold text-gray-900">{courses.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Published Courses</span>
                  <span className="text-2xl font-bold text-green-600">
                    {courses.filter(c => c.status === 'published').length}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Total Enrollments</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {courses.reduce((sum, course) => sum + course.enrolledStudents, 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="text-2xl font-bold text-yellow-600">
                    {(courses.reduce((sum, course) => sum + course.rating, 0) / courses.length).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Users className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Student Engagement</h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Active Students</span>
                  <span className="text-2xl font-bold text-gray-900">{studentProgress.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Average Progress</span>
                  <span className="text-2xl font-bold text-blue-600">
                    {(studentProgress.reduce((sum, p) => sum + p.overallProgress, 0) / studentProgress.length).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Completed Courses</span>
                  <span className="text-2xl font-bold text-green-600">
                    {studentProgress.filter(p => p.overallProgress >= 100).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Course Detail Modal */}
        {selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                <button
                  onClick={() => setSelectedCourse(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <img
                    src={selectedCourse.thumbnail}
                    alt={selectedCourse.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <p className="text-gray-600 mb-4">{selectedCourse.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Instructor:</span>
                      <span className="font-medium">{selectedCourse.instructor}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{selectedCourse.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Level:</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getLevelColor(selectedCourse.level)}`}>
                        {selectedCourse.level}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Category:</span>
                      <span className="font-medium">{selectedCourse.category}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Course Modules</h3>
                  <div className="space-y-3">
                    {selectedCourse.modules.map(module => (
                      <div key={module.id} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium mb-2">{module.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{module.description}</p>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{module.lessons.length} lessons</span>
                          <span>{module.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-4 mt-6">Assessments</h3>
                  <div className="space-y-3">
                    {selectedCourse.assessments.map(assessment => (
                      <div key={assessment.id} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{assessment.title}</h4>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            assessment.submitted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {assessment.submitted ? 'Submitted' : 'Pending'}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Type: {assessment.type}</span>
                          <span>Due: {assessment.dueDate}</span>
                        </div>
                        {assessment.score !== undefined && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Score: </span>
                            <span className={`font-medium ${
                              assessment.score >= assessment.passingMarks ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {assessment.score}/{assessment.totalMarks}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* New/Edit Course Modal */}
        {showNewCourseModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingCourse ? 'Edit Course' : 'Create New Course'}
                </h2>
                <button
                  onClick={() => {
                    setShowNewCourseModal(false);
                    setEditingCourse(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              
              <form onSubmit={handleCreateCourse} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Course Title</label>
                    <input
                      type="text"
                      name="title"
                      defaultValue={editingCourse?.title || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Instructor</label>
                    <input
                      type="text"
                      name="instructor"
                      defaultValue={editingCourse?.instructor || ''}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={editingCourse?.description || ''}
                    rows={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                    <input
                      type="text"
                      name="duration"
                      defaultValue={editingCourse?.duration || ''}
                      placeholder="e.g., 8 weeks"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Level</label>
                    <select
                      name="level"
                      defaultValue={editingCourse?.level || 'beginner'}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Max Students</label>
                    <input
                      type="number"
                      name="maxStudents"
                      defaultValue={editingCourse?.maxStudents || 50}
                      min="1"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <input
                    type="text"
                    name="category"
                    defaultValue={editingCourse?.category || ''}
                    placeholder="e.g., Web Development"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCourseModal(false);
                      setEditingCourse(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    {editingCourse ? 'Update Course' : 'Create Course'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseManagement;