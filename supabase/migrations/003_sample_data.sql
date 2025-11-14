-- Sample data for LMS Portal testing and development

-- Insert sample admin users
INSERT INTO users (id, email, role, first_name, last_name, phone) VALUES
(uuid_generate_v4(), 'admin1@lmsportal.com', 'admin', 'John', 'Doe', '+1234567890'),
(uuid_generate_v4(), 'admin2@lmsportal.com', 'admin', 'Jane', 'Smith', '+1234567891');

-- Insert sample student users
INSERT INTO users (id, email, role, first_name, last_name, phone) VALUES
(uuid_generate_v4(), 'student1@lmsportal.com', 'student', 'Alice', 'Johnson', '+1234567892'),
(uuid_generate_v4(), 'student2@lmsportal.com', 'student', 'Bob', 'Williams', '+1234567893'),
(uuid_generate_v4(), 'student3@lmsportal.com', 'student', 'Carol', 'Brown', '+1234567894'),
(uuid_generate_v4(), 'student4@lmsportal.com', 'student', 'David', 'Davis', '+1234567895');

-- Get admin IDs for internship creation
WITH admin_ids AS (
    SELECT id FROM users WHERE role = 'admin' LIMIT 1
)
INSERT INTO internships (
    title, description, requirements, duration, start_date, end_date,
    organizer_name, organizer_email, organizer_phone, organizer_logo,
    institute_name, institute_address, status, created_by
) 
SELECT 
    'Software Development Internship',
    'Join our team as a software development intern and gain hands-on experience with modern web technologies. You will work on real projects and learn from experienced developers.',
    ARRAY['Currently pursuing Computer Science degree', 'Basic knowledge of JavaScript', 'Strong problem-solving skills', 'Good communication skills'],
    '3 months',
    CURRENT_DATE + INTERVAL '1 month',
    CURRENT_DATE + INTERVAL '4 months',
    'TechCorp Solutions',
    'hr@techcorp.com',
    '+1234567800',
    'https://example.com/logos/techcorp.png',
    'State University',
    '123 University Ave, Tech City, TC 12345',
    'published',
    id
FROM admin_ids;

-- Insert more sample internships
WITH admin_ids AS (
    SELECT id FROM users WHERE role = 'admin' LIMIT 1
)
INSERT INTO internships (
    title, description, requirements, duration, start_date, end_date,
    organizer_name, organizer_email, organizer_phone,
    institute_name, institute_address, status, created_by
) 
SELECT 
    'Data Science Internship',
    'Learn data analysis, machine learning, and statistical modeling in this comprehensive data science internship program.',
    ARRAY['Pursuing degree in Statistics, Mathematics, or Computer Science', 'Python programming knowledge', 'Basic statistics knowledge', 'Analytical mindset'],
    '4 months',
    CURRENT_DATE + INTERVAL '2 weeks',
    CURRENT_DATE + INTERVAL '4.5 months',
    'DataAnalytics Pro',
    'internships@dataanalytics.com',
    '+1234567801',
    'Technical Institute',
    '456 Institute Blvd, Data City, DC 67890',
    'published',
    id
FROM admin_ids
UNION ALL
SELECT 
    'Digital Marketing Internship',
    'Gain practical experience in digital marketing, social media management, and content creation strategies.',
    ARRAY['Pursuing Marketing or Communications degree', 'Creative thinking', 'Social media savvy', 'Basic graphic design skills'],
    '2 months',
    CURRENT_DATE + INTERVAL '3 weeks',
    CURRENT_DATE + INTERVAL '2.5 months',
    'Marketing Masters',
    'careers@marketingmasters.com',
    '+1234567802',
    'Business College',
    '789 Business St, Market City, MC 13579',
    'draft',
    id
FROM admin_ids;

-- Insert sample applications
WITH student_ids AS (
    SELECT id FROM users WHERE role = 'student'
),
internship_ids AS (
    SELECT id FROM internships WHERE status = 'published'
)
INSERT INTO applications (student_id, internship_id, status, cover_letter, documents)
SELECT 
    s.id,
    i.id,
    CASE 
        WHEN random() < 0.3 THEN 'approved'
        WHEN random() < 0.6 THEN 'rejected'
        ELSE 'pending'
    END,
    'I am very interested in this internship opportunity. My background and skills make me a strong candidate for this position. I am eager to learn and contribute to your organization.',
    ARRAY['https://example.com/documents/resume.pdf', 'https://example.com/documents/transcript.pdf']
FROM student_ids s
CROSS JOIN internship_ids i
WHERE random() < 0.7;

-- Insert sample courses
WITH internship_ids AS (
    SELECT id FROM internships
),
admin_ids AS (
    SELECT id FROM users WHERE role = 'admin'
)
INSERT INTO courses (title, description, content, duration, internship_id, instructor_id, materials)
SELECT 
    'Introduction to Web Development',
    'Learn the fundamentals of web development including HTML, CSS, and JavaScript.',
    'This course covers HTML structure, CSS styling, and JavaScript programming basics. Students will build their first website by the end of the course.',
    20,
    i.id,
    a.id,
    ARRAY['https://example.com/materials/html-guide.pdf', 'https://example.com/materials/css-basics.pdf']
FROM internship_ids i
CROSS JOIN admin_ids a
WHERE i.title = 'Software Development Internship'
LIMIT 1;

