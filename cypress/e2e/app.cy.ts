describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('/login')
  })

  it('should display login form', () => {
    cy.get('input[type="email"]').should('be.visible')
    cy.get('input[type="password"]').should('be.visible')
    cy.get('button[type="submit"]').should('contain', 'Sign In')
  })

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click()
    cy.contains('Email is required').should('be.visible')
    cy.contains('Password is required').should('be.visible')
  })

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    cy.contains('Please enter a valid email').should('be.visible')
  })

  it('should login successfully with valid credentials', () => {
    cy.get('input[type="email"]').type('admin@example.com')
    cy.get('input[type="password"]').type('password123')
    cy.get('button[type="submit"]').click()
    
    // Should redirect to dashboard
    cy.url().should('include', '/dashboard')
    cy.contains('Dashboard').should('be.visible')
  })

  it('should show error for invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@example.com')
    cy.get('input[type="password"]').type('wrongpassword')
    cy.get('button[type="submit"]').click()
    
    cy.contains('Invalid credentials').should('be.visible')
  })
})

describe('Navigation', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123')
  })

  it('should navigate to different sections', () => {
    // Navigate to internships
    cy.get('a[href*="internships"]').click()
    cy.url().should('include', '/internships')
    cy.contains('Internships').should('be.visible')

    // Navigate to documents
    cy.get('a[href*="documents"]').click()
    cy.url().should('include', '/documents')
    cy.contains('Documents').should('be.visible')

    // Navigate to attendance
    cy.get('a[href*="attendance"]').click()
    cy.url().should('include', '/attendance')
    cy.contains('Attendance Tracking').should('be.visible')
  })
})

describe('Document Management', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123')
    cy.visit('/documents')
  })

  it('should display documents list', () => {
    cy.get('[data-testid="documents-list"]').should('be.visible')
    cy.get('[data-testid="document-item"]').should('have.length.at.least', 1)
  })

  it('should upload a document', () => {
    cy.get('button').contains('Upload Document').click()
    cy.get('input[type="file"]').selectFile('cypress/fixtures/sample.pdf')
    cy.get('button[type="submit"]').click()
    
    cy.contains('Document uploaded successfully').should('be.visible')
  })

  it('should download a document', () => {
    cy.get('[data-testid="download-button"]').first().click()
    cy.readFile('cypress/downloads/sample.pdf').should('exist')
  })
})

describe('Attendance Tracking', () => {
  beforeEach(() => {
    cy.login('admin@example.com', 'password123')
    cy.visit('/attendance')
  })

  it('should display attendance statistics', () => {
    cy.get('[data-testid="attendance-stats"]').should('be.visible')
    cy.contains('Total Sessions').should('be.visible')
    cy.contains('Average Attendance').should('be.visible')
  })

  it('should mark attendance', () => {
    cy.get('button').contains('Mark Attendance').click()
    cy.get('select[name="status"]').select('present')
    cy.get('button[type="submit"]').click()
    
    cy.contains('Attendance recorded successfully').should('be.visible')
  })

  it('should export attendance data', () => {
    cy.get('button').contains('Export CSV').click()
    cy.readFile('cypress/downloads/attendance.csv').should('exist')
  })
})

describe('Responsive Design', () => {
  const viewports = [
    { name: 'mobile', width: 375, height: 667 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 720 }
  ]

  viewports.forEach(({ name, width, height }) => {
    it(`should display correctly on ${name}`, () => {
      cy.viewport(width, height)
      cy.visit('/login')
      
      cy.get('input[type="email"]').should('be.visible')
      cy.get('input[type="password"]').should('be.visible')
      cy.get('button[type="submit"]').should('be.visible')
    })
  })
})