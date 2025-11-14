import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { BookOpen, Play, CheckCircle, Clock, FileText, Users, Award, ArrowLeft, Download, MessageSquare } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'reading' | 'quiz' | 'assignment';
  completed: boolean;
  description: string;
}

interface Module {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledStudents: number;
  rating: number;
  progress: number;
  modules: Module[];
}

const mockCourse: Course = {
  id: '1',
  title: 'Introduction to Web Development',
  description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications. This comprehensive course covers everything from basic web structure to interactive web development.',
  instructor: 'John Doe',
  duration: '8 weeks',
  level: 'beginner',
  enrolledStudents: 245,
  rating: 4.8,
  progress: 75,
  modules: [
    {
      id: '1',
      title: 'Module 1: HTML Fundamentals',
      lessons: [
        {
          id: '1',
          title: 'Introduction to HTML',
          duration: '15 min',
          type: 'video',
          completed: true,
          description: 'Learn the basics of HTML structure and elements'
        },
        {
          id: '2',
          title: 'HTML Elements and Attributes',
          duration: '20 min',
          type: 'video',
          completed: true,
          description: 'Understanding HTML elements and their attributes'
        },
        {
          id: '3',
          title: 'HTML Forms',
          duration: '25 min',
          type: 'video',
          completed: true,
          description: 'Creating interactive forms with HTML'
        },
        {
          id: '4',
          title: 'HTML Quiz',
          duration: '10 min',
          type: 'quiz',
          completed: false,
          description: 'Test your knowledge of HTML fundamentals'
        }
      ]
    },
    {
      id: '2',
      title: 'Module 2: CSS Styling',
      lessons: [
        {
          id: '5',
          title: 'Introduction to CSS',
          duration: '18 min',
          type: 'video',
          completed: true,
          description: 'Basic CSS syntax and selectors'
        },
        {
          id: '6',
          title: 'CSS Box Model',
          duration: '22 min',
          type: 'video',
          completed: true,
          description: 'Understanding the CSS box model'
        },
        {
          id: '7',
          title: 'CSS Flexbox',
          duration: '30 min',
          type: 'video',
          completed: false,
          description: 'Master CSS Flexbox for layout'
        },
        {
          id: '8',
          title: 'CSS Assignment',
          duration: '45 min',
          type: 'assignment',
          completed: false,
          description: 'Practice CSS with hands-on exercises'
        }
      ]
    },
    {
      id: '3',
      title: 'Module 3: JavaScript Basics',
      lessons: [
        {
          id: '9',
          title: 'Introduction to JavaScript',
          duration: '25 min',
          type: 'video',
          completed: false,
          description: 'JavaScript fundamentals and syntax'
        },
        {
          id: '10',
          title: 'Variables and Data Types',
          duration: '20 min',
          type: 'video',
          completed: false,
          description: 'Understanding JavaScript variables and data types'
        }
      ]
    }
  ]
};