-- Insert more sample courses
WITH internship_ids AS (
    SELECT id FROM internships
),
admin_ids AS (
    SELECT id FROM users WHERE role = 'admin'
)
INSERT INTO courses (title, description, content, duration, internship_id, instructor_id, materials)
SELECT 
    'Data Analysis with Python',
    'Introduction to data analysis using Python programming language.',
    'Learn to use Python libraries like Pandas, NumPy, and Matplotlib for data analysis and visualization.',
    30,
    i.id,
    a.id,
    ARRAY['https://example.com/materials/python-intro.pdf', 'https://example.com/materials/pandas-guide.pdf']
FROM internship_ids i
CROSS JOIN admin_ids a
WHERE i.title = 'Data Science Internship'
LIMIT 1
UNION ALL
SELECT 
    'Social Media Marketing',
    'Learn effective social media marketing strategies and content creation.',
    'This course covers platform-specific strategies, content planning, and analytics for social media marketing.',
    15,
    i.id,
    a.id,
    ARRAY['https://example.com/materials/social-media-guide.pdf']
FROM internship_ids i
CROSS JOIN admin_ids a
WHERE i.title = 'Digital Marketing Internship'
LIMIT 1;

-- Insert sample student course enrollments
WITH approved_applications AS (
    SELECT student_id, internship_id 
    FROM applications 
    WHERE status = 'approved'
),
course_ids AS (
    SELECT id, internship_id FROM courses
)
INSERT INTO student_courses (student_id, course_id, progress)
SELECT 
    aa.student_id,
    ci.id,
    CASE 
        WHEN random() < 0.3 THEN 100
        WHEN random() < 0.7 THEN floor(random() * 80 + 10)::int
        ELSE 0
    END
FROM approved_applications aa
JOIN course_ids ci ON aa.internship_id = ci.internship_id
WHERE random() < 0.8;

-- Insert sample attendance records
WITH student_course_ids AS (
    SELECT id, student_id, course_id FROM student_courses
),
admin_ids AS (
    SELECT id FROM users WHERE role = 'admin'
)
INSERT INTO attendance (student_id, course_id, date, status, marked_by)
SELECT 
    sc.student_id,
    sc.course_id,
    CURRENT_DATE - INTERVAL '1 day' * floor(random() * 30),
    CASE 
        WHEN random() < 0.8 THEN 'present'
        WHEN random() < 0.9 THEN 'late'
        ELSE 'absent'
    END,
    a.id
FROM student_course_ids sc
CROSS JOIN admin_ids a
WHERE random() < 0.6;

-- Insert sample meetings
WITH internship_ids AS (
    SELECT id FROM internships
),
admin_ids AS (
    SELECT id FROM users WHERE role = 'admin'
)
INSERT INTO meetings (title, description, type, start_time, end_time, internship_id, organizer_id, location)
SELECT 
    'Weekly Team Meeting',
    'Regular team meeting to discuss progress and plan upcoming tasks.',
    'meeting',
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '10:00:00',
    CURRENT_DATE + INTERVAL '1 day' + INTERVAL '11:00:00',
    i.id,
    a.id,
    'Conference Room A'
FROM internship_ids i
CROSS JOIN admin_ids a
LIMIT 2
UNION ALL
SELECT 
    'Introduction to Web Development',
    'First class of the web development course.',
    'class',
    CURRENT_DATE + INTERVAL '2 days' + INTERVAL '14:00:00',
    CURRENT_DATE + INTERVAL '2 days' + INTERVAL '16:00:00',
    i.id,
    a.id,
    'Computer Lab 1'
FROM internship_ids i
CROSS JOIN admin_ids a
WHERE i.title = 'Software Development Internship'
LIMIT 1;

-- Insert sample documents
WITH internship_ids AS (
    SELECT id FROM internships
),
application_ids AS (
    SELECT id FROM applications
),
user_ids AS (
    SELECT id FROM users
)
INSERT INTO documents (name, type, file_url, file_size, mime_type, related_id, related_type, uploaded_by)
SELECT 
    'Software Development Internship - Offer Letter',
    'offer_letter',
    'https://example.com/documents/offer-letter-template.pdf',
    102400,
    'application/pdf',
    i.id::TEXT,
    'internship',
    u.id
FROM internship_ids i
CROSS JOIN user_ids u
WHERE u.role = 'admin'
LIMIT 2
UNION ALL
SELECT 
    'Course Material - HTML Basics',
    'material',
    'https://example.com/materials/html-basics.pdf',
    512000,
    'application/pdf',
    i.id::TEXT,
    'course',
    u.id
FROM internship_ids i
CROSS JOIN user_ids u
WHERE u.role = 'admin'
LIMIT 1;

-- Insert sample notifications
WITH user_ids AS (
    SELECT id FROM users
)
INSERT INTO notifications (user_id, title, message, type)
SELECT 
    u.id,
    CASE 
        WHEN random() < 0.3 THEN 'Application Approved!'
        WHEN random() < 0.6 THEN 'New Course Available'
        ELSE 'Meeting Reminder'
    END,
    CASE 
        WHEN type = 'Application Approved!' THEN 'Congratulations! Your application has been approved. Check your dashboard for next steps.'
        WHEN type = 'New Course Available' THEN 'A new course has been added to your internship program. Enroll now to start learning!'
        ELSE 'You have a meeting scheduled for tomorrow. Don''t forget to attend!'
    END,
    CASE 
        WHEN type = 'Application Approved!' THEN 'success'
        WHEN type = 'New Course Available' THEN 'info'
        ELSE 'warning'
    END
FROM user_ids u
WHERE random() < 0.7;