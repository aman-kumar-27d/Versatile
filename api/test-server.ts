import express from 'express'
import cors from 'cors'

const app = express()
const PORT = process.env.PORT || 3000

app.use(cors())
app.use(express.json())

// Mock authentication endpoints
app.post('/api/auth/register', (req, res) => {
  const { email, password, role, firstName, lastName } = req.body
  
  // Mock successful registration
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: 'mock-user-id',
      email,
      role,
      firstName,
      lastName,
      name: `${firstName} ${lastName}`
    },
    token: 'mock-jwt-token'
  })
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body
  
  // Mock successful login
  res.json({
    success: true,
    message: 'Login successful',
    user: {
      id: 'mock-user-id',
      email,
      role: email.includes('admin') ? 'admin' : 'student',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User'
    },
    token: 'mock-jwt-token'
  })
})

app.get('/api/auth/profile', (req, res) => {
  const authHeader = req.headers.authorization
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }
  
  // Mock profile data
  res.json({
    success: true,
    user: {
      id: 'mock-user-id',
      email: 'test@example.com',
      role: 'admin',
      firstName: 'Test',
      lastName: 'User',
      name: 'Test User'
    }
  })
})

// Mock internship endpoints
app.get('/api/internships', (req, res) => {
  const mockInternships = [
    {
      id: '1',
      title: 'Software Development Intern',
      description: 'Join our development team to work on cutting-edge web applications using modern technologies.',
      type: 'full-time',
      duration: '3 months',
      location: 'Remote',
      stipend: 15000,
      application_deadline: '2024-12-31',
      start_date: '2025-01-15',
      requirements: 'Bachelor\'s degree in Computer Science, knowledge of JavaScript and React',
      responsibilities: 'Develop web applications, write clean code, collaborate with team',
      skills_required: 'JavaScript, React, Node.js, Git',
      max_applicants: 50,
      is_active: true,
      created_by: 'admin-user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '2',
      title: 'Data Science Intern',
      description: 'Work with our data team to analyze large datasets and build machine learning models.',
      type: 'part-time',
      duration: '6 months',
      location: 'Mumbai',
      stipend: 20000,
      application_deadline: '2024-12-15',
      start_date: '2025-01-01',
      requirements: 'Bachelor\'s degree in Statistics or related field, Python programming',
      responsibilities: 'Data analysis, model building, report generation',
      skills_required: 'Python, R, SQL, Machine Learning',
      max_applicants: 30,
      is_active: true,
      created_by: 'admin-user-id',
      created_at: '2024-01-02T00:00:00Z',
      updated_at: '2024-01-02T00:00:00Z'
    }
  ]
  
  res.json({
    success: true,
    internships: mockInternships
  })
})

app.post('/api/internships', (req, res) => {
  const internshipData = req.body
  
  // Mock successful creation
  res.json({
    success: true,
    message: 'Internship created successfully',
    internship: {
      id: 'mock-internship-id',
      ...internshipData,
      created_by: 'admin-user-id',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  })
})

app.get('/api/internships/:id', (req, res) => {
  const { id } = req.params
  
  // Mock internship detail
  res.json({
    success: true,
    internship: {
      id,
      title: 'Software Development Intern',
      description: 'Join our development team to work on cutting-edge web applications.',
      type: 'full-time',
      duration: '3 months',
      location: 'Remote',
      stipend: 15000,
      application_deadline: '2024-12-31',
      start_date: '2025-01-15',
      requirements: 'Bachelor\'s degree in Computer Science, knowledge of JavaScript and React',
      responsibilities: 'Develop web applications, write clean code, collaborate with team',
      skills_required: 'JavaScript, React, Node.js, Git',
      max_applicants: 50,
      is_active: true,
      created_by: 'admin-user-id',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z'
    }
  })
})

app.get('/api/internships/:id/applications', (req, res) => {
  const { id } = req.params
  
  // Mock applications
  const mockApplications = [
    {
      id: 'app-1',
      student_id: 'student-1',
      student_name: 'John Doe',
      student_email: 'john@example.com',
      internship_id: id,
      status: 'pending',
      cover_letter: 'I am very interested in this internship opportunity...',
      resume_url: 'https://example.com/resume1.pdf',
      created_at: '2024-01-15T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z'
    },
    {
      id: 'app-2',
      student_id: 'student-2',
      student_name: 'Jane Smith',
      student_email: 'jane@example.com',
      internship_id: id,
      status: 'approved',
      cover_letter: 'This internship aligns perfectly with my career goals...',
      resume_url: 'https://example.com/resume2.pdf',
      created_at: '2024-01-16T14:30:00Z',
      updated_at: '2024-01-17T09:15:00Z'
    }
  ]
  
  res.json({
    success: true,
    applications: mockApplications
  })
})

app.put('/api/internships/:id/applications/:applicationId', (req, res) => {
  const { id, applicationId } = req.params
  const { status } = req.body
  
  // Mock successful status update
  res.json({
    success: true,
    message: `Application ${applicationId} status updated to ${status}`,
    application: {
      id: applicationId,
      status,
      updated_at: new Date().toISOString()
    }
  })
})

app.delete('/api/internships/:id', (req, res) => {
  const { id } = req.params
  
  // Mock successful deletion
  res.json({
    success: true,
    message: 'Internship deleted successfully'
  })
})

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.listen(PORT, () => {
  console.log(`🚀 Test server running on port ${PORT}`)
  console.log(`📡 API endpoints available at http://localhost:${PORT}/api`)
})