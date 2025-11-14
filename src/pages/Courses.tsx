import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, Users, Star, Filter, Search, Award, TrendingUp, Play, CheckCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  enrolledStudents: number;
  rating: number;
  price: number;
  category: string;
  thumbnail: string;
  progress?: number;
  enrolled?: boolean;
}

const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern web applications.',
    instructor: 'John Doe',
    duration: '8 weeks',
    level: 'beginner',
    enrolledStudents: 245,
    rating: 4.8,
    price: 49.99,
    category: 'Web Development',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Modern%20web%20development%20course%20thumbnail%20with%20HTML%20CSS%20JavaScript%20logos%20clean%20professional%20design&image_size=landscape_16_9',
    progress: 75,
    enrolled: true
  },
  {
    id: '2',
    title: 'React Development Masterclass',
    description: 'Master React.js and build modern, interactive web applications with hooks and state management.',
    instructor: 'Jane Smith',
    duration: '12 weeks',
    level: 'intermediate',
    enrolledStudents: 189,
    rating: 4.9,
    price: 79.99,
    category: 'Web Development',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=React%20JS%20course%20thumbnail%20with%20React%20logo%20modern%20UI%20components%20professional%20design&image_size=landscape_16_9',
    progress: 45,
    enrolled: true
  },
  {
    id: '3',
    title: 'Python for Data Science',
    description: 'Learn Python programming and data analysis techniques for real-world applications.',
    instructor: 'Dr. Mike Johnson',
    duration: '10 weeks',
    level: 'beginner',
    enrolledStudents: 312,
    rating: 4.7,
    price: 69.99,
    category: 'Data Science',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Python%20data%20science%20course%20thumbnail%20with%20Python%20logo%20data%20visualization%20charts%20professional%20design&image_size=landscape_16_9'
  },
  {
    id: '4',
    title: 'Digital Marketing Fundamentals',
    description: 'Master digital marketing strategies including SEO, social media, and content marketing.',
    instructor: 'Sarah Williams',
    duration: '6 weeks',
    level: 'beginner',
    enrolledStudents: 156,
    rating: 4.6,
    price: 39.99,
    category: 'Marketing',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Digital%20marketing%20course%20thumbnail%20with%20social%20media%20icons%20SEO%20graphics%20professional%20design&image_size=landscape_16_9'
  },
  {
    id: '5',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into advanced JavaScript topics including closures, prototypes, and async programming.',
    instructor: 'Alex Chen',
    duration: '8 weeks',
    level: 'advanced',
    enrolledStudents: 98,
    rating: 4.8,
    price: 89.99,
    category: 'Web Development',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=Advanced%20JavaScript%20course%20thumbnail%20with%20JS%20logo%20code%20snippets%20professional%20design&image_size=landscape_16_9'
  },
  {
    id: '6',
    title: 'UI/UX Design Principles',
    description: 'Learn user interface and user experience design principles for creating beautiful, functional designs.',
    instructor: 'Emma Davis',
    duration: '7 weeks',
    level: 'intermediate',
    enrolledStudents: 203,
    rating: 4.7,
    price: 59.99,
    category: 'Design',
    thumbnail: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=UI%20UX%20design%20course%20thumbnail%20with%20design%20tools%20wireframes%20professional%20modern%20design&image_size=landscape_16_9'
  }
];

export default function Courses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>(mockCourses);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showEnrolledOnly, setShowEnrolledOnly] = useState(false);

  const categories = ['all', 'Web Development', 'Data Science', 'Marketing', 'Design'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    let filtered = courses;

    if (searchTerm) {
      filtered = filtered.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(course => course.category === selectedCategory);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(course => course.level === selectedLevel);
    }

    if (showEnrolledOnly) {
      filtered = filtered.filter(course => course.enrolled);
    }

    setFilteredCourses(filtered);
  }, [searchTerm, selectedCategory, selectedLevel, showEnrolledOnly, courses]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEnroll = (courseId: string) => {
    setCourses(prev => prev.map(course =>
      course.id === courseId
        ? { ...course, enrolled: true, progress: 0 }
        : course
    ));
  };

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Courses</h1>
              <p className="text-gray-600 mt-1">Discover and enroll in courses to advance your skills</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {courses.filter(c => c.enrolled).length} enrolled • {courses.length} total
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex flex-wrap gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level.charAt(0).toUpperCase() + level.slice(1)}
                  </option>
                ))}
              </select>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={showEnrolledOnly}
                  onChange={(e) => setShowEnrolledOnly(e.target.checked)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enrolled only</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {/* Course Thumbnail */}
              <div className="relative">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI0MDAiIGhlaWdodD0iMjI1IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNzUgMTAwSDEwMFYxMjVIMTc1VjEwMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTEyNSAxMDBIMTAwVjEyNUgxMjVWMTAwWiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTAwIDEwMEgxMjVWMTI1SDEwMFYxMDBaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDEwMFYxNTBIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTEyNSAxMjVIMTUwVjE1MEgxMjVWMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8cGF0aCBkPSJNMTI1IDEyNUgxNTBWMTUwSDEyNVYxMjVaIiBmaWxsPSIjOUNBM0FGIi8+CjxwYXRoIGQ9Ik0xMjUgMTI1SDEwMFYxNTBIMTI1VjEyNVoiIGZpbGw9IiM5Q0EzQUYiLz4KPHA+dGggZD0iTTEyNSAxMjVIMTUwVjE1MEgxMjVWMTI1WiIgZmlsbD0iIzlDQTNBRiIvPgo8L3N2Zz4K';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getLevelColor(course.level)}`}>
                    {course.level}
                  </span>
                </div>
                {course.enrolled && (
                  <div className="absolute top-4 left-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                      Enrolled
                    </span>
                  </div>
                )}
              </div>

              {/* Course Info */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2">{course.description}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    <span>{course.enrolledStudents} students</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    <span>{course.duration}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < Math.floor(course.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-900">{course.rating}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">${course.price}</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <BookOpen className="w-4 h-4 mr-2" />
                    <span>Instructor: {course.instructor}</span>
                  </div>
                  {course.enrolled && course.progress !== undefined && (
                    <div>
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
                  )}
                </div>

                <div className="flex space-x-2">
                  {course.enrolled ? (
                    <button
                      onClick={() => handleContinue(course.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                    >
                      <Play className="w-4 h-4 inline mr-2" />
                      Continue
                    </button>
                  ) : (
                    <button
                      onClick={() => handleEnroll(course.id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm"
                    >
                      Enroll Now
                    </button>
                  )}
                  <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm">
                    Preview
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">
              {searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all' || showEnrolledOnly
                ? 'Try adjusting your search criteria'
                : 'No courses available at the moment'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
}