export default function CourseDetail() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<Course>(mockCourse);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>(['1']);

  const getLessonIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-4 h-4" />;
      case 'reading':
        return <FileText className="w-4 h-4" />;
      case 'quiz':
        return <CheckCircle className="w-4 h-4" />;
      case 'assignment':
        return <FileText className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const startLesson = (lesson: Lesson) => {
    setActiveLesson(lesson);
    // In a real app, this would navigate to the lesson content
    console.log('Starting lesson:', lesson.title);
  };

  const markAsComplete = (lessonId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(module => ({
        ...module,
        lessons: module.lessons.map(lesson =>
          lesson.id === lessonId ? { ...lesson, completed: true } : lesson
        )
      }))
    }));
  };

  const completedLessons = course.modules.reduce((acc, module) => 
    acc + module.lessons.filter(lesson => lesson.completed).length, 0
  );
  
  const totalLessons = course.modules.reduce((acc, module) => 
    acc + module.lessons.length, 0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="p-2 hover:bg-gray-100 rounded-lg mr-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{course.title}</h1>
                <p className="text-gray-600">{course.description}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{completedLessons}/{totalLessons}</div>
                <div className="text-sm text-gray-500">Lessons</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{course.progress}%</div>
                <div className="text-sm text-gray-500">Complete</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Course Content */}
          <div className="lg:col-span-2">
            {activeLesson ? (
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{activeLesson.title}</h2>
                  <button
                    onClick={() => setActiveLesson(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                
                <div className="mb-6">
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    {getLessonIcon(activeLesson.type)}
                    <span className="ml-2 capitalize">{activeLesson.type}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4" />
                    <span className="ml-1">{activeLesson.duration}</span>
                  </div>
                  
                  <p className="text-gray-700 mb-6">{activeLesson.description}</p>
                  
                  {/* Lesson content would go here */}
                  <div className="bg-gray-100 rounded-lg p-8 text-center">
                    <div className="text-gray-500 mb-4">
                      {activeLesson.type === 'video' && <Play className="w-16 h-16 mx-auto" />}
                      {activeLesson.type === 'reading' && <FileText className="w-16 h-16 mx-auto" />}
                      {activeLesson.type === 'quiz' && <CheckCircle className="w-16 h-16 mx-auto" />}
                      {activeLesson.type === 'assignment' && <FileText className="w-16 h-16 mx-auto" />}
                    </div>
                    <p className="text-lg text-gray-600">
                      {activeLesson.type === 'video' && 'Video player would be embedded here'}
                      {activeLesson.type === 'reading' && 'Reading content would be displayed here'}
                      {activeLesson.type === 'quiz' && 'Quiz questions would appear here'}
                      {activeLesson.type === 'assignment' && 'Assignment details and submission form would be here'}
                    </p>
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => markAsComplete(activeLesson.id)}
                    disabled={activeLesson.completed}
                    className={`px-6 py-2 rounded-md font-medium ${
                      activeLesson.completed
                        ? 'bg-green-100 text-green-800 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {activeLesson.completed ? 'Completed' : 'Mark as Complete'}
                  </button>
                  <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">
                    Next Lesson
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Course Overview</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    Welcome to {course.title}! This comprehensive course will take you from beginner to proficient in web development.
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">What you'll learn:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Build responsive websites using HTML, CSS, and JavaScript</li>
                    <li>Understand web development fundamentals</li>
                    <li>Create interactive web applications</li>
                    <li>Master modern web development best practices</li>
                  </ul>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 mt-4">Course Requirements:</h3>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>No prior programming experience required</li>
                    <li>A computer with internet access</li>
                    <li>Text editor (VS Code recommended)</li>
                    <li>Web browser (Chrome or Firefox)</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Course Modules */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Course Modules</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {completedLessons} of {totalLessons} lessons completed
                </p>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {course.modules.map((module) => (
                    <div key={module.id} className="border border-gray-200 rounded-lg">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-gray-900">{module.title}</h4>
                          <span className="text-sm text-gray-500">
                            {expandedModules.includes(module.id) ? '−' : '+'}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Progress</span>
                            <span>
                              {module.lessons.filter(l => l.completed).length}/{module.lessons.length}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-green-500 h-1 rounded-full"
                              style={{
                                width: `${(module.lessons.filter(l => l.completed).length / module.lessons.length) * 100}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      </button>
                      
                      {expandedModules.includes(module.id) && (
                        <div className="border-t border-gray-200">
                          {module.lessons.map((lesson) => (
                            <button
                              key={lesson.id}
                              onClick={() => startLesson(lesson)}
                              className="w-full p-3 text-left hover:bg-gray-50 transition-colors flex items-center justify-between group"
                            >
                              <div className="flex items-center">
                                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                                  lesson.completed
                                    ? 'bg-green-500 border-green-500'
                                    : 'border-gray-300 group-hover:border-blue-500'
                                }`}>
                                  {lesson.completed ? (
                                    <CheckCircle className="w-4 h-4 text-white" />
                                  ) : (
                                    <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center">
                                    {getLessonIcon(lesson.type)}
                                    <span className="ml-2 text-sm font-medium text-gray-900">{lesson.title}</span>
                                  </div>
                                  <span className="text-xs text-gray-500">{lesson.duration}</span>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Info</h3>
              <div className="space-y-3">
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Instructor:</span>
                  <span className="ml-2 font-medium text-gray-900">{course.instructor}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Duration:</span>
                  <span className="ml-2 font-medium text-gray-900">{course.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Award className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Level:</span>
                  <span className="ml-2 font-medium text-gray-900 capitalize">{course.level}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Users className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-gray-600">Students:</span>
                  <span className="ml-2 font-medium text-gray-900">{course.enrolledStudents}</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-4 h-4 ${i < Math.floor(course.rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                        ★
                      </div>
                    ))}
                  </div>
                  <span className="ml-2 font-medium text-gray-900">{course.rating}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium">
                <Download className="w-4 h-4 inline mr-2" />
                Download Resources
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium">
                <MessageSquare className="w-4 h-4 inline mr-2" />
                Discussion Forum
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}